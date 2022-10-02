import path from 'path'

const asciidoctor = require('asciidoctor')()

export default class BuiltinConverterAdoc {
  // ignore because this method is protocol
  // eslint-disable-next-line class-methods-use-this
  async convert(file) {
    return asciidoctor.convert(await file.content(), {
      standalone: true,
      attributes: {
        linkcss: false,
        stylesheet: path.join(__static, 'asciidoctor.css'),
        icons: 'font',
      },
    })
  }
}
