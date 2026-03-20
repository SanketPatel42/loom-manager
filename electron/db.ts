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
    const sanitizedPrefix = factoryPrefix.replace(/[^a-z0-9]/gi, '_');
    // If the prefix already starts with 'factory_', don't double it
    const dbName = sanitizedPrefix.startsWith('factory_')
        ? `${sanitizedPrefix}.db`
        : (sanitizedPrefix ? `factory_${sanitizedPrefix}.db` : 'main.db');

    const userDataPath = app.getPath('userData');
    const dataPath = path.join(userDataPath, 'data');

    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    const dbPath = path.join(dataPath, dbName);
    const logPath = path.join(userDataPath, 'db-init.log');

    const log = (msg: string) => {
        const line = `[${new Date().toISOString()}] ${msg}\n`;
        console.log(line.trim());
        fs.appendFileSync(logPath, line);
    };

    log(`Initializing database for factory '${factoryPrefix}' at: ${dbPath}`);

    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');

    const db = drizzle(sqlite, { schema });

    let migrationsFolder: string;
    if (app.isPackaged) {
        // Try multiple potential locations for migrations
        // Windows: app.asar.unpacked is in the same directory as app.asar
        // macOS: app.asar.unpacked is in Contents/Resources
        const pathsToTry = [
            // extraResources path (most reliable)
            path.join(process.resourcesPath, 'drizzle'),
            // Windows NSIS installer path
            path.join(path.dirname(app.getPath('exe')), 'resources', 'app.asar.unpacked', 'drizzle'),
            // Windows portable/standard path
            path.join(app.getAppPath(), '..', 'app.asar.unpacked', 'drizzle'),
            // macOS path
            path.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle'),
            // Fallback: direct drizzle folder
            path.join(app.getAppPath(), 'drizzle'),
            path.join(path.dirname(app.getPath('exe')), 'drizzle')
        ];

        migrationsFolder = pathsToTry[0]; // Default
        for (const p of pathsToTry) {
            log(`Checking migration path: ${p}`);
            if (fs.existsSync(p)) {
                migrationsFolder = p;
                log(`Found migrations at: ${p}`);
                break;
            }
        }
    } else {
        migrationsFolder = path.join(process.cwd(), 'drizzle');
    }

    if (fs.existsSync(migrationsFolder)) {
        try {
            const files = fs.readdirSync(migrationsFolder);
            log(`Migration folder contents: ${files.join(', ')}`);

            log(`Running migrations...`);
            migrate(db, { migrationsFolder });
            log(`Migrations completed successfully`);
        } catch (e: any) {
            log(`Drizzle migrate() failed: ${e.message}. Attempting manual SQL fallback...`);
            // Fallback: run each SQL file directly with IF NOT EXISTS safety
            try {
                const sqlFiles = fs.readdirSync(migrationsFolder)
                    .filter(f => f.endsWith('.sql'))
                    .sort();
                for (const sqlFile of sqlFiles) {
                    const sqlPath = path.join(migrationsFolder, sqlFile);
                    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
                    // Split on Drizzle's statement-breakpoint marker
                    const statements = sqlContent
                        .split(/--> statement-breakpoint/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                    for (const stmt of statements) {
                        try {
                            // Convert CREATE TABLE to CREATE TABLE IF NOT EXISTS for safety
                            const safeStmt = stmt.replace(
                                /CREATE TABLE (`[^`]+`|\w+)/g,
                                'CREATE TABLE IF NOT EXISTS $1'
                            );
                            sqlite.exec(safeStmt);
                        } catch (stmtErr: any) {
                            // Ignore "already exists" and "duplicate column" errors
                            if (!stmtErr.message?.includes('already exists') &&
                                !stmtErr.message?.includes('duplicate column')) {
                                log(`  Warning: Failed stmt in ${sqlFile}: ${stmtErr.message}`);
                            }
                        }
                    }
                }
                log(`Manual SQL fallback completed successfully`);
            } catch (fallbackErr: any) {
                log(`Manual fallback also failed: ${fallbackErr.message}`);
                // Don't throw — allow app to continue with whatever tables exist
            }
        }
    } else {
        log(`CRITICAL: Migrations folder NOT FOUND at ${migrationsFolder}`);
        log(`App path: ${app.getAppPath()}`);
        log(`Exe path: ${app.getPath('exe')}`);
        log(`Resources path: ${process.resourcesPath}`);
        log(`Process cwd: ${process.cwd()}`);

        // List all paths we tried
        log(`Paths tried:`);
        if (app.isPackaged) {
            const pathsToTry = [
                path.join(path.dirname(app.getPath('exe')), 'resources', 'app.asar.unpacked', 'drizzle'),
                path.join(app.getAppPath(), '..', 'app.asar.unpacked', 'drizzle'),
                path.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle'),
                path.join(app.getAppPath(), 'drizzle'),
                path.join(path.dirname(app.getPath('exe')), 'drizzle')
            ];
            pathsToTry.forEach(p => log(`  - ${p} (exists: ${fs.existsSync(p)})`));
        }

        // Don't throw - allow app to continue without migrations if folder is missing
        // This can happen in development or if build is misconfigured
        log(`WARNING: App will continue without running migrations. Database may not be initialized properly.`);
    }

    dbInstances.set(factoryPrefix, db);
    return db;
};

const toCamel = (s: string): string => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};

export const getSchemaTableKey = (tableName: string): string => {
    let schemaKey = toCamel(tableName);
    // Special cases that don't follow generic snake_to_camel
    if (tableName === 'beam_pasar') schemaKey = 'beamPasar';
    return schemaKey;
};

// Helper to sanitize table names for security and map to schema keys
export const isValidTable = (tableName: string): boolean => {
    const validTables = Object.keys(schema);
    const schemaKey = getSchemaTableKey(tableName);

    // Some tables are already valid as-is (like 'beams'), others need camelCase transformation
    const isValid = validTables.includes(tableName) || validTables.includes(schemaKey);

    if (!isValid) {
        console.error(`[DB] Invalid table requested: ${tableName}. Valid keys: ${validTables.join(', ')}`);
    }
    return isValid;
};
