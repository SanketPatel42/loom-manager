import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    // Legacy file methods (keep for migration/fallback)
    readData: (key: string) => ipcRenderer.invoke('read-data', key),
    writeData: (key: string, data: any) => ipcRenderer.invoke('write-data', key, data),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    saveCsvFile: (fileName: string, csvContent: string) => ipcRenderer.invoke('save-csv-file', fileName, csvContent),
    deleteAllData: () => ipcRenderer.invoke('delete-all-data'),
    reloadApp: () => ipcRenderer.invoke('reload-app'),

    // New SQLite DB methods
    dbGet: (factory: string, table: string) => ipcRenderer.invoke('db-get', factory, table),
    dbAdd: (factory: string, table: string, item: any) => ipcRenderer.invoke('db-add', factory, table, item),
    dbUpdate: (factory: string, table: string, item: any) => ipcRenderer.invoke('db-update', factory, table, item),
    dbDelete: (factory: string, table: string, id: string) => ipcRenderer.invoke('db-delete', factory, table, id),
    dbClearTable: (factory: string, table: string) => ipcRenderer.invoke('db-clear-table', factory, table),
    // Migration trigger
    migrateJsonToSqlite: () => ipcRenderer.invoke('migrate-json-to-sqlite'),

    // Encryption management
    encryptionGetStatus: () => ipcRenderer.invoke('encryption-get-status'),
    encryptionEnable: () => ipcRenderer.invoke('encryption-enable'),
    encryptionDisable: () => ipcRenderer.invoke('encryption-disable'),
    encryptionReencryptData: (factory: string) => ipcRenderer.invoke('encryption-reencrypt-data', factory),
    encryptionDecryptAllData: (factory: string) => ipcRenderer.invoke('encryption-decrypt-all-data', factory),

    // Auto-update methods
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    startDownloadUpdate: () => ipcRenderer.invoke('start-download'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateStatus: (callback: (status: string, info?: any) => void) => {
        const listener = (_event: any, status: string, info: any) => callback(status, info);
        ipcRenderer.on('update-status', listener);
        return () => ipcRenderer.removeListener('update-status', listener);
    },
    onUpdateDownloadProgress: (callback: (progress: any) => void) => {
        const listener = (_event: any, progress: any) => callback(progress);
        ipcRenderer.on('update-download-progress', listener);
        return () => ipcRenderer.removeListener('update-download-progress', listener);
    },
});



