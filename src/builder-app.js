import { EventEmitter } from 'events'
import fs from 'fs'
import path from 'path'
import os from 'os'
import util from 'util'
import { parse as parseHTML } from 'node-html-parser'
import datauri from 'datauri'
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
    const converter = ConverterFactory.makeConverter(this.watcher.file)
    if (!converter) {
      this.emit('failed', new Error(`No converter found for ${this.watcher.file.ext}`))
      return
    }
    try {
      this.emit('building')
      const html = await converter.convert(this.watcher.file)
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
          img.setAttribute('src', `file://${path.join(this.watcher.file.dirname, src)}`)
        }
      })
      dom.querySelectorAll('a').forEach(img => {
        const href = img.getAttribute('href')
        if (!href.match(/\/\//) && !href.match(/^#/) && !href.match(/:/)) {
          img.setAttribute('href', `file://${path.join(this.watcher.file.dirname, href)}`)
        }
      })

      await util.promisify(fs.writeFile)(this.builtFile, dom.toString())
      this.emit('built', this.builtFile)
    } catch (e) {
      this.emit('failed', e)
    }
  }

  async saveHTML(filePath) {
    const converter = ConverterFactory.makeConverter(this.watcher.file)
    if (!converter) {
      this.emit('failed', new Error(`No converter found for ${this.watcher.file.ext}`))
      return
    }
    try {
      this.emit('saving')
      const html = await converter.convert(this.watcher.file)
      const dom = parseHTML(html, {
        script: true,
        style: true,
        pre: true,
        comment: false,
      })

      // replace local image to data-uri
      // eslint-disable-next-line no-restricted-syntax
      for await (const img of dom.querySelectorAll('img')) {
        const src = img.getAttribute('src')
        if (!src.match(/\/\//) && !src.match(/^#/) && !src.match(/:/)) {
          // generate data-uri
          const f = `${path.join(this.watcher.file.dirname, src)}`
          const du = await datauri(f)
          img.setAttribute('src', du)
        }
      }

      await util.promisify(fs.writeFile)(filePath, dom.toString())
      this.emit('saved', this.builtFile)
    } catch (e) {
      this.emit('failed', e)
    }
  }
}
