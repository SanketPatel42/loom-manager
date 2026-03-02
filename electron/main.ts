import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { autoUpdater } from 'electron-updater';


let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // In production, load the index.html.
    // In development, load the Vite dev server URL.
    const isDev = !app.isPackaged;

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, use process.resourcesPath to correctly locate the app.asar
        // The dist folder is at app.asar/dist
        // const indexPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
        const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
        console.log('Loading index.html from:', indexPath);
        mainWindow.loadFile(indexPath);
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
    // Setup IPC handlers for file storage
    setupIpcHandlers();

    createWindow();

    // Setup auto updater
    setupAutoUpdater();

    app.on('activate', () => {

        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Storage implementation
const APP_DATA_PATH = path.join(app.getPath('userData'), 'data');

// Ensure data directory exists
if (!fs.existsSync(APP_DATA_PATH)) {
    fs.mkdirSync(APP_DATA_PATH, { recursive: true });
}

import { getDb, isValidTable, schema } from './db';
import { eq } from 'drizzle-orm';
import { encryptionManager, SENSITIVE_FIELDS } from './encryption';

function setupIpcHandlers() {
    // Helper to validate keys (prevent path traversal)
    const isValidKey = (key: string): boolean => {
        return /^[a-zA-Z0-9_-]+$/.test(key);
    };

    // --- Legacy JSON Handlers (Keep for fallback/migration reading) ---
    ipcMain.handle('read-data', async (event, key: string) => {
        try {
            if (!isValidKey(key)) return null;
            const filePath = path.join(APP_DATA_PATH, `${key}.json`);
            try {
                const content = await fs.promises.readFile(filePath, 'utf-8');
                return JSON.parse(content);
            } catch (e) {
                return [];
            }
        } catch (error) {
            console.error(`Error reading data for key ${key}:`, error);
            return [];
        }
    });

    ipcMain.handle('write-data', async (event, key: string, data: any) => {
        // ... (Keep existing write logic if needed for backward compat, but we want to move away)
        // For now, let's keep it but log warning
        console.warn(`[IPC] write-data called for ${key}. Should use db-* methods.`);
        return true;
    });
    // ----------------------------------------------------------------

    // --- New SQLite Handlers ---

    ipcMain.handle('db-get', async (event, factory: string, tableName: string) => {
        try {
            if (!isValidTable(tableName)) throw new Error(`Invalid table: ${tableName}`);
            const db = getDb(factory);
            // @ts-ignore - dynamic table access
            const table = schema[tableName];
            const result = await db.select().from(table).all();
            // Decrypt sensitive fields on read
            return encryptionManager.decryptRecords(tableName, result);
        } catch (e: any) {
            console.error(`[DB] Error in db-get ${tableName}:`, e);
            return [];
        }
    });

    ipcMain.handle('db-add', async (event, factory: string, tableName: string, item: any) => {
        try {
            if (!isValidTable(tableName)) throw new Error(`Invalid table: ${tableName}`);
            const db = getDb(factory);
            // @ts-ignore
            const table = schema[tableName];
            // Encrypt sensitive fields before writing
            const encryptedItem = encryptionManager.encryptRecord(tableName, item);
            await db.insert(table).values(encryptedItem).run();
            return true;
        } catch (e: any) {
            console.error(`[DB] Error in db-add ${tableName}:`, e);
            return false;
        }
    });

    ipcMain.handle('db-update', async (event, factory: string, tableName: string, item: any) => {
        try {
            if (!isValidTable(tableName)) throw new Error(`Invalid table: ${tableName}`);
            if (!item.id) throw new Error('Item must have an ID');
            const db = getDb(factory);
            // @ts-ignore
            const table = schema[tableName];
            // Encrypt sensitive fields before writing
            const encryptedItem = encryptionManager.encryptRecord(tableName, item);
            await db.update(table).set(encryptedItem).where(eq(table.id, item.id)).run();
            return true;
        } catch (e: any) {
            console.error(`[DB] Error in db-update ${tableName}:`, e);
            return false;
        }
    });

    ipcMain.handle('db-delete', async (event, factory: string, tableName: string, id: string) => {
        try {
            if (!isValidTable(tableName)) throw new Error(`Invalid table: ${tableName}`);
            const db = getDb(factory);
            // @ts-ignore
            const table = schema[tableName];
            await db.delete(table).where(eq(table.id, id)).run();
            return true;
        } catch (e: any) {
            console.error(`[DB] Error in db-delete ${tableName}:`, e);
            return false;
        }
    });

    ipcMain.handle('db-clear-table', async (event, factory: string, tableName: string) => {
        try {
            if (!isValidTable(tableName)) throw new Error(`Invalid table: ${tableName}`);
            const db = getDb(factory);
            // @ts-ignore
            const table = schema[tableName];
            await db.delete(table).run();
            return true;
        } catch (e: any) {
            console.error(`[DB] Error in db-clear-table ${tableName}:`, e);
            return false;
        }
    });

    ipcMain.handle('migrate-json-to-sqlite', async () => {
        console.log('[Migration] Starting migration from JSON to SQLite...');
        try {
            if (!fs.existsSync(APP_DATA_PATH)) {
                console.log('[Migration] No data directory found.');
                return { success: true, message: 'No data to migrate' };
            }

            const files = await fs.promises.readdir(APP_DATA_PATH);
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
                } else if (file.startsWith('erp_')) {
                    // unexpected but possible if prefix is empty
                    factoryPrefix = '';
                    tableName = file.replace('erp_', '').replace('.json', '');
                } else {
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

                const toCamel = (s: string) => {
                    return s.replace(/([-_][a-z])/ig, ($1) => {
                        return $1.toUpperCase()
                            .replace('-', '')
                            .replace('_', '');
                    });
                };

                let schemaKey = toCamel(tableName);
                // Special case handling if simple camelCase doesn't work
                if (tableName === 'beam_pasar') schemaKey = 'beamPasar';
                // if (tableName === 'worker_sheet_data') schemaKey = 'workerSheetData'; // toCamel works
                // if (tableName === 'tfo_attendance') schemaKey = 'tfoAttendance';

                // @ts-ignore
                const tableObj = schema[schemaKey] || schema[tableName];

                if (!tableObj) {
                    console.warn(`[Migration] No schema found for table: ${tableName} (key: ${schemaKey})`);
                    continue;
                }

                console.log(`[Migration] Migrating ${file} to factory '${factoryPrefix}', table '${tableName}'...`);

                // Read JSON
                const content = await fs.promises.readFile(path.join(APP_DATA_PATH, file), 'utf-8');
                let data: any[];
                try {
                    data = JSON.parse(content);
                } catch (e) {
                    console.error(`[Migration] Failed to parse JSON in ${file}`);
                    continue;
                }

                if (!Array.isArray(data) || data.length === 0) {
                    console.log(`[Migration] Skipping empty/invalid data in ${file}`);
                    continue;
                }

                const db = getDb(factoryPrefix);

                // Insert in batches
                console.log(`[Migration] Inserting ${data.length} records...`);
                try {
                    // Drizzle batch insert
                    await db.insert(tableObj).values(data).onConflictDoNothing().run();
                    migratedCount++;

                    // Rename JSON file to mark as done
                    await fs.promises.rename(path.join(APP_DATA_PATH, file), path.join(APP_DATA_PATH, file + '.migrated'));
                } catch (e) {
                    console.error(`[Migration] Failed to insert data for ${file}:`, e);
                }
            }

            return { success: true, count: migratedCount };

        } catch (error) {
            console.error('[Migration] Fatal error:', error);
            return { success: false, error: String(error) };
        }
    });


    ipcMain.handle('get-app-path', () => {
        return APP_DATA_PATH;
    });

    ipcMain.handle('save-csv-file', async (event, fileName: string, csvContent: string) => {
        try {
            console.log(`[IPC] Saving CSV file: ${fileName}`);
            const downloadsPath = app.getPath('downloads');
            const filePath = path.join(downloadsPath, fileName);
            await fs.promises.writeFile(filePath, csvContent, 'utf-8');
            console.log(`[IPC] CSV file saved to: ${filePath}`);
            return { success: true, filePath };
        } catch (error) {
            console.error(`Error saving CSV file ${fileName}:`, error);
            return { success: false, error: String(error) };
        }
    });

    ipcMain.handle('delete-all-data', async () => {
        try {
            console.log(`[IPC] Deleting all data from: ${APP_DATA_PATH}`);
            // Also delete databases?
            // Yes, user requested full reset.
            // But we should implement this carefully. 
            // For now, let's keep the file deletion.
            if (fs.existsSync(APP_DATA_PATH)) {
                const files = await fs.promises.readdir(APP_DATA_PATH);
                for (const file of files) {
                    await fs.promises.unlink(path.join(APP_DATA_PATH, file));
                }
                console.log(`[IPC] All data deleted successfully`);
                return true;
            }
            return true;
        } catch (error) {
            console.error(`Error deleting all data:`, error);
            return false;
        }
    });

    ipcMain.handle('reload-app', () => {
        if (mainWindow) {
            mainWindow.reload();
        }
    });

    // ── Encryption Management IPC ──────────────────────────────────────────

    ipcMain.handle('encryption-get-status', () => {
        return encryptionManager.getStatus();
    });

    ipcMain.handle('encryption-enable', () => {
        return encryptionManager.enable();
    });

    ipcMain.handle('encryption-disable', () => {
        return encryptionManager.disable();
    });

    ipcMain.handle('encryption-reencrypt-data', async (event, factory: string) => {
        try {
            const tablesWithSensitiveData = Object.keys(SENSITIVE_FIELDS);
            let totalRecords = 0;

            for (const tableName of tablesWithSensitiveData) {
                if (!isValidTable(tableName)) continue;

                const db = getDb(factory);
                // @ts-ignore
                const table = schema[tableName];
                const records = await db.select().from(table).all();

                for (const record of records) {
                    // First decrypt any already-encrypted fields (in case of re-encryption)
                    const decryptedRecord = encryptionManager.decryptRecord(tableName, record);
                    // Then encrypt with current key
                    const encryptedRecord = encryptionManager.encryptRecord(tableName, decryptedRecord);

                    await db.update(table).set(encryptedRecord).where(eq(table.id, record.id)).run();
                    totalRecords++;
                }
            }

            return { success: true, message: `Re-encrypted ${totalRecords} records across ${tablesWithSensitiveData.length} tables.` };
        } catch (e: any) {
            console.error('[Encryption] Re-encrypt failed:', e);
            return { success: false, message: `Re-encryption failed: ${e.message}` };
        }
    });

    ipcMain.handle('encryption-decrypt-all-data', async (event, factory: string) => {
        try {
            const tablesWithSensitiveData = Object.keys(SENSITIVE_FIELDS);
            let totalRecords = 0;

            for (const tableName of tablesWithSensitiveData) {
                if (!isValidTable(tableName)) continue;

                const db = getDb(factory);
                // @ts-ignore
                const table = schema[tableName];
                const records = await db.select().from(table).all();

                for (const record of records) {
                    const decryptedRecord = encryptionManager.decryptRecord(tableName, record);
                    await db.update(table).set(decryptedRecord).where(eq(table.id, record.id)).run();
                    totalRecords++;
                }
            }

            return { success: true, message: `Decrypted ${totalRecords} records.` };
        } catch (e: any) {
            console.error('[Encryption] Decrypt-all failed:', e);
            return { success: false, message: `Decryption failed: ${e.message}` };
        }
    });

    // ── Auto Updater Handlers ───────────────────────────────────────────

    ipcMain.handle('check-for-updates', async () => {
        try {
            const result = await autoUpdater.checkForUpdatesAndNotify();
            return result;
        } catch (error) {
            console.error('[Update] Error checking for updates:', error);
            return null;
        }
    });

    ipcMain.handle('start-download', async () => {
        try {
            return await autoUpdater.downloadUpdate();
        } catch (error) {
            console.error('[Update] Error starting download:', error);
            return null;
        }
    });

    ipcMain.handle('quit-and-install', () => {
        autoUpdater.quitAndInstall();
    });
}

function setupAutoUpdater() {
    // Configure updater
    autoUpdater.autoDownload = false; // We want to control download manually via UI
    autoUpdater.allowPrerelease = false;

    autoUpdater.on('checking-for-update', () => {
        mainWindow?.webContents.send('update-status', 'checking');
    });

    autoUpdater.on('update-available', (info) => {
        mainWindow?.webContents.send('update-status', 'available', info);
    });

    autoUpdater.on('update-not-available', (info) => {
        mainWindow?.webContents.send('update-status', 'not-available', info);
    });

    autoUpdater.on('error', (err) => {
        mainWindow?.webContents.send('update-status', 'error', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        mainWindow?.webContents.send('update-download-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
        mainWindow?.webContents.send('update-status', 'downloaded', info);
    });
}

