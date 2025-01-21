const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectImage: () => ipcRenderer.invoke('select-image')
});


