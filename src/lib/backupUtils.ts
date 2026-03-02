import { browserDb } from './browserDb';
import { createSqliteBackup, parseSqliteBackup, sqliteBytesToBlob, blobToSqliteBytes } from './sqliteBackup';

// Helper to trigger download
const downloadFile = (content: string | Blob, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = content instanceof Blob ? content : new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

export const generateBackupFile = async () => {
    try {
        const data = await browserDb.exportData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Create SQLite .db backup
        const dbBytes = await createSqliteBackup(data);
        const dbBlob = sqliteBytesToBlob(dbBytes);
        const fileName = `loom_manager_backup_${timestamp}.db`;

        downloadFile(dbBlob, fileName, 'application/x-sqlite3');
        return { success: true, fileName };
    } catch (error) {
        console.error('Backup generation failed:', error);

        // Fallback to JSON if SQLite creation fails
        try {
            const data = await browserDb.exportData();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `loom_manager_backup_${timestamp}.json`;
            const jsonContent = JSON.stringify(data, null, 2);
            downloadFile(jsonContent, fileName, 'application/json');
            return { success: true, fileName };
        } catch (fallbackError) {
            console.error('JSON backup fallback also failed:', fallbackError);
            return { success: false, error: fallbackError };
        }
    }
};

// --- Import Logic ---

export const importBackupFile = (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve, reject) => {
        if (file.name.endsWith('.db')) {
            // SQLite database import
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const buffer = e.target?.result as ArrayBuffer;
                    if (!buffer) throw new Error("Empty file");

                    const bytes = new Uint8Array(buffer);
                    const { data } = await parseSqliteBackup(bytes);

                    if (!data.beams && !data.takas) {
                        throw new Error("Invalid database backup: Missing core tables");
                    }

                    await browserDb.importData(data);
                    resolve({ success: true, message: "Database backup restored successfully" });
                } catch (error: any) {
                    console.error("SQLite import failed:", error);
                    reject({ success: false, message: error.message });
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Legacy JSON import
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    if (!content) throw new Error("Empty file");

                    const data = JSON.parse(content);

                    // Validate basic structure
                    if (!data.beams && !data.takas) {
                        throw new Error("Invalid backup format: Missing core tables");
                    }

                    await browserDb.importData(data);
                    resolve({ success: true, message: "Backup restored successfully" });
                } catch (error: any) {
                    console.error("Import failed:", error);
                    reject({ success: false, message: error.message });
                }
            };
            reader.readAsText(file);
        }
    });
};
