import nodeWatch from 'node-watch'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export default class FileWatcher {
  constructor(filePath) {
    this.filePath = path.normalize(filePath)
    this.fileHash = ''
  }

  name() {
    return path.basename(this.filePath)
  }

  dirname() {
    return path.dirname(this.filePath)
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
      if (event === 'update') {
        const contents = fs.readFileSync(this.filePath)
        const md5hash = crypto.createHash('md5')
        md5hash.update(contents)
        const hash = md5hash.digest('hex')
        if (this.fileHash === hash) {
          // file not really changed
          return
        }
        this.fileHash = hash
      }
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
