/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hiddenInset', // Native Mac look
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the Next.js app running locally on port 3000
  // In production, we'd spawn the Next.js server here or serve statically.
  mainWindow.loadURL('http://localhost:3000');
  
  // Register the Oracle global shortcut
  globalShortcut.register('Alt+Space', () => {
    if (mainWindow) {
      mainWindow.webContents.send('voice-shortcut-pressed');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
