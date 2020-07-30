import { ipcRenderer } from 'electron'

window.onload = () => {
  document.body.style.height = '100vh'

  document.body.ondragover = (e) => {
    e.preventDefault()
  }

  document.ondrop = (e) => {
    e.preventDefault()

    // notify dropped file to host window
    if (e.dataTransfer.files.length > 0) {
      const filePath = e.dataTransfer.files[0].path
      ipcRenderer.sendToHost('ondropfile', filePath)
    }
  }
}
