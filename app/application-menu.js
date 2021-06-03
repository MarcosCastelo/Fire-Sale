const { app, BrowserWinow, Menu, shell, dialog } = require('electron');
const mainProcess = require('./main');

const template = [{
        label: 'File',
        submenu: [{
                label: 'New File',
                accelerator: 'CommandOrControl+N',
                click() {
                    mainProcess.createWindow();
                }
            },
            {
                label: 'Open File',
                accelerator: 'CommandOrControl+O',
                click(item, focusedWindow) {
                    if (focusedWindow) {
                        return mainProcess.getFileFromUser(focusedWindow);
                    }

                    const newWindow = mainProcess.createWindow();

                    newWindow.on('show', () => {
                        mainProcess.getFileFromUser(newWindow);
                    })
                }
            },
            {
                label: 'Save File',
                accelerator: 'CommandOrControl+S',
                click(item, focusedWindow) {
                    if (!focusedWindow) {
                        return dialog.showErrorBox(
                            'Cannot Save or Export',
                            'There is currently no active document to save or export.'
                        )
                    }
                    focusedWindow.webContents.send('save-markdown');
                }
            },
            {
                label: 'Export HTML',
                accelerator: 'Shift+CommandOrControl+S',
                click(item, focusedWindow) {
                    if (!focusedWindow) {
                        return dialog.showErrorBox(
                            'Cannot Save or Export',
                            'There is currently no active document to save or export.'
                        )
                    }
                    focusedWindow.webContents.send('save-html');
                }
            }
        ]
    }, {
        label: 'Edit',
        submenu: [{
                label: 'Undo',
                accelerator: 'CommandOrContro+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CommandOrControl+Z',
                role: 'redo'
            },

            { type: 'separator' },

            {
                label: 'Cut',
                accelerator: 'CommandOrControl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CommandOrControl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CommandOrControl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CommandOrControl+A',
                role: 'selectall'
            }
        ],

    },
    {
        label: 'Window',
        role: 'window',
        submenu: [{
                label: 'Minimize',
                accelerator: 'CommandOrControl+M',
                role: 'minimize'
            },
            {
                label: 'Close',
                accelerator: 'CommandOrControl+W',
                role: 'close'
            },
        ]
    },
    {
        labe: 'Help',
        role: 'help',
        submenu: [{
                label: 'Visit Website',
                click() {}
            },
            {
                label: 'Toggle Developer Tools',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.webContents.toggleDevTools();
                }
            }
        ]
    }
];

if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({ labe: name });
}

module.exports = Menu.buildFromTemplate(template);