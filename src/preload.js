import { remote } from 'electron'
import path from 'path'
import minimist from 'minimist'
import BuilderApp from './builder-app'
import FileWatcher from './file-watcher'

const args = minimist(process.argv)

process.once('loaded', () => {
  window.electron = {
    dialog: remote.dialog,
    getCurrentWindow: remote.getCurrentWindow,
    BuilderApp,
    FileWatcher,
    args,
  }
})

// set PATH env
process.env.PATH = `${process.env.PATH}${path.delimiter}/usr/local/bin`
