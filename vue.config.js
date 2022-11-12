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
        artifactName: '${productName}-${version}-${arch}.${ext}',
        win: {
          target: {
            target: 'portable',
            arch: [
              'x64',
            ],
          },
          icon: 'src/assets/icon.png',
          // eslint-disable-next-line no-template-curly-in-string
        },
        mac: {
          target: {
            target: 'dmg',
            arch: [
              'x64',
              'arm64',
            ],
          },
          icon: 'src/assets/icon.png',
          // eslint-disable-next-line no-template-curly-in-string
        },
      },
    },
  },
}
