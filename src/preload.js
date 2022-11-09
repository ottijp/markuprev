const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  openFile: (filePath) => ipcRenderer.send('openFile', filePath),
  rebuild: () => ipcRenderer.send('rebuild'),
  save: () => ipcRenderer.send('save'),
  openInitialFile: () => ipcRenderer.send('openInitialFile'),
  toggleDevTools: () => ipcRenderer.send('toggleDevTools'),
  isDebug: () => ipcRenderer.invoke('isDebug'),
  contentViewPreloadPath: () => ipcRenderer.invoke('contentViewPreloadPath'),

  onFileOpened: (callback) => ipcRenderer.on('opened', callback),
  onBuilding: (callback) => ipcRenderer.on('building', callback),
  onBuilt: (callback) => ipcRenderer.on('built', callback),
  onError: (callback) => ipcRenderer.on('error', callback),
  onRemoved: (callback) => ipcRenderer.on('removed', callback),
  onSaving: (callback) => ipcRenderer.on('saving', callback),
  onSaved: (callback) => ipcRenderer.on('saved', callback),
})
