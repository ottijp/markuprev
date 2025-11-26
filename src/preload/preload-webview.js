import { ipcRenderer, webUtils } from 'electron'

window.onload = () => {
  document.body.style.height = '100vh'

  document.body.ondragover = (e) => {
    e.preventDefault()
  }

  document.ondrop = (e) => {
    e.preventDefault()

    // notify dropped file to host window
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      ipcRenderer.send('openFile', webUtils.getPathForFile(file))
    }
  }
}
