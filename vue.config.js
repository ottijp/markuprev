module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      preload: {
        preload: 'src/preload.js',
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
