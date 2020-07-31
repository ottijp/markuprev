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
    preloadWebView: `file://${path.join(__dirname, 'preload-webview.js')}`,
    isDebug: process.env.WEBPACK_DEV_SERVER_URL && !process.env.IS_TEST,
  }
})

// set PATH env
const isMac = process.platform === 'darwin'
if (isMac) {
  process.env.PATH = `${process.env.PATH}${path.delimiter}/usr/local/bin`
}
