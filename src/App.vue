<template lang="pug">
v-app
  div(v-if="!builderApp")
    v-main.vh100
      v-container.fill-height
        v-row(justify="center")
          v-col(cols="8").droparea
            v-row(justify="center" align="center").fill-height
              v-col(cols="12")
                v-row(justify="center")
                  p.text-h4 Drop file here
                v-row(justify="center")
                  p.text-body (*.adoc, *.md)
              v-col(cols="12")
                v-row(justify="center")
                  v-btn(@click="openDialog" color="primary" x-large) or Open in dialog

  div(v-else)
    v-app-bar(app dense dark)
      v-btn(@click="openDialog" :disabled="building") Open
      v-spacer
      div(v-if="isDebug")
        v-tooltip(bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon @click="toggleDevTools" v-bind="attrs" v-on="on")
              v-icon mdi-information
          span Toggle DevTools
        v-tooltip(bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon @click="toggleWebViewDevTools" v-bind="attrs" v-on="on")
              v-icon mdi-information
          span Toggle WebView DevTools
      v-btn-toggle.mx-5
        v-btn(icon @click="zoomOut" :disabled="building || removed || !canZoomOut")
          v-icon mdi-minus
        v-btn(@click="zoom100" :disabled="building || removed" width="75") {{ zoomFactorPercent }}%
        v-btn(icon @click="zoomIn" :disabled="building || removed || !canZoomIn")
          v-icon mdi-plus
      v-tooltip(bottom)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon @click="rebuild" :disabled="building || removed" v-bind="attrs" v-on="on")
            v-icon mdi-reload
        span Rebuild
      v-tooltip(bottom)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon @click="save" :disabled="saving || removed" v-bind="attrs" v-on="on")
            v-icon mdi-export
        span Save HTML
    v-main.vh100(v-if="building")
      v-container
        p Bulding...
    v-main.vh100(v-else-if="failed")
      v-container
        p Build failed
        pre {{ build.errorMessage }}
    v-main.vh100(v-else-if="removed")
      v-container
        p File removed
    v-main.vh100(v-else)
      // FIXME: can't inspect elements in webview.
      //        iframe doesn't have enought function for mark/restore scroll position.
      webview#previewContent.align-self-stretch.flex-grow-1(
        :src="build.url"
        :preload="preloadWebView"
        @did-finish-load="webviewDidLoad"
        )

    v-footer(app)
      v-container(fluid).ma-1.pa-1
        v-row(no-gutters)
          span {{ filePath }}
</template>

<script>
// exported in preload.js
const {
  dialog,
  getCurrentWindow,
  BuilderApp,
  FileWatcher,
  args,
  preloadWebView,
  isDebug,
} = window.electron

export default {
  name: 'App',

  data: () => ({
    builderApp: null,
    build: { status: 'ready' },
    previewScrollY: 0,
    zoomFactorPercent: 100,
  }),

  computed: {
    // webviewUri: state => `data:text/html;charset=utf-8,${encodeURIComponent(state.html)}`,
    building: state => state.build.status === 'building',
    failed: state => state.build.status === 'failed',
    removed: state => state.build.status === 'removed',
    saving: state => state.build.status === 'saving',
    fileName: state => state.builderApp.watcher.name(),
    fileNameWithoutExt: state => state.builderApp.watcher.nameWithoutExt(),
    filePath: state => state.builderApp.watcher.fullName(),
    preloadWebView: () => preloadWebView,
    isDebug: () => isDebug,
    canZoomOut: state => state.zoomFactorPercent > 25,
    canZoomIn: state => state.zoomFactorPercent < 500,
  },

  mounted() {
    document.ondragover = (e) => {
      e.preventDefault()
    }

    document.ondrop = (e) => {
      e.preventDefault()
      if (e.dataTransfer.files.length > 0) {
        const filePath = e.dataTransfer.files[0].path
        this.openFile(filePath)
      }
    }

    getCurrentWindow().webContents.on('did-attach-webview', () => {
      this.getPreviewContent().addEventListener('ipc-message', e => {
        if (e.channel === 'ondropfile') {
          const filePath = e.args[0]
          this.openFile(filePath)
        }
      })
    })

    if (args.file) {
      this.openFile(args.file)
    }
  },

  methods: {
    async openDialog() {
      const dresult = await dialog.showOpenDialog(getCurrentWindow())
      if (dresult.canceled || dresult.filePaths.length < 1) {
        return
      }

      const [filePath] = dresult.filePaths
      this.openFile(filePath)
    },

    async openFile(filePath) {
      if (this.builderApp) {
        await this.builderApp.stopWatch()
        this.builderApp = null
      }

      this.build = { status: 'ready' }
      this.builderApp = new BuilderApp(new FileWatcher(filePath))
      this.builderApp.on('built', builtFile => {
        const url = `file://${builtFile}`
        this.build = {
          status: 'built',
          url,
        }
      })
      this.builderApp.on('failed', e => {
        this.build = {
          status: 'failed',
          errorMessage: e,
        }
      })
      this.builderApp.on('building', async () => {
        if (!this.building && this.isSourcePage()) {
          this.markPosition()
        }
        this.build = {
          status: 'building',
        }
      })
      this.builderApp.on('removed', async () => {
        this.build = {
          status: 'removed',
        }
      })
      this.builderApp.on('saving', async () => {
        this.build = {
          status: 'saving',
        }
      })
      this.builderApp.on('saved', async () => {
        this.build = {
          status: 'saved',
        }
      })
      this.builderApp.startWatch()

      this.zoomFactorPercent = 100
    },

    async saveHTML(filePath) {
      await this.builderApp.saveHTML(filePath)
    },

    toggleDevTools() {
      getCurrentWindow().toggleDevTools()
    },

    toggleWebViewDevTools() {
      if (this.getPreviewContent().isDevToolsOpened()) {
        this.getPreviewContent().closeDevTools()
      } else {
        this.getPreviewContent().openDevTools()
      }
    },

    async rebuild() {
      this.builderApp.build()
    },

    async save() {
      const dresult = await dialog.showSaveDialog(getCurrentWindow(), {
        defaultPath: `${this.fileNameWithoutExt}.html`,
      })
      if (dresult.canceled || !dresult.filePath) {
        return
      }

      this.saveHTML(dresult.filePath)
    },

    getPreviewContent() {
      return document.getElementById('previewContent')
    },

    async markPosition() {
      this.previewScrollY = await this.getPreviewContent().executeJavaScript('window.scrollY')
    },

    async restorePosition() {
      await this.getPreviewContent().executeJavaScript(`window.scrollTo(0, ${this.previewScrollY})`)
    },

    isSourcePage() {
      const previewContent = this.getPreviewContent()
      return previewContent && previewContent.src.match(/^file:\/\//) !== null
    },

    async webviewDidLoad() {
      if (this.isSourcePage()) {
        await this.restorePosition()
      }
    },

    zoomIn() {
      this.zoomFactorPercent += 10
      this.getPreviewContent().setZoomFactor(this.zoomFactorPercent / 100)
    },

    zoomOut() {
      this.zoomFactorPercent -= 10
      this.getPreviewContent().setZoomFactor(this.zoomFactorPercent / 100)
    },

    zoom100() {
      this.zoomFactorPercent = 100
      this.getPreviewContent().setZoomFactor(this.zoomFactorPercent / 100)
    },
  },
}
</script>

<style lang="stylus">
#previewContent
  height 100%
  width 100%
.vh100
  height 100vh
.droparea
  height: 500px
  border 10px gray dashed
  border-radius 10px
</style>
