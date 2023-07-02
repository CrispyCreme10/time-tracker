const {app, BrowserWindow, ipcMain} = require('electron')
const path = require("path");
const { init, insertSession, getSessions } = require('./server/context');

let win;

function createWindow () {
  win = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadURL('http://localhost:4200');

  win.on('closed', function () {
    win = null
  })
}

app.on('ready', () => {
  init();
  createWindow();
});

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
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// ------->

ipcMain.on('close', () => {
  win.hide();
});

ipcMain.on('getSessions', async (event) => {
  const sessions = await getSessions();
  console.log(sessions);
  event.reply('getSessions-reply', sessions);
})

ipcMain.on('insertSession', async (event, data) => {
  console.log(data);
  await insertSession(data);
});
