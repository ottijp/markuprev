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
        /* eslint-disable-next-line no-template-curly-in-string */
        artifactName: '${productName}-${version}-${arch}.${ext}',
        win: {
          target: {
            target: 'portable',
            arch: [
              'x64',
            ],
          },
          icon: 'src/assets/icon.png',
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
        },
      },
    },
  },
}
