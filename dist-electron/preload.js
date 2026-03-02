"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    readData: (key) => electron_1.ipcRenderer.invoke('read-data', key),
    writeData: (key, data) => electron_1.ipcRenderer.invoke('write-data', key, data),
    getAppPath: () => electron_1.ipcRenderer.invoke('get-app-path'),
    saveCsvFile: (fileName, csvContent) => electron_1.ipcRenderer.invoke('save-csv-file', fileName, csvContent),
    deleteAllData: () => electron_1.ipcRenderer.invoke('delete-all-data'),
    reloadApp: () => electron_1.ipcRenderer.invoke('reload-app'),
});
//# sourceMappingURL=preload.js.map