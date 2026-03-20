"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Legacy file methods (keep for migration/fallback)
    readData: (key) => electron_1.ipcRenderer.invoke('read-data', key),
    writeData: (key, data) => electron_1.ipcRenderer.invoke('write-data', key, data),
    getAppPath: () => electron_1.ipcRenderer.invoke('get-app-path'),
    saveCsvFile: (fileName, csvContent) => electron_1.ipcRenderer.invoke('save-csv-file', fileName, csvContent),
    deleteAllData: () => electron_1.ipcRenderer.invoke('delete-all-data'),
    reloadApp: () => electron_1.ipcRenderer.invoke('reload-app'),
    // New SQLite DB methods
    dbGet: (factory, table) => electron_1.ipcRenderer.invoke('db-get', factory, table),
    dbAdd: (factory, table, item) => electron_1.ipcRenderer.invoke('db-add', factory, table, item),
    dbUpdate: (factory, table, item) => electron_1.ipcRenderer.invoke('db-update', factory, table, item),
    dbDelete: (factory, table, id) => electron_1.ipcRenderer.invoke('db-delete', factory, table, id),
    dbClearTable: (factory, table) => electron_1.ipcRenderer.invoke('db-clear-table', factory, table),
    getDbLogs: () => electron_1.ipcRenderer.invoke('get-db-logs'),
    // Migration trigger
    migrateJsonToSqlite: () => electron_1.ipcRenderer.invoke('migrate-json-to-sqlite'),
    // Encryption management
    encryptionGetStatus: () => electron_1.ipcRenderer.invoke('encryption-get-status'),
    encryptionEnable: () => electron_1.ipcRenderer.invoke('encryption-enable'),
    encryptionDisable: () => electron_1.ipcRenderer.invoke('encryption-disable'),
    encryptionReencryptData: (factory) => electron_1.ipcRenderer.invoke('encryption-reencrypt-data', factory),
    encryptionDecryptAllData: (factory) => electron_1.ipcRenderer.invoke('encryption-decrypt-all-data', factory),
    // Auto-update methods
    checkForUpdates: () => electron_1.ipcRenderer.invoke('check-for-updates'),
    startDownloadUpdate: () => electron_1.ipcRenderer.invoke('start-download'),
    quitAndInstall: () => electron_1.ipcRenderer.invoke('quit-and-install'),
    onUpdateStatus: (callback) => {
        const listener = (_event, status, info) => callback(status, info);
        electron_1.ipcRenderer.on('update-status', listener);
        return () => electron_1.ipcRenderer.removeListener('update-status', listener);
    },
    onUpdateDownloadProgress: (callback) => {
        const listener = (_event, progress) => callback(progress);
        electron_1.ipcRenderer.on('update-download-progress', listener);
        return () => electron_1.ipcRenderer.removeListener('update-download-progress', listener);
    },
    // Google OAuth
    googleAuth: (options) => electron_1.ipcRenderer.invoke('google-auth', options),
});
//# sourceMappingURL=preload.js.map