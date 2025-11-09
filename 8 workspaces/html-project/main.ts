import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: false,
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'assets/icon.ico')
  });

  win.loadURL(
    app.isPackaged
      ? 'app://./index.html'
      : 'http://localhost:3666'
  );
}

app.whenReady().then(createWindow);