import { remote } from 'electron'
import BuilderApp from './builder-app'
import FileWatcher from './file-watcher'

window.addEventListener('beforeunload', ev => {
  // prevent reloading/closing
  ev.returnValue = true
})

process.once('loaded', () => {
  window.electron = {
    dialog: remote.dialog,
    getCurrentWindow: remote.getCurrentWindow,
    BuilderApp,
    FileWatcher,
  }
})
