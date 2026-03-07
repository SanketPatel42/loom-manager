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
    ...electronDb,        // This only spreads properties, not methods!
    // Explicitly map methods or use proxies if needed, but for now, 
    // let's ensure the key methods are available or use asyncStorage directly.
    async: electronDb,
    getWorkerProfiles: () => electronDb.getWorkerProfiles(),
    getQualities: () => electronDb.getQualities(),
    getWorkerSheetData: () => electronDb.getWorkerSheetData(),
    getBeams: () => electronDb.getBeams(),
    getBeamPasars: () => electronDb.getBeamPasars(),
    getBegariWorkers: () => electronDb.getBegariWorkers(),
    getTFOWorkers: () => electronDb.getTFOWorkers(),
    getTFOAttendance: () => electronDb.getTFOAttendance(),
    getBobbinWorkers: () => electronDb.getBobbinWorkers(),
    getBobbinAttendance: () => electronDb.getBobbinAttendance(),
    getMasterWorkers: () => electronDb.getMasterWorkers(),
    getWiremanWorkers: () => electronDb.getWiremanWorkers(),
    getWiremanBills: () => electronDb.getWiremanBills(),
  }
  : {
    ...localStorageSync,  // sync fallback base
    async: browserDb,
  };

// Re-export for flexibility
export { electronDb, browserDb };

// Helper to check if async storage is available
export const isDatabaseMode = () => true; // always true — we always use a database layer now