import nodeWatch from 'node-watch'
import path from 'path'
import fs from 'fs'

export default class FileWatcher {
  constructor(filePath) {
    this.filePath = path.normalize(filePath)
  }

  name() {
    return path.basename(this.filePath)
  }

  fullName() {
    return this.filePath
  }

  ext() {
    const extname = path.extname(this.filePath)
    return extname === '' ? extname : extname.substr(1)
  }

  watch(fn) {
    this.watcher = nodeWatch(this.filePath, event => {
      fn(event)
    })
  }

  async unwatch() {
    await this.watcher.close()
  }

  data() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.fullName(), 'utf8', (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }
}
