import path from 'path'
const asciidoctor = require('asciidoctor')()

export default class BuiltinConverterAdoc {
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
