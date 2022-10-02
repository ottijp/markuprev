import BuiltinConverterMd from './builtin-converter-md'
import BuiltinConverterAdoc from './builtin-converter-adoc'

export default class ConverterFactory {
  constructor(config) {
    this.config = config
  }

  static makeConverter(file) {
    switch (file.ext) {
      case 'adoc':
        return new BuiltinConverterAdoc()
      case 'md':
        return new BuiltinConverterMd()
      default:
        return null
    }
  }
}
