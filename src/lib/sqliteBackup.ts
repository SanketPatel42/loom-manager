/**
 * SQLite Backup Utility
 * 
 * Creates a proper SQLite .db file from browser data using sql.js (WebAssembly SQLite).
 * This makes Google Drive backups look professional instead of raw JSON files.
 * 
 * The .db file is a real SQLite database that can be opened with any SQLite viewer.
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

// Cache the SQL.js init promise so we only load WASM once
let sqlJsPromise: Promise<ReturnType<typeof initSqlJs>> | null = null;

const getSqlJs = () => {
    if (!sqlJsPromise) {
        sqlJsPromise = initSqlJs({
            // Load WASM from CDN - works in browser
            locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        });
    }
    return sqlJsPromise;
};

// ── Table definitions matching our schema ────────────────────────────
// These CREATE TABLE statements mirror the Drizzle schema in src/lib/db/schema.ts

const TABLE_SCHEMAS: Record<string, string> = {
    beams: `CREATE TABLE IF NOT EXISTS beams (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        warper TEXT NOT NULL,
        beam_no TEXT NOT NULL,
        no_of_takas INTEGER NOT NULL,
        no_of_tar INTEGER NOT NULL,
        price_per_beam REAL NOT NULL,
        quality_id TEXT,
        total REAL DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    takas: `CREATE TABLE IF NOT EXISTS takas (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        available REAL DEFAULT 0,
        folded REAL DEFAULT 0,
        remaining REAL DEFAULT 0,
        quality_id TEXT,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    worker_profiles: `CREATE TABLE IF NOT EXISTS worker_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        emergency_contact TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    qualities: `CREATE TABLE IF NOT EXISTS qualities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rate_per_meter REAL NOT NULL,
        description TEXT,
        epi REAL,
        ppi REAL,
        width REAL,
        reed_space REAL,
        reed_count TEXT,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    sales: `CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        firm TEXT NOT NULL,
        quality TEXT NOT NULL,
        meters REAL NOT NULL,
        rate REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        quality_id TEXT,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    purchases: `CREATE TABLE IF NOT EXISTS purchases (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        supplier TEXT NOT NULL,
        yarn_type TEXT NOT NULL,
        danier TEXT NOT NULL,
        quantity REAL NOT NULL,
        rate REAL NOT NULL,
        bags REAL DEFAULT 0,
        total REAL NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    firms: `CREATE TABLE IF NOT EXISTS firms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gst TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        documents TEXT DEFAULT '[]',
        created_at INTEGER,
        updated_at INTEGER
    )`,
    transactions: `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        firm TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        reference TEXT,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    stock: `CREATE TABLE IF NOT EXISTS stock (
        id TEXT PRIMARY KEY,
        yarn_type TEXT NOT NULL,
        danier TEXT NOT NULL,
        quantity REAL NOT NULL,
        rate REAL NOT NULL,
        total_weight REAL NOT NULL DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    beam_pasar: `CREATE TABLE IF NOT EXISTS beam_pasar (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        beam_no TEXT NOT NULL,
        pieces REAL NOT NULL,
        rate_per_beam REAL NOT NULL,
        quality_id TEXT,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    worker_sheet_data: `CREATE TABLE IF NOT EXISTS worker_sheet_data (
        id TEXT PRIMARY KEY DEFAULT 'main',
        assignments TEXT NOT NULL,
        grid_data TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
    )`,
    notes: `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'note',
        reminder_date TEXT,
        is_completed INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
    )`
};

// Metadata table for backup info
const METADATA_SCHEMA = `CREATE TABLE IF NOT EXISTS _backup_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
)`;

// ── Column name mapping ──────────────────────────────────────────────
// Maps JavaScript camelCase keys to SQLite snake_case column names

const COLUMN_MAP: Record<string, string> = {
    beamNo: 'beam_no',
    noOfTakas: 'no_of_takas',
    noOfTar: 'no_of_tar',
    pricePerBeam: 'price_per_beam',
    qualityId: 'quality_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    phoneNumber: 'phone_number',
    emergencyContact: 'emergency_contact',
    ratePerMeter: 'rate_per_meter',
    reedSpace: 'reed_space',
    reedCount: 'reed_count',
    yarnType: 'yarn_type',
    totalWeight: 'total_weight',
    ratePerBeam: 'rate_per_beam',
    gridData: 'grid_data',
    reminderDate: 'reminder_date',
    isCompleted: 'is_completed',
};

const toSnakeCase = (key: string): string => {
    return COLUMN_MAP[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const toCamelCase = (key: string): string => {
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// ── Export: Create SQLite .db from data ──────────────────────────────

export const createSqliteBackup = async (
    data: Record<string, any[]>
): Promise<Uint8Array> => {
    const SQL = await getSqlJs();
    const db = new SQL.Database();

    try {
        // Create metadata table
        db.run(METADATA_SCHEMA);
        db.run(`INSERT INTO _backup_metadata (key, value) VALUES ('version', '2.0.0')`);
        db.run(`INSERT INTO _backup_metadata (key, value) VALUES ('timestamp', '${new Date().toISOString()}')`);
        db.run(`INSERT INTO _backup_metadata (key, value) VALUES ('app', 'Grey Loom Manager')`);
        db.run(`INSERT INTO _backup_metadata (key, value) VALUES ('format', 'sqlite')`);

        // Create tables and insert data
        for (const [tableName, records] of Object.entries(data)) {
            const createSql = TABLE_SCHEMAS[tableName];
            if (!createSql) {
                console.warn(`[SQLite Backup] Unknown table: ${tableName}, skipping`);
                continue;
            }

            // Create the table
            db.run(createSql);

            if (!Array.isArray(records) || records.length === 0) continue;

            // Insert records using transactions for speed
            db.run('BEGIN TRANSACTION');

            for (const record of records) {
                const snakeCaseRecord: Record<string, any> = {};
                for (const [key, value] of Object.entries(record)) {
                    const snakeKey = toSnakeCase(key);
                    // Serialize objects/arrays to JSON strings
                    if (typeof value === 'object' && value !== null) {
                        snakeCaseRecord[snakeKey] = JSON.stringify(value);
                    } else {
                        snakeCaseRecord[snakeKey] = value;
                    }
                }

                const columns = Object.keys(snakeCaseRecord);
                const placeholders = columns.map(() => '?').join(', ');
                const values = columns.map(col => snakeCaseRecord[col]);

                try {
                    db.run(
                        `INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
                        values
                    );
                } catch (e) {
                    console.warn(`[SQLite Backup] Failed to insert record into ${tableName}:`, e);
                }
            }

            db.run('COMMIT');
        }

        // Export the database as a binary Uint8Array
        return db.export();
    } finally {
        db.close();
    }
};

// ── Import: Parse SQLite .db back to data ────────────────────────────

export const parseSqliteBackup = async (
    dbBytes: Uint8Array
): Promise<{ data: Record<string, any[]>; metadata: Record<string, string> }> => {
    const SQL = await getSqlJs();
    const db = new SQL.Database(dbBytes);

    try {
        // Read metadata
        const metadata: Record<string, string> = {};
        try {
            const metaResult = db.exec('SELECT key, value FROM _backup_metadata');
            if (metaResult.length > 0) {
                for (const row of metaResult[0].values) {
                    metadata[row[0] as string] = row[1] as string;
                }
            }
        } catch {
            // No metadata table - might be a raw sqlite file
        }

        // Read all tables
        const data: Record<string, any[]> = {};
        const tablesResult = db.exec(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_%'"
        );

        if (tablesResult.length > 0) {
            for (const tableRow of tablesResult[0].values) {
                const tableName = tableRow[0] as string;
                const result = db.exec(`SELECT * FROM ${tableName}`);

                if (result.length > 0) {
                    const columns = result[0].columns;
                    const records = result[0].values.map(row => {
                        const record: Record<string, any> = {};
                        for (let i = 0; i < columns.length; i++) {
                            const camelKey = toCamelCase(columns[i]);
                            let value = row[i];

                            // Try to parse JSON strings back to objects
                            if (typeof value === 'string') {
                                try {
                                    const parsed = JSON.parse(value);
                                    if (typeof parsed === 'object' && parsed !== null) {
                                        value = parsed;
                                    }
                                } catch {
                                    // Not JSON, keep as string
                                }
                            }

                            record[camelKey] = value;
                        }
                        return record;
                    });
                    data[tableName] = records;
                } else {
                    data[tableName] = [];
                }
            }
        }

        return { data, metadata };
    } finally {
        db.close();
    }
};

// ── Helper: Convert Uint8Array to Blob ───────────────────────────────

export const sqliteBytesToBlob = (bytes: Uint8Array): Blob => {
    return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/x-sqlite3' });
};

// ── Helper: Convert File/Blob to Uint8Array ──────────────────────────

export const blobToSqliteBytes = async (blob: Blob): Promise<Uint8Array> => {
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
};
