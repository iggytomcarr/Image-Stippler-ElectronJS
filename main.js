const { app, BrowserWindow, ipcMain, dialog } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: __dirname + '/preload.js', // Adjust the path if necessary
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },

        width: 1800,
        height: 1000

    })
    mainWindow.webContents.openDevTools({ mode: 'bottom' }); // Dock it at the bottom

    mainWindow.loadFile('index.html')


});

ipcMain.handle('select-image', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select an Image',
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'bmp'] }
        ],
        properties: ['openFile']
    });

    // Return the file path if one is selected
    return result.canceled ? null : result.filePaths[0];
});


app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

