// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false, // Inicia oculta para evitar "brancão"
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Mostra quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// IPC para salvar arquivos usando o diálogo nativo
ipcMain.handle('save-file', async (event, { content, fileName, type }) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Salvar Documento',
    defaultPath: fileName,
    filters: [
      { name: type === 'pdf' ? 'PDF Files' : 'CSV Files', extensions: [type] }
    ]
  })

  if (filePath) {
    try {
      fs.writeFileSync(filePath, content)
      return { success: true, path: filePath }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }
  return { success: false, cancelled: true }
})

// IPC para impressão
ipcMain.on('print-receipt', (event, html) => {
  const win = new BrowserWindow({ show: false })
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  win.webContents.on('did-finish-load', () => {
    win.webContents.print({ silent: false, printBackground: true }, () => {
      win.close()
    })
  })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
