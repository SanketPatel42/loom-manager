/// <reference types="vite/client" />

interface ElectronAPI {
    readData: (key: string) => Promise<any>;
    writeData: (key: string, data: any) => Promise<boolean>;
    getAppPath: () => Promise<string>;
    saveCsvFile: (fileName: string, csvContent: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    deleteAllData: () => Promise<boolean>;
    reloadApp: () => Promise<void>;

    // SQLite
    dbGet: (factory: string, table: string) => Promise<any[]>;
    dbAdd: (factory: string, table: string, item: any) => Promise<boolean>;
    dbUpdate: (factory: string, table: string, item: any) => Promise<boolean>;
    dbDelete: (factory: string, table: string, id: string) => Promise<boolean>;
    migrateJsonToSqlite: () => Promise<{ success: boolean; count?: number; error?: string }>;

    // Encryption
    encryptionGetStatus: () => Promise<{
        enabled: boolean;
        algorithm: string;
        keyStorage: string;
        sensitiveFields: Record<string, string[]>;
        createdAt?: string;
    }>;
    encryptionEnable: () => Promise<{ success: boolean; message: string }>;
    encryptionDisable: () => Promise<{ success: boolean; message: string }>;
    encryptionDecryptAllData: (factory: string) => Promise<{ success: boolean; message: string }>;
    encryptionReencryptData: (factory: string) => Promise<{ success: boolean; message: string }>;

    // Auto-update

    checkForUpdates: () => Promise<any>;
    startDownloadUpdate: () => Promise<any>;
    quitAndInstall: () => void;
    onUpdateStatus: (callback: (status: string, info?: any) => void) => () => void;
    onUpdateDownloadProgress: (callback: (progress: any) => void) => () => void;
}


interface Window {
    electronAPI?: ElectronAPI;
}
