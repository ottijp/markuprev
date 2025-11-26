import path from 'path'

const asciidoctor = require('asciidoctor')()

export default class BuiltinConverterAdoc {
  // ignore because this method is protocol
  async convert(file) {
    const convertParams = {
      base_dir: file.dirname,
      standalone: true,
      attributes: {},
    }
    // original css (node_modules/@asciidoctor/core/dist/css/asciidoctor.css) will not be bundled
    // in app.
    // so for workaround, copy of ascidoctor.css exists in `public/css/asciidoctor.css`.
    //
    // in development, this app can't read asciidoctor.css which exsits in
    // `public/css/asciidoctor.css` because it isn't in parent directory.
    // so safe attribute must be `unsafe`.
    // in development, asciidoctor.css will be bundled in app directory.
    // so safe attribute can be `safe`.
    convertParams.safe = process.env.NODE_ENV === 'development' ? 'unsafe' : 'safe'
    // in development, asciidoctor.js isn't in `./css/asciidoctor.js` but
    // `./public/css/asciidoctor.js`. so stylesheet attribute should be set.
    // in production, asciidoctor.js import `./css/asciidoctor.js` as default. so stylesheet
    // attribute should not be set.
    if (process.env.NODE_ENV === 'development') {
      convertParams.attributes.stylesheet = path.join(__dirname, '..', '..', 'resources', 'css', '/asciidoctor.css')
    }

    return asciidoctor.convert(await file.content(), convertParams)
  }
}
