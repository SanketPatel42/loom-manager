import crypto from 'crypto';
import { app, safeStorage } from 'electron';
import path from 'path';
import fs from 'fs';

// ── Constants ──────────────────────────────────────────────────────────────────
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;
const KEY_FILE_NAME = 'encryption.key';
const SALT_FILE_NAME = 'encryption.salt';
const ENCRYPTION_META_FILE = 'encryption.meta.json';

// ── Types ──────────────────────────────────────────────────────────────────────
interface EncryptionMeta {
    enabled: boolean;
    createdAt: string;
    algorithm: string;
    keyDerivation: string;
    version: number;
}

// Sensitive fields per table that should be encrypted
export const SENSITIVE_FIELDS: Record<string, string[]> = {
    workerProfiles: ['phoneNumber', 'emergencyContact'],
    firms: ['gstNumber', 'phoneNumber', 'email', 'contactPerson', 'address'],
    sales: ['party', 'amount', 'total'],
    purchases: ['supplier', 'total'],
    transactions: ['amount', 'payee', 'purpose'],
    begariWorkers: ['phoneNumber', 'monthlySalary'],
    tfoWorkers: ['phoneNumber', 'fullDaySalary'],
    masterWorkers: ['phoneNumber', 'monthlySalary'],
    wiremanWorkers: ['phoneNumber'],
    wiremanBills: ['billAmount'],
    bobbinWorkers: ['phoneNumber', 'fullDaySalary'],
};

// ── Key Management ─────────────────────────────────────────────────────────────

class EncryptionManager {
    private encryptionKey: Buffer | null = null;
    private dataPath: string;
    private _isEnabled: boolean = false;

    constructor() {
        this.dataPath = path.join(app.getPath('userData'), 'data');
        this.ensureDataDir();
        this.loadState();
    }

    private ensureDataDir() {
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }
    }

    private getMetaPath(): string {
        return path.join(this.dataPath, ENCRYPTION_META_FILE);
    }

    private getSaltPath(): string {
        return path.join(this.dataPath, SALT_FILE_NAME);
    }

    private getKeyPath(): string {
        return path.join(this.dataPath, KEY_FILE_NAME);
    }

    /**
     * Load encryption state from metadata file
     */
    private loadState() {
        try {
            const metaPath = this.getMetaPath();
            if (fs.existsSync(metaPath)) {
                const meta: EncryptionMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                this._isEnabled = meta.enabled;
                if (this._isEnabled) {
                    this.loadKey();
                }
            }
        } catch (e) {
            console.error('[Encryption] Failed to load state:', e);
            this._isEnabled = false;
        }
    }

    /**
     * Load or derive the encryption key
     */
    private loadKey(): boolean {
        try {
            // Try safeStorage first (OS keychain)
            if (safeStorage.isEncryptionAvailable()) {
                const keyPath = this.getKeyPath();
                if (fs.existsSync(keyPath)) {
                    const encryptedKey = fs.readFileSync(keyPath);
                    const decryptedKey = safeStorage.decryptString(encryptedKey);
                    this.encryptionKey = Buffer.from(decryptedKey, 'hex');
                    console.log('[Encryption] Key loaded from OS keychain');
                    return true;
                }
            }

            // Fallback: key stored with machine-specific obfuscation
            const keyPath = this.getKeyPath() + '.fallback';
            if (fs.existsSync(keyPath)) {
                const obfuscated = fs.readFileSync(keyPath, 'utf-8');
                this.encryptionKey = this.deobfuscateKey(obfuscated);
                console.log('[Encryption] Key loaded from fallback storage');
                return true;
            }

            return false;
        } catch (e) {
            console.error('[Encryption] Failed to load key:', e);
            return false;
        }
    }

    /**
     * Generate and store a new encryption key
     */
    private generateAndStoreKey(): Buffer {
        const key = crypto.randomBytes(KEY_LENGTH);

        try {
            // Try safeStorage first (OS keychain - most secure)
            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = safeStorage.encryptString(key.toString('hex'));
                fs.writeFileSync(this.getKeyPath(), encrypted);
                console.log('[Encryption] Key stored in OS keychain');
            } else {
                // Fallback: obfuscate and store in filesystem
                const obfuscated = this.obfuscateKey(key);
                fs.writeFileSync(this.getKeyPath() + '.fallback', obfuscated, 'utf-8');
                console.log('[Encryption] Key stored with fallback obfuscation');
            }
        } catch (e) {
            console.error('[Encryption] Failed to store key, using in-memory only:', e);
        }

        return key;
    }

    /**
     * Simple obfuscation for fallback key storage (XOR with machine-specific data)
     * This is NOT cryptographically secure, but better than plaintext
     */
    private obfuscateKey(key: Buffer): string {
        const machineId = this.getMachineFingerprint();
        const xorKey = crypto.createHash('sha256').update(machineId).digest();
        const result = Buffer.alloc(KEY_LENGTH);
        for (let i = 0; i < KEY_LENGTH; i++) {
            result[i] = key[i] ^ xorKey[i % xorKey.length];
        }
        return result.toString('hex');
    }

    private deobfuscateKey(obfuscated: string): Buffer {
        const machineId = this.getMachineFingerprint();
        const xorKey = crypto.createHash('sha256').update(machineId).digest();
        const data = Buffer.from(obfuscated, 'hex');
        const result = Buffer.alloc(KEY_LENGTH);
        for (let i = 0; i < KEY_LENGTH; i++) {
            result[i] = data[i] ^ xorKey[i % xorKey.length];
        }
        return result;
    }

    private getMachineFingerprint(): string {
        // Combine various machine-specific attributes
        const os = require('os');
        return `${os.hostname()}-${os.userInfo().username}-${app.getPath('userData')}`;
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    get isEnabled(): boolean {
        return this._isEnabled;
    }

    /**
     * Enable encryption on the database
     */
    enable(): { success: boolean; message: string } {
        try {
            if (this._isEnabled) {
                return { success: true, message: 'Encryption is already enabled' };
            }

            // Generate new key
            this.encryptionKey = this.generateAndStoreKey();

            // Save metadata
            const meta: EncryptionMeta = {
                enabled: true,
                createdAt: new Date().toISOString(),
                algorithm: ALGORITHM,
                keyDerivation: 'random-256',
                version: 1,
            };
            fs.writeFileSync(this.getMetaPath(), JSON.stringify(meta, null, 2));

            this._isEnabled = true;
            console.log('[Encryption] Encryption enabled successfully');

            return { success: true, message: 'Encryption enabled successfully. Existing data will be encrypted on next save.' };
        } catch (e: any) {
            console.error('[Encryption] Failed to enable:', e);
            return { success: false, message: `Failed to enable encryption: ${e.message}` };
        }
    }

    /**
     * Disable encryption
     */
    disable(): { success: boolean; message: string } {
        try {
            this._isEnabled = false;
            this.encryptionKey = null;

            // Update metadata
            const metaPath = this.getMetaPath();
            if (fs.existsSync(metaPath)) {
                const meta: EncryptionMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                meta.enabled = false;
                fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
            }

            // Clean up key files
            const keyPath = this.getKeyPath();
            if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
            if (fs.existsSync(keyPath + '.fallback')) fs.unlinkSync(keyPath + '.fallback');

            console.log('[Encryption] Encryption disabled');
            return { success: true, message: 'Encryption disabled. Data will be stored in plain text on next save.' };
        } catch (e: any) {
            console.error('[Encryption] Failed to disable:', e);
            return { success: false, message: `Failed to disable encryption: ${e.message}` };
        }
    }

    /**
     * Get encryption status info
     */
    getStatus(): {
        enabled: boolean;
        algorithm: string;
        keyStorage: string;
        sensitiveFields: Record<string, string[]>;
        createdAt?: string;
    } {
        let meta: EncryptionMeta | null = null;
        try {
            const metaPath = this.getMetaPath();
            if (fs.existsSync(metaPath)) {
                meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            }
        } catch (e) { /* ignore */ }

        return {
            enabled: this._isEnabled,
            algorithm: ALGORITHM.toUpperCase(),
            keyStorage: safeStorage.isEncryptionAvailable() ? 'OS Keychain (Secure)' : 'Filesystem (Obfuscated)',
            sensitiveFields: SENSITIVE_FIELDS,
            createdAt: meta?.createdAt,
        };
    }

    /**
     * Encrypt a string value
     */
    encrypt(plaintext: string): string {
        if (!this._isEnabled || !this.encryptionKey) return plaintext;

        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);

            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const authTag = cipher.getAuthTag();

            // Format: ENC:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
            return `ENC:v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
        } catch (e) {
            console.error('[Encryption] Encrypt failed:', e);
            return plaintext; // Fail-safe: return unencrypted
        }
    }

    /**
     * Decrypt a string value
     */
    decrypt(ciphertext: string): string {
        if (!this._isEnabled || !this.encryptionKey) return ciphertext;

        // Check if the value is actually encrypted
        if (!ciphertext.startsWith('ENC:v1:')) return ciphertext;

        try {
            const parts = ciphertext.split(':');
            if (parts.length !== 5) return ciphertext;

            const iv = Buffer.from(parts[2], 'hex');
            const authTag = Buffer.from(parts[3], 'hex');
            const encrypted = parts[4];

            const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (e) {
            console.error('[Encryption] Decrypt failed:', e);
            return ciphertext; // Fail-safe: return as-is
        }
    }

    /**
     * Encrypt sensitive fields of a record based on the table name
     */
    encryptRecord(tableName: string, record: any): any {
        if (!this._isEnabled || !record) return record;

        const fields = SENSITIVE_FIELDS[tableName];
        if (!fields) return record;

        const encrypted = { ...record };
        for (const field of fields) {
            if (encrypted[field] !== undefined && encrypted[field] !== null) {
                const value = String(encrypted[field]);
                // Don't double-encrypt
                if (!value.startsWith('ENC:v1:')) {
                    encrypted[field] = this.encrypt(value);
                }
            }
        }
        return encrypted;
    }

    /**
     * Decrypt sensitive fields of a record based on the table name
     */
    decryptRecord(tableName: string, record: any): any {
        if (!this._isEnabled || !record) return record;

        const fields = SENSITIVE_FIELDS[tableName];
        if (!fields) return record;

        const decrypted = { ...record };
        for (const field of fields) {
            if (decrypted[field] !== undefined && decrypted[field] !== null) {
                const value = String(decrypted[field]);
                if (value.startsWith('ENC:v1:')) {
                    const decryptedValue = this.decrypt(value);
                    // Try to restore original type (number)
                    const num = Number(decryptedValue);
                    decrypted[field] = isNaN(num) ? decryptedValue : num;
                }
            }
        }
        return decrypted;
    }

    /**
     * Decrypt an array of records
     */
    decryptRecords(tableName: string, records: any[]): any[] {
        if (!this._isEnabled) return records;
        return records.map(r => this.decryptRecord(tableName, r));
    }
}

// Singleton instance
export const encryptionManager = new EncryptionManager();
