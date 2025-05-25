<template lang="pug">
v-app
  template(v-if="isDropAreaShown")
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

  template(v-else)
    v-app-bar(app dense dark)
      v-btn(@click="openDialog" :disabled="!isOpenDiableEnalbed") Open
      v-spacer
      div(v-if="isDebug")
        v-tooltip(bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon @click="toggleDevTools" v-bind="attrs" v-on="on")
              v-icon mdi-information
          span Toggle DevTools
        v-tooltip(bottom)
          template(v-slot:activator="{ on, attrs }")
            v-btn(icon @click="toggleContentViewDevTools" v-bind="attrs" v-on="on")
              v-icon mdi-information
          span Toggle ContentView DevTools
      v-btn-toggle.mx-5
        v-btn(icon @click="zoomOut" :disabled="!isZoomOutEnalbed")
          v-icon mdi-minus
        v-btn(@click="zoom100" :disabled="!isZoom100Enabled" width="75") {{ zoomFactorPercent }}%
        v-btn(icon @click="zoomIn" :disabled="!isZoomInEnalbed")
          v-icon mdi-plus
      v-tooltip(bottom)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon @click="rebuild" :disabled="!isBuildEnabled" v-bind="attrs" v-on="on")
            v-icon mdi-reload
        span Rebuild
      v-tooltip(bottom)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon @click="save" :disabled="!isSaveEnabled" v-bind="attrs" v-on="on")
            v-icon mdi-export
        span Save HTML
    // workaround: v-main won't be resized depend on the height of v-footer. (bug?)
    // so, I didn't applied `app` attribute on v-footer and applied `flex-grow` class on v-main.
    v-main(v-if="buildState === 'error'")
      v-container
        p Build error
        pre {{ errorMessage }}
    v-main(v-else-if="buildState === 'removed'")
      v-container
        p File removed
    v-main(v-else)
      webview#previewContent.align-self-stretch.flex-grow-1(
        allowpopups="true"
        :src="contentUrl"
        :preload="contentViewPreloadUrl"
        @did-attach="contentViewDidAttach"
        @dom-ready="contentViewDomReady"
        )

    v-footer.d-flex.flex-nowrap
      v-tooltip(top)
        template(v-slot:activator="{ on, attrs }")
          v-btn(icon small @click="toggleHideFilePath" v-bind="attrs" v-on="on").mx-1.flex-shrink-0
            v-icon {{ toggleHideFilePathIcon }}
        span-path {{ toggleHideFilePathToolTip }}
      span(v-if="!isHideFilePath").mx-1.flex-grow-1.text-caption.file-path {{ filePath }}
      span(v-else).flex-grow-1
      v-progress-circular(v-if="buildState === 'building'", indeterminate, size="20"
      width="2").mx-1.flex-shrink-0
</template>

<script>
export default {
  name: 'App',

  data: () => ({
    buildState: 'waiting-file',
    errorMessage: '',
    zoomFactorPercent: 100,
    isDebug: false,
    contentUrl: '',
    filePath: '',
    isHideFilePath: false,
    contentViewPreloadUrl: '',
    contentViewReady: false,
  }),

  computed: {
    isDropAreaShown: state => state.buildState === 'waiting-file',
    isOpenDiableEnalbed: state => state.buildState !== 'building' && state.buildState !== 'saving',
    isZoomOutEnalbed: state => state.zoomFactorPercent > 25 && state.buildState !== 'removed' && state.buildState !== 'building',
    isZoomInEnalbed: state => state.zoomFactorPercent < 500 && state.buildState !== 'removed' && state.buildState !== 'building',
    isZoom100Enabled: state => state.buildState !== 'removed' && state.buildState !== 'building',
    isBuildEnabled: state => state.buildState !== 'removed' && state.buildState !== 'building',
    isSaveEnabled: state => state.buildState !== 'removed' && state.buildState !== 'saving',
    toggleHideFilePathToolTip: state => (state.isHideFilePath ? 'Show file path' : 'Hide file path'),
    toggleHideFilePathIcon: state => (state.isHideFilePath ? 'mdi-eye-outline' : 'mdi-eye-off-outline'),
  },

  async mounted() {
    document.ondragover = (e) => {
      e.preventDefault()
    }

    document.ondrop = (e) => {
      e.preventDefault()
      if (e.dataTransfer.files.length > 0) {
        const filePath = e.dataTransfer.files[0].path
        window.api.openFile(filePath)
      }
    }

    window.api.onFileOpened((event, filePath) => {
      this.filePath = filePath
      if (this.getContentView()) {
        this.zoom100()
      }
      this.buildState = 'ready'
    })

    window.api.onBuilding(() => {
      this.buildState = 'building'
    })

    window.api.onBuilt((event, builtFilePath) => {
      if (this.contentViewReady) {
        this.getContentView().reload()
      }
      this.buildState = 'built'
      this.contentUrl = `file://${builtFilePath}`
    })

    window.api.onError((event, errorMessage) => {
      this.buildState = 'error'
      this.errorMessage = errorMessage
    })

    window.api.onRemoved(() => {
      this.buildState = 'removed'
    })

    window.api.onSaving(() => {
      this.buildState = 'saving'
    })

    window.api.onSaved(() => {
    })

    this.isDebug = await window.api.isDebug()
    this.contentViewPreloadUrl = `file://${await window.api.contentViewPreloadPath()}`

    window.api.openInitialFile()
  },

  methods: {
    async openDialog() {
      window.api.openFile()
    },

    toggleDevTools() {
      window.api.toggleDevTools()
    },

    toggleContentViewDevTools() {
      if (this.getContentView().isDevToolsOpened()) {
        this.getContentView().closeDevTools()
      } else {
        this.getContentView().openDevTools()
      }
    },

    async rebuild() {
      window.api.rebuild()
    },

    async save() {
      window.api.save()
    },

    getContentView() {
      return document.getElementById('previewContent')
    },

    contentViewDidAttach(event) {
      // listen drop event from guest webview
      event.target.addEventListener('ipc-message', e => {
        if (e.channel === 'ondropfile') {
          const filePath = e.args[0]
          window.api.openFile(filePath)
        }
      })
    },

    contentViewDomReady() {
      this.contentViewReady = true
      this.getContentView().executeJavaScript(`
        Array.from(document.querySelectorAll('a')).forEach(a => {
          const href = a.getAttribute('href')
          if (href && !href.match(/^#/)) {
            a.setAttribute('target', '_blank')
            a.setAttribute('rel', 'noopener noreferrer')
          }
        })
      `)
    },

    zoomIn() {
      this.zoomFactorPercent += 10
      this.getContentView().setZoomFactor(this.zoomFactorPercent / 100)
    },

    zoomOut() {
      this.zoomFactorPercent -= 10
      this.getContentView().setZoomFactor(this.zoomFactorPercent / 100)
    },

    zoom100() {
      this.zoomFactorPercent = 100
      this.getContentView().setZoomFactor(this.zoomFactorPercent / 100)
    },

    toggleHideFilePath() {
      this.isHideFilePath = !this.isHideFilePath
    },
  },
}
</script>

<style lang="stylus">
#previewContent
  height 100%
  width 100%
.droparea
  height: 500px
  border 10px gray dashed
  border-radius 10px
.file-path
  word-break: break-all
</style>
