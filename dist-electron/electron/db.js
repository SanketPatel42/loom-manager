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
exports.isValidTable = exports.getSchemaTableKey = exports.getDb = exports.schema = void 0;
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
    const sanitizedPrefix = factoryPrefix.replace(/[^a-z0-9]/gi, '_');
    // If the prefix already starts with 'factory_', don't double it
    const dbName = sanitizedPrefix.startsWith('factory_')
        ? `${sanitizedPrefix}.db`
        : (sanitizedPrefix ? `factory_${sanitizedPrefix}.db` : 'main.db');
    const userDataPath = electron_1.app.getPath('userData');
    const dataPath = path_1.default.join(userDataPath, 'data');
    if (!fs_1.default.existsSync(dataPath)) {
        fs_1.default.mkdirSync(dataPath, { recursive: true });
    }
    const dbPath = path_1.default.join(dataPath, dbName);
    const logPath = path_1.default.join(userDataPath, 'db-init.log');
    const log = (msg) => {
        const line = `[${new Date().toISOString()}] ${msg}\n`;
        console.log(line.trim());
        fs_1.default.appendFileSync(logPath, line);
    };
    log(`Initializing database for factory '${factoryPrefix}' at: ${dbPath}`);
    const sqlite = new better_sqlite3_1.default(dbPath);
    sqlite.pragma('journal_mode = WAL');
    const db = (0, better_sqlite3_2.drizzle)(sqlite, { schema });
    let migrationsFolder;
    if (electron_1.app.isPackaged) {
        // Try multiple potential locations for migrations
        const pathsToTry = [
            path_1.default.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle'),
            path_1.default.join(electron_1.app.getAppPath(), '..', 'app.asar.unpacked', 'drizzle'),
            path_1.default.join(path_1.default.dirname(electron_1.app.getPath('exe')), 'Resources', 'app.asar.unpacked', 'drizzle')
        ];
        migrationsFolder = pathsToTry[0]; // Default
        for (const p of pathsToTry) {
            log(`Checking migration path: ${p}`);
            if (fs_1.default.existsSync(p)) {
                migrationsFolder = p;
                log(`Found migrations at: ${p}`);
                break;
            }
        }
    }
    else {
        migrationsFolder = path_1.default.join(process.cwd(), 'drizzle');
    }
    if (fs_1.default.existsSync(migrationsFolder)) {
        try {
            const files = fs_1.default.readdirSync(migrationsFolder);
            log(`Migration folder contents: ${files.join(', ')}`);
            log(`Running migrations...`);
            (0, migrator_1.migrate)(db, { migrationsFolder });
            log(`Migrations completed successfully`);
        }
        catch (e) {
            log(`Migration failed: ${e.message}\n${e.stack}`);
            throw e;
        }
    }
    else {
        log(`CRITICAL: Migrations folder NOT FOUND at ${migrationsFolder}`);
    }
    dbInstances.set(factoryPrefix, db);
    return db;
};
exports.getDb = getDb;
const toCamel = (s) => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};
const getSchemaTableKey = (tableName) => {
    let schemaKey = toCamel(tableName);
    // Special cases that don't follow generic snake_to_camel
    if (tableName === 'beam_pasar')
        schemaKey = 'beamPasar';
    return schemaKey;
};
exports.getSchemaTableKey = getSchemaTableKey;
// Helper to sanitize table names for security and map to schema keys
const isValidTable = (tableName) => {
    const validTables = Object.keys(schema);
    const schemaKey = (0, exports.getSchemaTableKey)(tableName);
    // Some tables are already valid as-is (like 'beams'), others need camelCase transformation
    const isValid = validTables.includes(tableName) || validTables.includes(schemaKey);
    if (!isValid) {
        console.error(`[DB] Invalid table requested: ${tableName}. Valid keys: ${validTables.join(', ')}`);
    }
    return isValid;
};
exports.isValidTable = isValidTable;
//# sourceMappingURL=db.js.map