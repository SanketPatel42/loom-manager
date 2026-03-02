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
        // In production, use process.resourcesPath to correctly locate the app.asar
        // The dist folder is at app.asar/dist
        // const indexPath = path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
        const indexPath = path_1.default.join(__dirname, '..', 'dist', 'index.html');
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
function setupIpcHandlers() {
    electron_1.ipcMain.handle('read-data', (event, key) => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[IPC] Reading data for key: ${key}`);
            const filePath = path_1.default.join(APP_DATA_PATH, `${key}.json`);
            // Check if file exists using access
            try {
                yield fs_1.default.promises.access(filePath);
            }
            catch (_a) {
                console.log(`[IPC] File not found: ${filePath}`);
                return null;
            }
            const data = yield fs_1.default.promises.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error(`Error reading data for key ${key}:`, error);
            return null;
        }
    }));
    electron_1.ipcMain.handle('write-data', (event, key, data) => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[IPC] Writing data for key: ${key}`);
            const filePath = path_1.default.join(APP_DATA_PATH, `${key}.json`);
            yield fs_1.default.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
            return true;
        }
        catch (error) {
            console.error(`Error writing data for key ${key}:`, error);
            return false;
        }
    }));
    electron_1.ipcMain.handle('get-app-path', () => {
        return APP_DATA_PATH;
    });
    electron_1.ipcMain.handle('save-csv-file', (event, fileName, csvContent) => __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[IPC] Saving CSV file: ${fileName}`);
            // Get the user's Downloads folder path
            const downloadsPath = electron_1.app.getPath('downloads');
            const filePath = path_1.default.join(downloadsPath, fileName);
            // Save the file
            yield fs_1.default.promises.writeFile(filePath, csvContent, 'utf-8');
            console.log(`[IPC] CSV file saved to: ${filePath}`);
            // Return the full path so the UI can show it to the user
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
            if (fs_1.default.existsSync(APP_DATA_PATH)) {
                // Read all files in the directory
                const files = yield fs_1.default.promises.readdir(APP_DATA_PATH);
                // Delete each file
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
}
//# sourceMappingURL=main.js.map