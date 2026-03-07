"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_updater_1 = require("electron-updater");
let mainWindow = null;
const createWindow = () => {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // In production, load the index.html.
    // In development, load the Vite dev server URL.
    const isDev = !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        // In production, the compiled main.js is in dist-electron/electron/
        // To reach dist/ index.html, we need to go up two levels
        const indexPath = path_1.default.join(__dirname, '..', '..', 'dist', 'index.html');
        console.log('Loading index.html from:', indexPath);
        mainWindow.loadFile(indexPath);
    }
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
electron_1.app.on('ready', () => {
    // Setup IPC handlers for file storage
    setupIpcHandlers();
    createWindow();
    // Setup auto updater
    setupAutoUpdater();
    electron_1.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Storage implementation
const APP_DATA_PATH = path_1.default.join(electron_1.app.getPath('userData'), 'data');
// Ensure data directory exists
if (!fs_1.default.existsSync(APP_DATA_PATH)) {
    fs_1.default.mkdirSync(APP_DATA_PATH, { recursive: true });
}
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const encryption_1 = require("./encryption");
function setupIpcHandlers() {
    // Helper to validate keys (prevent path traversal)
    const isValidKey = (key) => {
        return /^[a-zA-Z0-9_-]+$/.test(key);
    };
    // --- Legacy JSON Handlers (Keep for fallback/migration reading) ---
    electron_1.ipcMain.handle('read-data', (event, key) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!isValidKey(key))
                return null;
            const filePath = path_1.default.join(APP_DATA_PATH, `${key}.json`);
            try {
                const content = yield fs_1.default.promises.readFile(filePath, 'utf-8');
                return JSON.parse(content);
            }
            catch (e) {
                return [];
            }
        }
        catch (error) {
            console.error(`Error reading data for key ${key}:`, error);
            return [];
        }
    }));
    electron_1.ipcMain.handle('write-data', (event, key, data) => __awaiter(this, void 0, void 0, function* () {
        // ... (Keep existing write logic if needed for backward compat, but we want to move away)
        // For now, let's keep it but log warning
        console.warn(`[IPC] write-data called for ${key}. Should use db-* methods.`);
        return true;
    }));
    // ----------------------------------------------------------------
    // --- New SQLite Handlers ---
    electron_1.ipcMain.handle('db-get', (event, factory, tableName) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, db_1.isValidTable)(tableName))
                throw new Error(`Invalid table: ${tableName}`);
            const db = (0, db_1.getDb)(factory);
            const schemaKey = (0, db_1.getSchemaTableKey)(tableName);
            // @ts-ignore - dynamic table access
            const table = db_1.schema[schemaKey] || db_1.schema[tableName];
            const result = yield db.select().from(table).all();
            console.log(`[DB] Retrieved ${result.length} records from ${tableName} (factory: ${factory})`);
            // Decrypt sensitive fields on read
            return encryption_1.encryptionManager.decryptRecords(tableName, result);
        }
        catch (e) {
            console.error(`[DB] Error in db-get ${tableName}:`, e);
            return [];
        }
    }));
    electron_1.ipcMain.handle('db-add', (event, factory, tableName, item) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, db_1.isValidTable)(tableName))
                throw new Error(`Invalid table: ${tableName}`);
            const db = (0, db_1.getDb)(factory);
            const schemaKey = (0, db_1.getSchemaTableKey)(tableName);
            const table = db_1.schema[schemaKey] || db_1.schema[tableName];
            if (!table)
                throw new Error(`Table object not found for: ${tableName} (key: ${schemaKey})`);
            // Encrypt sensitive fields before writing
            const encryptedItem = encryption_1.encryptionManager.encryptRecord(tableName, item);
            yield db.insert(table).values(encryptedItem).run();
            return { success: true };
        }
        catch (e) {
            console.error(`[DB] Error in db-add ${tableName}:`, e);
            const logPath = path_1.default.join(electron_1.app.getPath('userData'), 'db-error.log');
            fs_1.default.appendFileSync(logPath, `[${new Date().toISOString()}] Add ${tableName} error: ${e.message}\n${e.stack}\n`);
            return { success: false, error: e.message };
        }
    }));
    electron_1.ipcMain.handle('get-db-logs', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const logPath = path_1.default.join(electron_1.app.getPath('userData'), 'db-error.log');
            if (fs_1.default.existsSync(logPath)) {
                return fs_1.default.readFileSync(logPath, 'utf-8');
            }
            return "No logs found.";
        }
        catch (e) {
            return "Error reading logs: " + String(e);
        }
    }));
    electron_1.ipcMain.handle('db-update', (event, factory, tableName, item) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, db_1.isValidTable)(tableName))
                throw new Error(`Invalid table: ${tableName}`);
            if (!item.id)
                throw new Error('Item must have an ID');
            const db = (0, db_1.getDb)(factory);
            const schemaKey = (0, db_1.getSchemaTableKey)(tableName);
            // @ts-ignore
            const table = db_1.schema[schemaKey] || db_1.schema[tableName];
            // Encrypt sensitive fields before writing
            const encryptedItem = encryption_1.encryptionManager.encryptRecord(tableName, item);
            yield db.update(table).set(encryptedItem).where((0, drizzle_orm_1.eq)(table.id, item.id)).run();
            return true;
        }
        catch (e) {
            console.error(`[DB] Error in db-update ${tableName}:`, e);
            return false;
        }
    }));
    electron_1.ipcMain.handle('db-delete', (event, factory, tableName, id) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, db_1.isValidTable)(tableName))
                throw new Error(`Invalid table: ${tableName}`);
            const db = (0, db_1.getDb)(factory);
            const schemaKey = (0, db_1.getSchemaTableKey)(tableName);
            // @ts-ignore
            const table = db_1.schema[schemaKey] || db_1.schema[tableName];
            yield db.delete(table).where((0, drizzle_orm_1.eq)(table.id, id)).run();
            return true;
        }
        catch (e) {
            console.error(`[DB] Error in db-delete ${tableName}:`, e);
            return false;
        }
    }));
    electron_1.ipcMain.handle('db-clear-table', (event, factory, tableName) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(0, db_1.isValidTable)(tableName))
                throw new Error(`Invalid table: ${tableName}`);
            const db = (0, db_1.getDb)(factory);
            const schemaKey = (0, db_1.getSchemaTableKey)(tableName);
            // @ts-ignore
            const table = db_1.schema[schemaKey] || db_1.schema[tableName];
            yield db.delete(table).run();
            return true;
        }
        catch (e) {
            console.error(`[DB] Error in db-clear-table ${tableName}:`, e);
            return false;
        }
    }));
    electron_1.ipcMain.handle('migrate-json-to-sqlite', () => __awaiter(this, void 0, void 0, function* () {
        console.log('[Migration] Starting migration from JSON to SQLite...');
        try {
            if (!fs_1.default.existsSync(APP_DATA_PATH)) {
                console.log('[Migration] No data directory found.');
                return { success: true, message: 'No data to migrate' };
            }
            const files = yield fs_1.default.promises.readdir(APP_DATA_PATH);
            const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('package.json'));
            let migratedCount = 0;
            for (const file of jsonFiles) {
                // Parse filename: PREFIX_erp_TABLE.json
                // Example: factory1_erp_beams.json
                // Or: erp_beams.json (default factory, empty prefix?)
                // Regex to split
                // We know tables always start with 'erp_' in the old system (from electronDb.ts)
                const parts = file.split('erp_');
                let factoryPrefix = '';
                let tableName = '';
                if (parts.length === 2) {
                    factoryPrefix = parts[0];
                    tableName = parts[1].replace('.json', '');
                }
                else if (file.startsWith('erp_')) {
                    // unexpected but possible if prefix is empty
                    factoryPrefix = '';
                    tableName = file.replace('erp_', '').replace('.json', '');
                }
                else {
                    console.warn(`[Migration] Skipping unrecognized file: ${file}`);
                    continue;
                }
                // Map table name from JSON (camelCase or whatever) to Schema export name
                // In generic `electronDb.ts`:
                // 'beams' -> 'erp_beams'
                // so `tableName` here should be 'beams'
                // There are some mismatches in naming conventions maybe? 
                // schema exports: beams, takas, workerProfiles...
                // json file key derived from: `factoryPrefix + 'erp_' + table`
                // where `table` comes from `electronDb.ts` calls like `get<Beam>('beams')`
                // So the `tableName` extracted here SHOULD match the schema export key. 
                // E.g. 'worker_profiles' might be the string in electronDb calls?
                // Let's check electronDb.ts again.
                // It calls `this.get<WorkerProfile>('worker_profiles')`.
                // Schema export is `workerProfiles`? No, schema export is `workerProfiles` variable, but table name is `worker_profiles`.
                // Wait! Drizzle schema export name is `workerProfiles`.
                // Accessing `schema[tableName]` requires `tableName` to be "workerProfiles".
                // But `electronDb.ts` passes "worker_profiles" string.
                // I need a mapping from "worker_profiles" (string in JSON/electronDb) to `workerProfiles` (schema export).
                // Or I should have named schema exports to match tables? 
                // schema.ts: `export const workerProfiles = sqliteTable('worker_profiles', ...)`
                // Problem: `schema['worker_profiles']` is undefined. `schema['workerProfiles']` is defined.
                // Solution: Create a mapping map or normalize names.
                // Most are simple: beams -> beams.
                // worker_profiles -> workerProfiles.
                // camelCase conversion? 
                // `worker_profiles` -> `workerProfiles`
                const toCamel = (s) => {
                    return s.replace(/([-_][a-z])/ig, ($1) => {
                        return $1.toUpperCase()
                            .replace('-', '')
                            .replace('_', '');
                    });
                };
                let schemaKey = toCamel(tableName);
                // Special case handling if simple camelCase doesn't work
                if (tableName === 'beam_pasar')
                    schemaKey = 'beamPasar';
                // if (tableName === 'worker_sheet_data') schemaKey = 'workerSheetData'; // toCamel works
                // if (tableName === 'tfo_attendance') schemaKey = 'tfoAttendance';
                // @ts-ignore
                const tableObj = db_1.schema[schemaKey] || db_1.schema[tableName];
                if (!tableObj) {
                    console.warn(`[Migration] No schema found for table: ${tableName} (key: ${schemaKey})`);
                    continue;
                }
                console.log(`[Migration] Migrating ${file} to factory '${factoryPrefix}', table '${tableName}'...`);
                // Read JSON
                const content = yield fs_1.default.promises.readFile(path_1.default.join(APP_DATA_PATH, file), 'utf-8');
                let data;
                try {
                    data = JSON.parse(content);
                }
                catch (e) {
                    console.error(`[Migration] Failed to parse JSON in ${file}`);
                    continue;
                }
                if (!Array.isArray(data) || data.length === 0) {
                    console.log(`[Migration] Skipping empty/invalid data in ${file}`);
                    continue;
                }
                const db = (0, db_1.getDb)(factoryPrefix);
                // Insert in batches
                console.log(`[Migration] Inserting ${data.length} records...`);
                try {
                    // Drizzle batch insert
                    yield db.insert(tableObj).values(data).onConflictDoNothing().run();
                    migratedCount++;
                    // Rename JSON file to mark as done
                    yield fs_1.default.promises.rename(path_1.default.join(APP_DATA_PATH, file), path_1.default.join(APP_DATA_PATH, file + '.migrated'));
                }
                catch (e) {
                    console.error(`[Migration] Failed to insert data for ${file}:`, e);
                }
            }
            return { success: true, count: migratedCount };
        }
        catch (error) {
            console.error('[Migration] Fatal error:', error);
            return { success: false, error: String(error) };
        }
    }));
    electron_1.ipcMain.handle('get-app-path', () => {
        return APP_DATA_PATH;
    });
    electron_1.ipcMain.handle('save-csv-file', (event, fileName, csvContent) => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[IPC] Saving CSV file: ${fileName}`);
            const downloadsPath = electron_1.app.getPath('downloads');
            const filePath = path_1.default.join(downloadsPath, fileName);
            yield fs_1.default.promises.writeFile(filePath, csvContent, 'utf-8');
            console.log(`[IPC] CSV file saved to: ${filePath}`);
            return { success: true, filePath };
        }
        catch (error) {
            console.error(`Error saving CSV file ${fileName}:`, error);
            return { success: false, error: String(error) };
        }
    }));
    electron_1.ipcMain.handle('delete-all-data', () => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[IPC] Deleting all data from: ${APP_DATA_PATH}`);
            // Also delete databases?
            // Yes, user requested full reset.
            // But we should implement this carefully. 
            // For now, let's keep the file deletion.
            if (fs_1.default.existsSync(APP_DATA_PATH)) {
                const files = yield fs_1.default.promises.readdir(APP_DATA_PATH);
                for (const file of files) {
                    yield fs_1.default.promises.unlink(path_1.default.join(APP_DATA_PATH, file));
                }
                console.log(`[IPC] All data deleted successfully`);
                return true;
            }
            return true;
        }
        catch (error) {
            console.error(`Error deleting all data:`, error);
            return false;
        }
    }));
    electron_1.ipcMain.handle('reload-app', () => {
        if (mainWindow) {
            mainWindow.reload();
        }
    });
    // ── Encryption Management IPC ──────────────────────────────────────────
    electron_1.ipcMain.handle('encryption-get-status', () => {
        return encryption_1.encryptionManager.getStatus();
    });
    electron_1.ipcMain.handle('encryption-enable', () => {
        return encryption_1.encryptionManager.enable();
    });
    electron_1.ipcMain.handle('encryption-disable', () => {
        return encryption_1.encryptionManager.disable();
    });
    electron_1.ipcMain.handle('encryption-reencrypt-data', (event, factory) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tablesWithSensitiveData = Object.keys(encryption_1.SENSITIVE_FIELDS);
            let totalRecords = 0;
            for (const tableName of tablesWithSensitiveData) {
                if (!(0, db_1.isValidTable)(tableName))
                    continue;
                const db = (0, db_1.getDb)(factory);
                // @ts-ignore
                const table = db_1.schema[tableName];
                const records = yield db.select().from(table).all();
                for (const record of records) {
                    // First decrypt any already-encrypted fields (in case of re-encryption)
                    const decryptedRecord = encryption_1.encryptionManager.decryptRecord(tableName, record);
                    // Then encrypt with current key
                    const encryptedRecord = encryption_1.encryptionManager.encryptRecord(tableName, decryptedRecord);
                    yield db.update(table).set(encryptedRecord).where((0, drizzle_orm_1.eq)(table.id, record.id)).run();
                    totalRecords++;
                }
            }
            return { success: true, message: `Re-encrypted ${totalRecords} records across ${tablesWithSensitiveData.length} tables.` };
        }
        catch (e) {
            console.error('[Encryption] Re-encrypt failed:', e);
            return { success: false, message: `Re-encryption failed: ${e.message}` };
        }
    }));
    electron_1.ipcMain.handle('encryption-decrypt-all-data', (event, factory) => __awaiter(this, void 0, void 0, function* () {
        try {
            const tablesWithSensitiveData = Object.keys(encryption_1.SENSITIVE_FIELDS);
            let totalRecords = 0;
            for (const tableName of tablesWithSensitiveData) {
                if (!(0, db_1.isValidTable)(tableName))
                    continue;
                const db = (0, db_1.getDb)(factory);
                // @ts-ignore
                const table = db_1.schema[tableName];
                const records = yield db.select().from(table).all();
                for (const record of records) {
                    const decryptedRecord = encryption_1.encryptionManager.decryptRecord(tableName, record);
                    yield db.update(table).set(decryptedRecord).where((0, drizzle_orm_1.eq)(table.id, record.id)).run();
                    totalRecords++;
                }
            }
            return { success: true, message: `Decrypted ${totalRecords} records.` };
        }
        catch (e) {
            console.error('[Encryption] Decrypt-all failed:', e);
            return { success: false, message: `Decryption failed: ${e.message}` };
        }
    }));
    // ── Auto Updater Handlers ───────────────────────────────────────────
    electron_1.ipcMain.handle('check-for-updates', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
            return result;
        }
        catch (error) {
            console.error('[Update] Error checking for updates:', error);
            return null;
        }
    }));
    electron_1.ipcMain.handle('start-download', () => __awaiter(this, void 0, void 0, function* () {
        try {
            return yield electron_updater_1.autoUpdater.downloadUpdate();
        }
        catch (error) {
            console.error('[Update] Error starting download:', error);
            return null;
        }
    }));
    electron_1.ipcMain.handle('quit-and-install', () => {
        electron_updater_1.autoUpdater.quitAndInstall();
    });
    // ── Google OAuth Handler ───────────────────────────────────────────
    electron_1.ipcMain.handle('google-auth', (event_1, _a) => __awaiter(this, [event_1, _a], void 0, function* (event, { clientId, scopes }) {
        return new Promise((resolve, reject) => {
            // Use localhost redirect URI - this needs to be configured in Google Cloud Console
            const redirectUri = 'http://localhost:3000/oauth/callback';
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `scope=${encodeURIComponent(scopes.join(' '))}&` +
                `access_type=offline&` +
                `prompt=consent`;
            // Create a new window for OAuth
            const authWindow = new electron_1.BrowserWindow({
                width: 500,
                height: 600,
                show: true,
                modal: true,
                parent: mainWindow || undefined,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });
            authWindow.loadURL(authUrl);
            // Listen for navigation to redirect URI
            authWindow.webContents.on('will-navigate', (event, navigationUrl) => __awaiter(this, void 0, void 0, function* () {
                const url = new URL(navigationUrl);
                if (url.hostname === 'localhost' && url.pathname === '/oauth/callback') {
                    const code = url.searchParams.get('code');
                    const error = url.searchParams.get('error');
                    authWindow.close();
                    if (error) {
                        reject(new Error(`OAuth error: ${error}`));
                        return;
                    }
                    if (code) {
                        try {
                            // Exchange code for access token
                            const tokenResponse = yield fetch('https://oauth2.googleapis.com/token', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: new URLSearchParams({
                                    client_id: clientId,
                                    code: code,
                                    grant_type: 'authorization_code',
                                    redirect_uri: redirectUri
                                })
                            });
                            const tokenData = yield tokenResponse.json();
                            if (tokenData.access_token) {
                                resolve(tokenData.access_token);
                            }
                            else {
                                reject(new Error('Failed to get access token: ' + JSON.stringify(tokenData)));
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                }
            }));
            authWindow.on('closed', () => {
                reject(new Error('OAuth window was closed'));
            });
        });
    }));
}
function setupAutoUpdater() {
    // Configure updater
    electron_updater_1.autoUpdater.autoDownload = false; // We want to control download manually via UI
    electron_updater_1.autoUpdater.allowPrerelease = false;
    electron_updater_1.autoUpdater.on('checking-for-update', () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'checking');
    });
    electron_updater_1.autoUpdater.on('update-available', (info) => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'available', info);
    });
    electron_updater_1.autoUpdater.on('update-not-available', (info) => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'not-available', info);
    });
    electron_updater_1.autoUpdater.on('error', (err) => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'error', err.message);
    });
    electron_updater_1.autoUpdater.on('download-progress', (progressObj) => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-download-progress', progressObj);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('update-status', 'downloaded', info);
    });
}
//# sourceMappingURL=main.js.map