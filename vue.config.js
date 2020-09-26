module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      // workaround: preload depending modules will not be hot reloaded
      preload: {
        preload: 'src/preload.js',
        'preload-webview': 'src/preload-webview.js',
        BuilderApp: 'src/builder-app.js',
        FileWatcher: 'src/file-watcher.js',
        ConverterFactory: 'src/converter-factory.js',
        Converter: 'src/converter.js',
        'buildin-converter-md': 'src/builtin-converter-md.js',
        'buildin-converter-adoc': 'src/builtin-converter-adoc.js',
        MenuTemplate: 'src/menu-template.js',
      },
      builderOptions: {
        appId: 'biz.sakao.markuprev',
        win: {
          target: {
            target: 'portable',
            arch: [
              'x64',
              'ia32',
            ],
          },
          icon: 'src/assets/icon.png',
          // eslint-disable-next-line no-template-curly-in-string
          artifactName: '${productName}.${ext}',
        },
        mac: {
          target: 'dmg',
          icon: 'src/assets/icon.png',
          // eslint-disable-next-line no-template-curly-in-string
          artifactName: '${productName}.${ext}',
        },
      },
    },
  },
}
