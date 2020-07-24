import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import os from 'os'
import util from 'util'
import { parse as parseHTML } from 'node-html-parser'
import ConverterFactory from './converter-factory'

export default class BuilderApp extends EventEmitter {
  constructor(watcher) {
    super()
    this.watcher = watcher
    fs.mkdtemp(path.join(os.tmpdir(), 'markuprev-'), (err, directory) => {
      if (err) throw err
      this.tempDir = directory
      this.builtFile = path.join(directory, 'index.html')
      this.emit('ready')
    })
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
      const dom = parseHTML(html, {
        script: true,
        style: true,
        pre: true,
        comment: true,
      })

      // replace local link to absolute file path
      dom.querySelectorAll('img').forEach(img => {
        const src = img.getAttribute('src')
        if (!src.match(/\/\//) && !src.match(/^#/) && !src.match(/:/)) {
          img.setAttribute('src', `file://${path.join(this.watcher.dirname(), src)}`)
        }
      })
      dom.querySelectorAll('a').forEach(img => {
        const href = img.getAttribute('href')
        if (!href.match(/\/\//) && !href.match(/^#/) && !href.match(/:/)) {
          img.setAttribute('href', `file://${path.join(this.watcher.dirname(), href)}`)
        }
      })

      await util.promisify(fs.writeFile)(this.builtFile, dom.toString())
      this.emit('built', this.builtFile)
    } catch (e) {
      this.emit('failed', e)
    }
  }
}
