import Converter from './converter'

export default class ConverterFactory {
  constructor(config) {
    this.config = config
  }

  static makeConverter(ext) {
    // return new Converter(this.config.getCommand(fileType))
    switch (ext) {
      case 'adoc':
        return new Converter('asciidoctor', ['-o', '-', '-'])
      case 'md':
        return new Converter('pandoc', ['-f', 'markdown', '-t', 'html'])
      default:
        return null
    }
  }
}
