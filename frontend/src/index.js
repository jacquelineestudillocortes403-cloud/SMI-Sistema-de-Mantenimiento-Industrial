const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { spawn } = require('child_process');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let backendProcess = null;

function startBackend() {
  if (backendProcess) return;
  const backendPath = path.join(__dirname, '../../backend/server.js');
  const backendCwd = path.join(__dirname, '../../backend');
  backendProcess = spawn(process.execPath, [backendPath], {
    cwd: backendCwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data.toString()}`);
  });
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend ERROR: ${data.toString()}`);
  });
  backendProcess.on('close', (code) => {
    console.log(`Backend finalizó con código: ${code}`);
    backendProcess = null;
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
  startBackend();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});