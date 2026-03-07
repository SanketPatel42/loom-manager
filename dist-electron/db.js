"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTable = exports.getDb = exports.schema = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const better_sqlite3_2 = require("drizzle-orm/better-sqlite3");
const migrator_1 = require("drizzle-orm/better-sqlite3/migrator");
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const schema = __importStar(require("../src/lib/db/schema"));
exports.schema = schema;
// Map to store DB connections: factoryPrefix -> DB instance
const dbInstances = new Map();
const getDb = (factoryPrefix = 'default') => {
    // If we already have a connection, return it
    if (dbInstances.has(factoryPrefix)) {
        return dbInstances.get(factoryPrefix);
    }
    // Determine DB path based on factory prefix
    // sanitize prefix to be safe for filenames
    const safePrefix = factoryPrefix.replace(/[^a-z0-9]/gi, '_');
    const dbName = safePrefix ? `factory_${safePrefix}.db` : 'main.db';
    const userDataPath = electron_1.app.getPath('userData');
    const dataPath = path_1.default.join(userDataPath, 'data'); // Keep in data subfolder
    // Ensure data directory exists
    if (!fs_1.default.existsSync(dataPath)) {
        fs_1.default.mkdirSync(dataPath, { recursive: true });
    }
    const dbPath = path_1.default.join(dataPath, dbName);
    console.log(`[DB] Initializing database for factory '${factoryPrefix}' at: ${dbPath}`);
    const sqlite = new better_sqlite3_1.default(dbPath);
    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL');
    // Initialize Drizzle with schema
    const db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });
    // Locate migrations folder
    let migrationsFolder;
    if (electron_1.app.isPackaged) {
        migrationsFolder = path_1.default.join(electron_1.app.getAppPath(), 'drizzle');
    }
    else {
        migrationsFolder = path_1.default.join(process.cwd(), 'drizzle');
    }
    if (fs_1.default.existsSync(migrationsFolder)) {
        try {
            // console.log(`[DB] Running migrations for ${factoryPrefix}...`);
            (0, migrator_1.migrate)(db, { migrationsFolder });
            // console.log(`[DB] Migrations for ${factoryPrefix} completed successfully`);
        }
        catch (e) {
            console.error(`[DB] Migration failed for ${factoryPrefix}:`, e);
            throw e;
        }
    }
    else {
        console.warn('[DB] Migrations folder not found! Skipping migrations.');
    }
    // Cache the connection
    dbInstances.set(factoryPrefix, db);
    return db;
};
exports.getDb = getDb;
// Helper to sanitize table names for security
const isValidTable = (tableName) => {
    return Object.keys(schema).includes(tableName);
};
exports.isValidTable = isValidTable;
//# sourceMappingURL=db.js.map