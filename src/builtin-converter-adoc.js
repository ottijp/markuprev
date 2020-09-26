import path from 'path'

const asciidoctor = require('asciidoctor')()

export default class BuiltinConverterAdoc {
  // ignore because this method is protocol
  /* eslint class-methods-use-this: 0 */
  convert(source) {
    return asciidoctor.convert(source, {
      standalone: true,
      attributes: {
        linkcss: false,
        stylesheet: path.join(__static, 'asciidoctor.css'),
        icons: 'font',
      },
    })
  }
}
