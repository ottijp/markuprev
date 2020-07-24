import Converter from './converter'

const isWin = process.platform.match(/^win/)

export default class ConverterFactory {
  constructor(config) {
    this.config = config
  }

  static makeConverter(ext) {
    // return new Converter(this.config.getCommand(fileType))
    switch (ext) {
      case 'adoc':
        return new Converter(isWin ? 'asciidoctor.bat' : 'asciidoctor', ['-o', '-', '-'])
      case 'md':
        return new Converter('pandoc', ['-f', 'markdown', '-t', 'html'])
      default:
        return null
    }
  }
}
