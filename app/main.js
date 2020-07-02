const { app, BrowserWindow, Menu } = require('electron');

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
    });

    mainWindow.webContents.openDevTools();
    mainWindow.webContents.loadFile('index.html');
    Menu.setApplicationMenu(null);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })

    mainWindow.on('closed', () => {
        mainWindow = null;
    })
})