const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content, fileName, type) => ipcRenderer.invoke('save-file', { content, fileName, type }),
  printReceipt: (html) => ipcRenderer.send('print-receipt', html)
})
