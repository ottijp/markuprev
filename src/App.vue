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
      v-toolbar-title {{ fileName }}
      v-spacer
      //- v-tooltip(bottom)
      //-   template(v-slot:activator="{ on, attrs }")
      //-     v-btn(icon @click="toggleDevTools" v-bind="attrs" v-on="on")
      //-       v-icon mdi-information
      //-   span Toggle DevTools
      v-tooltip(bottom)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon @click="rebuild" :disabled="building || removed" v-bind="attrs" v-on="on")
            v-icon mdi-reload
        span Rebuild
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
} = window.electron

export default {
  name: 'App',

  data: () => ({
    builderApp: null,
    build: { status: 'ready' },
    previewScrollY: 0,
  }),

  computed: {
    // webviewUri: state => `data:text/html;charset=utf-8,${encodeURIComponent(state.html)}`,
    building: state => state.build.status === 'building',
    failed: state => state.build.status === 'failed',
    removed: state => state.build.status === 'removed',
    fileName: state => state.builderApp.watcher.name(),
    filePath: state => state.builderApp.watcher.fullName(),
  },

  mounted() {
    document.ondragover = (e) => {
      e.preventDefault()
    }
    document.ondrop = (e) => {
      e.preventDefault()
    }
    document.body.addEventListener('drop', (e) => {
      const filePath = e.dataTransfer.files[0].path
      this.openFile(filePath)
    })
    // FIXME: no event fired on webview
    // this.getPreviewContent().ondragover = (e) => {
    //   e.preventDefault()
    // }
    // this.getPreviewContent().ondrop = (e) => {
    //   e.preventDefault()
    // }
    // this.getPreviewContent().addEventListener('drop', (e) => {
    //   const filePath = e.dataTransfer.files[0].path
    //   this.openFile(filePath)
    // })

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
        console.log('failed', e)
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
      this.builderApp.startWatch()
    },

    // toggleDevTools() {
    //   getCurrentWindow().toggleDevTools()
    // },

    async rebuild() {
      this.builderApp.build()
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
      return previewContent && previewContent.src.match(/^blob:http/) !== null
    },

    async webviewDidLoad() {
      if (this.isSourcePage()) {
        await this.restorePosition()
      }
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
