const { app, BrowserWindow, Menu } = require('electron');

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.webContents.loadFile('index.html');
    Menu.setApplicationMenu(null);
    mainWindow.on('closed', () => {
        mainWindow = null;
    })
})