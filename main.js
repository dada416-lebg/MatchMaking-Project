const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // En production, utiliser l'URL Heroku
  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadURL('https://matchmaking-game-822cfdf6085c.herokuapp.com/');
  } else {
    // En développement, utiliser le client local
    mainWindow.loadFile(path.join(__dirname, 'client', 'build', 'index.html'));
  }

  // Ouvre les outils de développement (optionnel)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 