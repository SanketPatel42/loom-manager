export interface ElectronAPI {
    // Legacy file methods
    readData: (key: string) => Promise<any>;
    writeData: (key: string, data: any) => Promise<boolean>;
    getAppPath: () => Promise<string>;
    saveCsvFile: (fileName: string, csvContent: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    deleteAllData: () => Promise<boolean>;
    reloadApp: () => Promise<void>;

    // SQLite DB methods
    dbGet: (factory: string, table: string) => Promise<any[]>;
    dbAdd: (factory: string, table: string, item: any) => Promise<{ success: boolean; error?: string }>;
    dbUpdate: (factory: string, table: string, item: any) => Promise<boolean>;
    dbDelete: (factory: string, table: string, id: string) => Promise<boolean>;
    dbClearTable: (factory: string, table: string) => Promise<boolean>;
    getDbLogs: () => Promise<string>;
    migrateJsonToSqlite: () => Promise<{ success: boolean; count?: number; message?: string; error?: string }>;

    // Encryption management
    encryptionGetStatus: () => Promise<{ enabled: boolean; keyExists: boolean }>;
    encryptionEnable: () => Promise<{ success: boolean; message: string }>;
    encryptionDisable: () => Promise<{ success: boolean; message: string }>;
    encryptionReencryptData: (factory: string) => Promise<{ success: boolean; message: string }>;
    encryptionDecryptAllData: (factory: string) => Promise<{ success: boolean; message: string }>;

    // Auto-update methods
    checkForUpdates: () => Promise<any>;
    startDownloadUpdate: () => Promise<any>;
    quitAndInstall: () => Promise<void>;
    onUpdateStatus: (callback: (status: string, info?: any) => void) => () => void;
    onUpdateDownloadProgress: (callback: (progress: any) => void) => () => void;

    // Google OAuth
    googleAuth: (options: { clientId: string; scopes: string[] }) => Promise<string>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}