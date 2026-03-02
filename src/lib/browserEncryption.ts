/**
 * Browser-side encryption utility for localStorage data
 * Uses the Web Crypto API (AES-GCM 256-bit) for encrypting sensitive fields
 * when running in browser mode (non-Electron).
 */

// Sensitive fields per table that should be encrypted (must match electron/encryption.ts)
// Keys use camelCase table names from TABLE_NAMES — consistent across all layers.
export const SENSITIVE_FIELDS: Record<string, string[]> = {
    workerProfiles: ['phoneNumber', 'emergencyContact'],
    firms: ['gstNumber', 'phoneNumber', 'email', 'contactPerson', 'address'],
    sales: ['party', 'amount', 'total'],
    purchases: ['supplier', 'total'],
    transactions: ['amount', 'payee', 'purpose'],
    begariWorkers: ['phoneNumber'],
    tfoWorkers: ['phoneNumber'],
    masterWorkers: ['phoneNumber'],
    wiremanWorkers: ['phoneNumber'],
    bobbinWorkers: ['phoneNumber'],
};

const ENCRYPTION_KEY_STORAGE = 'erp_encryption_key';
const ENCRYPTION_META_STORAGE = 'erp_encryption_meta';

interface EncryptionMeta {
    enabled: boolean;
    createdAt: string;
    algorithm: string;
    version: number;
}

class BrowserEncryption {
    private cryptoKey: CryptoKey | null = null;
    private _isEnabled: boolean = false;

    constructor() {
        this.loadState();
    }

    private loadState() {
        try {
            const meta = localStorage.getItem(ENCRYPTION_META_STORAGE);
            if (meta) {
                const parsed: EncryptionMeta = JSON.parse(meta);
                this._isEnabled = parsed.enabled;
            }
        } catch (e) {
            this._isEnabled = false;
        }
    }

    private async getOrLoadKey(): Promise<CryptoKey | null> {
        if (this.cryptoKey) return this.cryptoKey;

        try {
            const stored = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
            if (!stored) return null;

            const keyData = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
            this.cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
            return this.cryptoKey;
        } catch (e) {
            console.error('[BrowserEncryption] Failed to load key:', e);
            return null;
        }
    }

    private async generateKey(): Promise<CryptoKey> {
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        // Export and store
        const exported = await crypto.subtle.exportKey('raw', key);
        const b64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
        localStorage.setItem(ENCRYPTION_KEY_STORAGE, b64);

        this.cryptoKey = key;
        return key;
    }

    get isEnabled(): boolean {
        return this._isEnabled;
    }

    async enable(): Promise<{ success: boolean; message: string }> {
        try {
            if (!crypto.subtle) {
                return { success: false, message: 'Web Crypto API not available. Use HTTPS or Electron.' };
            }

            await this.generateKey();

            const meta: EncryptionMeta = {
                enabled: true,
                createdAt: new Date().toISOString(),
                algorithm: 'AES-GCM-256',
                version: 1,
            };
            localStorage.setItem(ENCRYPTION_META_STORAGE, JSON.stringify(meta));
            this._isEnabled = true;

            return { success: true, message: 'Browser encryption enabled.' };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    async disable(): Promise<{ success: boolean; message: string }> {
        try {
            this._isEnabled = false;
            this.cryptoKey = null;
            localStorage.removeItem(ENCRYPTION_KEY_STORAGE);

            const meta = localStorage.getItem(ENCRYPTION_META_STORAGE);
            if (meta) {
                const parsed: EncryptionMeta = JSON.parse(meta);
                parsed.enabled = false;
                localStorage.setItem(ENCRYPTION_META_STORAGE, JSON.stringify(parsed));
            }

            return { success: true, message: 'Browser encryption disabled.' };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    getStatus(): {
        enabled: boolean;
        algorithm: string;
        keyStorage: string;
        sensitiveFields: Record<string, string[]>;
        createdAt?: string;
    } {
        let meta: EncryptionMeta | null = null;
        try {
            const stored = localStorage.getItem(ENCRYPTION_META_STORAGE);
            if (stored) meta = JSON.parse(stored);
        } catch (e) { /* ignore */ }

        return {
            enabled: this._isEnabled,
            algorithm: 'AES-GCM-256',
            keyStorage: 'Browser localStorage',
            sensitiveFields: SENSITIVE_FIELDS,
            createdAt: meta?.createdAt,
        };
    }

    async encrypt(plaintext: string): Promise<string> {
        if (!this._isEnabled) return plaintext;

        const key = await this.getOrLoadKey();
        if (!key) return plaintext;

        try {
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(plaintext);

            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encoded
            );

            const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
            const ctHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');

            return `ENC:v1:${ivHex}:${ctHex}`;
        } catch (e) {
            console.error('[BrowserEncryption] Encrypt failed:', e);
            return plaintext;
        }
    }

    async decrypt(ciphertext: string): Promise<string> {
        if (!this._isEnabled) return ciphertext;
        if (!ciphertext.startsWith('ENC:v1:')) return ciphertext;

        const key = await this.getOrLoadKey();
        if (!key) return ciphertext;

        try {
            const parts = ciphertext.split(':');
            if (parts.length !== 4) return ciphertext;

            const iv = new Uint8Array(parts[2].match(/.{1,2}/g)!.map(h => parseInt(h, 16)));
            const ct = new Uint8Array(parts[3].match(/.{1,2}/g)!.map(h => parseInt(h, 16)));

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                ct
            );

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error('[BrowserEncryption] Decrypt failed:', e);
            return ciphertext;
        }
    }

    async encryptRecord(tableName: string, record: any): Promise<any> {
        if (!this._isEnabled || !record) return record;

        const fields = SENSITIVE_FIELDS[tableName];
        if (!fields) return record;

        const encrypted = { ...record };
        for (const field of fields) {
            if (encrypted[field] !== undefined && encrypted[field] !== null) {
                const value = String(encrypted[field]);
                if (!value.startsWith('ENC:v1:')) {
                    encrypted[field] = await this.encrypt(value);
                }
            }
        }
        return encrypted;
    }

    async decryptRecord(tableName: string, record: any): Promise<any> {
        if (!this._isEnabled || !record) return record;

        const fields = SENSITIVE_FIELDS[tableName];
        if (!fields) return record;

        const decrypted = { ...record };
        for (const field of fields) {
            if (decrypted[field] !== undefined && decrypted[field] !== null) {
                const value = String(decrypted[field]);
                if (value.startsWith('ENC:v1:')) {
                    const decryptedValue = await this.decrypt(value);
                    const num = Number(decryptedValue);
                    decrypted[field] = isNaN(num) ? decryptedValue : num;
                }
            }
        }
        return decrypted;
    }

    async decryptRecords(tableName: string, records: any[]): Promise<any[]> {
        if (!this._isEnabled) return records;
        return Promise.all(records.map(r => this.decryptRecord(tableName, r)));
    }
}

export const browserEncryption = new BrowserEncryption();
