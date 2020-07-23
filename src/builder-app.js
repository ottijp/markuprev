import { EventEmitter } from 'events'
import ConverterFactory from './converter-factory'

export default class BuilderApp extends EventEmitter {
  constructor(watcher) {
    super()
    this.watcher = watcher
    this.emit('ready')
  }

  async startWatch() {
    this.watcher.watch(event => {
      if (event === 'update') this.build()
      else if (event === 'remove') this.emit('removed')
    })
    await this.build()
  }

  async stopWatch() {
    await this.watcher.unwatch()
  }

  async build() {
    const converter = ConverterFactory.makeConverter(this.watcher.ext())
    if (!converter) {
      this.emit('failed', new Error(`No converter found for ${this.watcher.ext()}`))
      return
    }
    try {
      this.emit('building')
      const html = await converter.convert(await this.watcher.data())
      this.emit('built', html)
    } catch (e) {
      this.emit('failed', e)
    }
  }
}
