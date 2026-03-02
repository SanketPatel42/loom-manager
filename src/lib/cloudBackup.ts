import { database } from './firebase';
import { ref, set, get, child } from 'firebase/database';
import { browserDb } from './browserDb';

export interface BackupData {
    beams: any[];
    takas: any[];
    worker_profiles: any[];
    qualities: any[];
    sales: any[];
    purchases: any[];
    firms: any[];
    transactions: any[];
    stock: any[];
    beam_pasar: any[];
    worker_sheet_data: any[];
    timestamp: string;
    version: string;
}

/**
 * Cloud Backup Service
 * Handles uploading and downloading data to/from Firebase Realtime Database
 */
export class CloudBackupService {
    private readonly BACKUP_PATH = 'textile_erp_backup';
    private readonly VERSION = '1.0.0';

    /**
     * Check if Firebase is configured and available
     */
    isConfigured(): boolean {
        try {
            return !!database;
        } catch (error) {
            console.error('Firebase not configured:', error);
            return false;
        }
    }

    /**
     * Get the backup path, optionally appending factory ID
     */
    private getBackupPath(factoryId?: string): string {
        return factoryId ? `${this.BACKUP_PATH}/${factoryId}` : this.BACKUP_PATH;
    }

    /**
     * Backup all data to Firebase
     */
    async backupToCloud(factoryId?: string): Promise<{ success: boolean; message: string; timestamp?: string }> {
        try {
            if (!this.isConfigured()) {
                return {
                    success: false,
                    message: 'Firebase is not configured. Please add your Firebase credentials to environment variables.'
                };
            }

            // Export all data from local storage
            // Note: browserDb already handles the active factory prefix internally when exporting,
            // so we just need to ensure we save it to the correct factory path in Firebase.
            const localData = await browserDb.exportData();

            // Prepare backup data with metadata
            const backupData: BackupData = {
                beams: localData.beams || [],
                takas: localData.takas || [],
                worker_profiles: localData.worker_profiles || [],
                qualities: localData.qualities || [],
                sales: localData.sales || [],
                purchases: localData.purchases || [],
                firms: localData.firms || [],
                transactions: localData.transactions || [],
                stock: localData.stock || [],
                beam_pasar: localData.beam_pasar || [],
                worker_sheet_data: localData.worker_sheet_data || [],
                timestamp: new Date().toISOString(),
                version: this.VERSION
            };

            // Upload to Firebase
            const path = this.getBackupPath(factoryId);
            const backupRef = ref(database, path);
            await set(backupRef, backupData);

            return {
                success: true,
                message: 'Data successfully backed up to cloud!',
                timestamp: backupData.timestamp
            };
        } catch (error: any) {
            console.error('Backup error:', error);
            return {
                success: false,
                message: `Backup failed: ${error.message || 'Unknown error'}`
            };
        }
    }

    /**
     * Restore data from Firebase to local storage
     */
    async restoreFromCloud(factoryId?: string): Promise<{ success: boolean; message: string; timestamp?: string }> {
        try {
            if (!this.isConfigured()) {
                return {
                    success: false,
                    message: 'Firebase is not configured. Please add your Firebase credentials to environment variables.'
                };
            }

            // Get backup data from Firebase
            const path = this.getBackupPath(factoryId);
            const backupRef = ref(database, path);
            const snapshot = await get(backupRef);

            if (!snapshot.exists()) {
                return {
                    success: false,
                    message: 'No backup found in cloud. Please create a backup first.'
                };
            }

            const backupData: BackupData = snapshot.val();

            // Validate backup data
            if (!backupData.timestamp) {
                return {
                    success: false,
                    message: 'Invalid backup data format.'
                };
            }

            // Prepare data for import (exclude metadata)
            const { timestamp, version, ...dataToImport } = backupData;

            // Import data to local storage
            await browserDb.importData(dataToImport);

            return {
                success: true,
                message: 'Data successfully restored from cloud!',
                timestamp: timestamp
            };
        } catch (error: any) {
            console.error('Restore error:', error);
            return {
                success: false,
                message: `Restore failed: ${error.message || 'Unknown error'}`
            };
        }
    }

    /**
     * Get backup metadata without downloading all data
     */
    async getBackupInfo(factoryId?: string): Promise<{ exists: boolean; timestamp?: string; version?: string }> {
        try {
            if (!this.isConfigured()) {
                return { exists: false };
            }

            const path = this.getBackupPath(factoryId);
            const backupRef = ref(database, `${path}/timestamp`);
            const versionRef = ref(database, `${path}/version`);

            const [timestampSnapshot, versionSnapshot] = await Promise.all([
                get(backupRef),
                get(versionRef)
            ]);

            if (!timestampSnapshot.exists()) {
                return { exists: false };
            }

            return {
                exists: true,
                timestamp: timestampSnapshot.val(),
                version: versionSnapshot.val()
            };
        } catch (error) {
            console.error('Error getting backup info:', error);
            return { exists: false };
        }
    }

    /**
     * Create a timestamped backup (keeps multiple backups)
     */
    async createTimestampedBackup(factoryId?: string): Promise<{ success: boolean; message: string; backupId?: string }> {
        try {
            if (!this.isConfigured()) {
                return {
                    success: false,
                    message: 'Firebase is not configured. Please add your Firebase credentials to environment variables.'
                };
            }

            // Export all data from local storage
            const localData = await browserDb.exportData();

            // Create backup ID from timestamp
            const backupId = new Date().toISOString().replace(/[:.]/g, '-');

            // Prepare backup data with metadata
            const backupData: BackupData = {
                beams: localData.beams || [],
                takas: localData.takas || [],
                worker_profiles: localData.worker_profiles || [],
                qualities: localData.qualities || [],
                sales: localData.sales || [],
                purchases: localData.purchases || [],
                firms: localData.firms || [],
                transactions: localData.transactions || [],
                stock: localData.stock || [],
                beam_pasar: localData.beam_pasar || [],
                worker_sheet_data: localData.worker_sheet_data || [],
                timestamp: new Date().toISOString(),
                version: this.VERSION
            };

            // Upload to Firebase with timestamped path
            // We store history in a separate path: textile_erp_backup_history/factoryId/backupId
            // OR textile_erp_backup/factoryId_history/backupId
            // Let's use: textile_erp_backup_history/[factoryId/]backupId

            let historyPath = `${this.BACKUP_PATH}_history`;
            if (factoryId) {
                historyPath = `${historyPath}/${factoryId}`;
            }

            const backupRef = ref(database, `${historyPath}/${backupId}`);
            await set(backupRef, backupData);

            // Also update the main backup
            await this.backupToCloud(factoryId);

            return {
                success: true,
                message: 'Timestamped backup created successfully!',
                backupId
            };
        } catch (error: any) {
            console.error('Timestamped backup error:', error);
            return {
                success: false,
                message: `Backup failed: ${error.message || 'Unknown error'}`
            };
        }
    }
}

// Export singleton instance
export const cloudBackupService = new CloudBackupService();
