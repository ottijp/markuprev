import {
  app, protocol, BrowserWindow, Menu,
} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import minimist from 'minimist'
import menuTemplate from './menu-template'

const isDevelopment = process.env.NODE_ENV !== 'production'
const args = minimist(process.argv.slice(isDevelopment ? 2 : 1))

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

function createWindow(filePath) {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    minWidth: 400,
    minHeight: 200,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
      // for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: filePath ? [`--file=${filePath}`] : undefined,
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

app.on('second-instance', (event, commandLine) => {
  const args2 = minimist(commandLine.slice(isDevelopment ? 2 : 1))
  if (args2._.length > 0) {
    // if has args, open files in args
    args2._.forEach(filePath => {
      createWindow(filePath)
    })
  } else {
    // if has no args, create empty window or focus exising window
    const wins = BrowserWindow.getAllWindows()
    if (wins.length === 0) {
      createWindow()
    } else {
      if (wins[0].isMinimized()) {
        wins[0].restore()
      }
      wins[0].show()
    }
  }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // terminate duplicate app instance
  if (!app.requestSingleInstanceLock()) {
    app.quit()
    return
  }

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  // workaround for electon bug
  // https://github.com/electron/electron/issues/20700#issuecomment-573847842
  protocol.registerFileProtocol('tron', (request, callback) => {
    callback({ path: path.normalize(decodeURIComponent(request.url.substr(6))) })
  })

  const menu = Menu.buildFromTemplate(menuTemplate({
    onNew: () => createWindow(),
  }))
  Menu.setApplicationMenu(menu)

  // create initial windows
  if (args._.length > 0) {
    // if has args, open files in args
    args._.forEach(filePath => {
      createWindow(filePath)
    })
  } else {
    // if has no args, open empty window
    createWindow()
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
