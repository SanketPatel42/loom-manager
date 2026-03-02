import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import * as schema from '../src/lib/db/schema';

// Export schema for main.ts usage
export { schema };

// Map to store DB connections: factoryPrefix -> DB instance
const dbInstances = new Map<string, ReturnType<typeof drizzle<typeof schema>>>();

export const getDb = (factoryPrefix: string = 'default') => {
    // If we already have a connection, return it
    if (dbInstances.has(factoryPrefix)) {
        return dbInstances.get(factoryPrefix)!;
    }

    // Determine DB path based on factory prefix
    // sanitize prefix to be safe for filenames
    const safePrefix = factoryPrefix.replace(/[^a-z0-9]/gi, '_');
    const dbName = safePrefix ? `factory_${safePrefix}.db` : 'main.db';

    const userDataPath = app.getPath('userData');
    const dataPath = path.join(userDataPath, 'data'); // Keep in data subfolder

    // Ensure data directory exists
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    const dbPath = path.join(dataPath, dbName);

    console.log(`[DB] Initializing database for factory '${factoryPrefix}' at: ${dbPath}`);

    const sqlite = new Database(dbPath);
    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL');

    // Initialize Drizzle with schema
    const db = drizzle(sqlite, { schema });

    // Locate migrations folder
    let migrationsFolder: string;

    if (app.isPackaged) {
        migrationsFolder = path.join(app.getAppPath(), 'drizzle');
    } else {
        migrationsFolder = path.join(process.cwd(), 'drizzle');
    }

    if (fs.existsSync(migrationsFolder)) {
        try {
            // console.log(`[DB] Running migrations for ${factoryPrefix}...`);
            migrate(db, { migrationsFolder });
            // console.log(`[DB] Migrations for ${factoryPrefix} completed successfully`);
        } catch (e) {
            console.error(`[DB] Migration failed for ${factoryPrefix}:`, e);
            throw e;
        }
    } else {
        console.warn('[DB] Migrations folder not found! Skipping migrations.');
    }

    // Cache the connection
    dbInstances.set(factoryPrefix, db);

    return db;
};

// Helper to sanitize table names for security
export const isValidTable = (tableName: string): boolean => {
    return Object.keys(schema).includes(tableName);
}
