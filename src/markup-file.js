import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export default class MarkupFile {
  constructor(filePath) {
    this.path = path.normalize(filePath)
    this.name = path.basename(filePath)
    this.nameWithoutExt = path.basename(filePath, path.extname(filePath))
    this.dirname = path.dirname(filePath)
    const extname = path.extname(filePath)
    this.ext = extname === '' ? extname : extname.substr(1)
  }

  async content() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'utf8', (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  async hash() {
    const md5hash = crypto.createHash('md5')
    md5hash.update(await this.content())
    return md5hash.digest('hex')
  }
}
