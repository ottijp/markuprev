import { remote } from 'electron'
import path from 'path'
import BuilderApp from './builder-app'
import FileWatcher from './file-watcher'

process.once('loaded', () => {
  window.electron = {
    dialog: remote.dialog,
    getCurrentWindow: remote.getCurrentWindow,
    BuilderApp,
    FileWatcher,
  }
})

// set PATH env
process.env.PATH = `${process.env.PATH}${path.delimiter}/usr/local/bin`
