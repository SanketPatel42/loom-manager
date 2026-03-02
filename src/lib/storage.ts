// ============================================================
// storage.ts — Unified storage adapter
//
// In ELECTRON mode → delegates to electronDb (SQLite via IPC)
// In BROWSER mode  → delegates to browserDb (localStorage wrapper)
//
// All public methods are async.  Components should use:
//   const db = storage.async;
//   const items = await db.getBeams();
// ============================================================

import { storage as localStorageSync } from './localStorage';
import { electronDb } from './electronDb';
import { browserDb } from './browserDb';

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

// The async database to use (recommended for all new code)
export const asyncStorage = isElectron ? electronDb : browserDb;

// Unified storage adapter w/ backward‑compat sync fallback
export const storage = isElectron
  ? {
    ...localStorageSync,  // sync fallback base
    ...electronDb,        // async overrides
    async: electronDb,
  }
  : {
    ...localStorageSync,  // sync fallback base
    async: browserDb,
  };

// Re-export for flexibility
export { electronDb, browserDb };

// Helper to check if async storage is available
export const isDatabaseMode = () => true; // always true — we always use a database layer now