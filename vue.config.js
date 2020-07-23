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
        BuilderApp: 'src/builder-app.js',
        FileWatcher: 'src/file-watcher.js',
        ConverterFactory: 'src/converter-factory.js',
        Converter: 'src/converter.js',
        MenuTemplate: 'src/menu-template.js',
      },
      builderOptions: {
        appId: 'biz.sakao.markuprev',
        win: {
          target: 'portable',
          icon: 'src/assets/icon.png',
        },
        mac: {
          target: 'dmg',
          icon: 'src/assets/icon.png',
        },
      },
    },
  },
}
