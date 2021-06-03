const { app, BrowserWindow, dialog, Menu, BrowserView } = require('electron');
const fs = require('fs');

const applicationMenu = require('./application-menu');

const windows = new Set();
const openFiles = new Map();


// App events
app.on('ready', () => {
    Menu.setApplicationMenu(applicationMenu);
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
        return false;
    }
    app.quit();
})

app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) { createWindow(); }
});

app.on('will-finish-lauching', () => {
    app.on('open-file', (event, file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            this.openFile(win, file);
        })
    })
})


// Main process functions
const createWindow = exports.createWindow = () => {


    let newWindow = new BrowserWindow({
        width: 900,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            devTools: true
        }
    });

    newWindow.loadFile('app/index.html');

    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    newWindow.on('close', (event) => {
        if (newWindow.isDocumentEdited()) {
            event.preventDefault();

            const result = dialog.showMessageBox(newWindow, {
                type: 'warning',
                title: 'Quit with Unsaved Changes?',
                message: 'Your changes will be lost if you do not save.',
                buttons: [
                    'Quit Anyway',
                    'Cancel',
                ],
                defaultId: 0,
                cancelId: 1
            });

            if (result === 0) newWindow.destroy();
        }
    })

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        stopWatchingFile(newWindow);
        newWindow = null;
    });


    windows.add(newWindow);
    return newWindow;
}

const createView = exports.createView = (targetWindow) => {
    const view = new BrowserView();
    targetWindow.setBrowserView(view);
    view.setBounds({ x: 0, y: 0, width: 480, height: 720 })
    view.webContents.loadURL('https://app-test.simplesinformatica.com/login')
}


const getFileFromUser = exports.getFileFromUser = async(targetWindow) => {
    const files = await dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Markdown Files', extensions: ['md', 'markdown'] }
        ]
    });

    if (files) {
        const file = files.filePaths[0];
        openFile(targetWindow, file);
    }

}

const openFile = exports.openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    app.addRecentDocument(file);
    targetWindow.setRepresentedFilename(file);
    targetWindow.webContents.send('file-opened', file, content);
}

const saveHtml = exports.saveHtml = async(targetWindow, content) => {
    const file = await dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        defaultPath: app.getPath('home'),
        filters: [
            { name: 'HTML Files', extensions: ['html', 'htm'] }
        ]
    })

    console.log(file)
    if (!file) return;

    fs.writeFileSync(file.filePath, content);
}

const saveMarkdown = exports.saveMarkdown = async(targetWindow, file, content) => {
    if (!file) {
        file = await dialog.showSaveDialog(targetWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('home'),
            filters: [
                { name: 'Markdown Files', extensions: ['md', 'markdown'] }
            ]
        });

        if (!file) return;

        file = file.filePath;
    }


    fs.writeFileSync(file, content);
    openFile(targetWindow, file);
}

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);

    const watcher = fs.watchFile(file, (event) => {
        if (event === 'change') {
            const content = fs.readFileSync(file);
            targetWindow.webContents.send('file-changed', file, content);
        }
    });

    openFiles.set(targetWindow, watcher);
}

const stopWatchingFile = (targetWindow) => {
    if (openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).stop();
        openFiles.delete(targetWindow);
    }
}