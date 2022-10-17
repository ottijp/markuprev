import nodeWatch from 'node-watch'
import MarkupFile from './markup-file'

export default class FileWatcher {
  constructor(filePath) {
    this.file = new MarkupFile(filePath)
    this.fileHash = ''
  }

  watch(fn) {
    this.watcher = nodeWatch(this.file.path, async event => {
      if (event === 'update') {
        const hash = await this.file.hash()
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
}
