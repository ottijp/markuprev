import { remote } from 'electron'
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
