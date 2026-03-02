import type {
  Beam,
  Taka,
  WorkerRecord,
  Quality,
  Sale,
  BeamPasar,
  Purchase,
  Transaction,
  Stock,
  WorkerProfile,
  WorkerSheetData,
  Firm,
  BegariWorker,
  TFOAttendance,
  TFOWorker,
  MasterWorker,
  WiremanBill,
  WiremanWorker,
  BobbinWorker,
  BobbinAttendance,
  Note,
  YarnConversionCalculation,
  FabricCalculation,
  GSMCalculation,
  QualityCalculation,
  TFOProductionCalculation,
  WarpingProductionCalculation,
  YarnConsumptionCalculation,
  PurchaseDelivery,
} from './types';

import { getActiveFactoryPrefix } from './factoryContext';
import { TABLE_NAMES } from './types';

// ── Storage Keys ───────────────────────────────────────────

// Map sync storage keys to standardized TABLE_NAMES
const BASE_STORAGE_KEYS = {
  beams: `erp_${TABLE_NAMES.beams}`,
  takas: `erp_${TABLE_NAMES.takas}`,
  workers: `erp_workers`, // Legacy, not in TABLE_NAMES
  sales: `erp_${TABLE_NAMES.sales}`,
  purchases: `erp_${TABLE_NAMES.purchases}`,
  purchaseDeliveries: `erp_${TABLE_NAMES.purchaseDeliveries}`,
  transactions: `erp_${TABLE_NAMES.transactions}`,
  stock: `erp_${TABLE_NAMES.stock}`,
  workerProfiles: `erp_${TABLE_NAMES.workerProfiles}`,
  workerRecords: `erp_worker_records`, // Legacy
  firms: `erp_${TABLE_NAMES.firms}`,
  qualities: `erp_${TABLE_NAMES.qualities}`,
  beamPasar: `erp_${TABLE_NAMES.beamPasar}`,
  workerSheetData: `erp_${TABLE_NAMES.workerSheetData}`,
  begariWorkers: `erp_${TABLE_NAMES.begariWorkers}`,
  tfoWorkers: `erp_${TABLE_NAMES.tfoWorkers}`,
  tfoAttendance: `erp_${TABLE_NAMES.tfoAttendance}`,
  masterWorkers: `erp_${TABLE_NAMES.masterWorkers}`,
  wiremanWorkers: `erp_${TABLE_NAMES.wiremanWorkers}`,
  wiremanBills: `erp_${TABLE_NAMES.wiremanBills}`,
  yarnConversions: `erp_${TABLE_NAMES.yarnConversions}`,
  fabricCalculations: `erp_${TABLE_NAMES.fabricCalculations}`,
  gsmCalculations: `erp_${TABLE_NAMES.gsmCalculations}`,
  qualityCalculations: `erp_${TABLE_NAMES.qualityCalculations}`,
  tfoProductions: `erp_${TABLE_NAMES.tfoProductions}`,
  warpingProductions: `erp_${TABLE_NAMES.warpingProductions}`,
  yarnConsumptions: `erp_${TABLE_NAMES.yarnConsumptions}`,
  bobbinWorkers: `erp_${TABLE_NAMES.bobbinWorkers}`,
  bobbinAttendance: `erp_${TABLE_NAMES.bobbinAttendance}`,
  notes: `erp_${TABLE_NAMES.notes}`,
};

// Fallback mapping for legacy snake_case keys
const LEGACY_KEYS: Record<string, string> = {
  [`erp_${TABLE_NAMES.workerProfiles}`]: 'erp_worker_profiles',
  [`erp_${TABLE_NAMES.workerSheetData}`]: 'erp_worker_sheet_data',
  [`erp_${TABLE_NAMES.purchaseDeliveries}`]: 'erp_purchase_deliveries',
  [`erp_${TABLE_NAMES.beamPasar}`]: 'erp_beam_pasar',
  [`erp_${TABLE_NAMES.begariWorkers}`]: 'erp_begari_workers',
  [`erp_${TABLE_NAMES.tfoWorkers}`]: 'erp_tfo_workers',
  [`erp_${TABLE_NAMES.tfoAttendance}`]: 'erp_tfo_attendance',
  [`erp_${TABLE_NAMES.masterWorkers}`]: 'erp_master_workers',
  [`erp_${TABLE_NAMES.wiremanWorkers}`]: 'erp_wireman_workers',
  [`erp_${TABLE_NAMES.wiremanBills}`]: 'erp_wireman_bills',
  [`erp_${TABLE_NAMES.yarnConversions}`]: 'erp_yarn_conversions',
  [`erp_${TABLE_NAMES.fabricCalculations}`]: 'erp_fabric_calculations',
  [`erp_${TABLE_NAMES.gsmCalculations}`]: 'erp_gsm_calculations',
  [`erp_${TABLE_NAMES.qualityCalculations}`]: 'erp_quality_calculations',
  [`erp_${TABLE_NAMES.tfoProductions}`]: 'erp_tfo_productions',
  [`erp_${TABLE_NAMES.warpingProductions}`]: 'erp_warping_productions',
  [`erp_${TABLE_NAMES.yarnConsumptions}`]: 'erp_yarn_consumptions',
  [`erp_${TABLE_NAMES.bobbinWorkers}`]: 'erp_bobbin_workers',
  [`erp_${TABLE_NAMES.bobbinAttendance}`]: 'erp_bobbin_attendance',
};

function getStorageKey(baseKey: string): string {
  const prefix = getActiveFactoryPrefix();
  return `${prefix}${baseKey}`;
}

const STORAGE_KEYS = new Proxy(BASE_STORAGE_KEYS, {
  get(target, prop: string) {
    const baseKey = target[prop as keyof typeof target];
    if (baseKey) {
      return getStorageKey(baseKey);
    }
    return undefined;
  }
}) as typeof BASE_STORAGE_KEYS;

// ── Synchronous Storage Implementation ─────────────────────

export const storage = {
  // Generic methods
  get<T>(key: string): T[] {
    let data = localStorage.getItem(key);

    // Migration fallback: if new key is empty, check legacy key
    if (!data) {
      const baseKey = Object.keys(BASE_STORAGE_KEYS).find(k => getStorageKey(BASE_STORAGE_KEYS[k as keyof typeof BASE_STORAGE_KEYS]) === key);
      if (baseKey) {
        const rawBaseKey = BASE_STORAGE_KEYS[baseKey as keyof typeof BASE_STORAGE_KEYS];
        const legacyBaseKey = LEGACY_KEYS[rawBaseKey];
        if (legacyBaseKey) {
          const legacyKey = getStorageKey(legacyBaseKey);
          data = localStorage.getItem(legacyKey);
          if (data) {
            console.log(`Migrating data from ${legacyKey} to ${key}`);
            localStorage.setItem(key, data);
            // We keep the old data for safety, or we could remove it.
          }
        }
      }
    }

    return data ? JSON.parse(data) : [];
  },


  set<T>(key: string, data: T[] | T | null): void {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Beams
  getBeams: (): Beam[] => storage.get<Beam>(STORAGE_KEYS.beams),
  setBeams: (beams: Beam[]) => storage.set(STORAGE_KEYS.beams, beams),
  addBeam: (beam: Beam) => { storage.setBeams([...storage.getBeams(), beam]); },
  updateBeam: (id: string, beam: Beam) => { storage.setBeams(storage.getBeams().map(b => b.id === id ? beam : b)); },
  deleteBeam: (id: string) => { storage.setBeams(storage.getBeams().filter(b => b.id !== id)); },

  // Takas
  getTakas: (): Taka[] => storage.get<Taka>(STORAGE_KEYS.takas),
  setTakas: (takas: Taka[]) => storage.set(STORAGE_KEYS.takas, takas),
  addTaka: (taka: Taka) => { storage.setTakas([...storage.getTakas(), taka]); },
  updateTaka: (id: string, taka: Taka) => { storage.setTakas(storage.getTakas().map(t => t.id === id ? taka : t)); },
  deleteTaka: (id: string) => { storage.setTakas(storage.getTakas().filter(t => t.id !== id)); },

  // Workers
  getWorkers: (): WorkerRecord[] => storage.get<WorkerRecord>(STORAGE_KEYS.workers),
  setWorkers: (workers: WorkerRecord[]) => storage.set(STORAGE_KEYS.workers, workers),
  addWorker: (worker: WorkerRecord) => { storage.setWorkers([...storage.getWorkers(), worker]); },
  updateWorker: (id: string, worker: WorkerRecord) => { storage.setWorkers(storage.getWorkers().map(w => w.id === id ? worker : w)); },
  deleteWorker: (id: string) => { storage.setWorkers(storage.getWorkers().filter(w => w.id !== id)); },

  // Sales
  getSales: (): Sale[] => storage.get<Sale>(STORAGE_KEYS.sales),
  setSales: (sales: Sale[]) => storage.set(STORAGE_KEYS.sales, sales),
  addSale: (sale: Sale) => { storage.setSales([...storage.getSales(), sale]); },
  updateSale: (id: string, sale: Sale) => { storage.setSales(storage.getSales().map(s => s.id === id ? sale : s)); },
  deleteSale: (id: string) => { storage.setSales(storage.getSales().filter(s => s.id !== id)); },

  // Purchases
  getPurchases: (): Purchase[] => storage.get<Purchase>(STORAGE_KEYS.purchases),
  setPurchases: (purchases: Purchase[]) => storage.set(STORAGE_KEYS.purchases, purchases),
  addPurchase: (purchase: Purchase) => { storage.setPurchases([...storage.getPurchases(), purchase]); },
  updatePurchase: (id: string, purchase: Purchase) => { storage.setPurchases(storage.getPurchases().map(p => p.id === id ? purchase : p)); },
  deletePurchase: (id: string) => { storage.setPurchases(storage.getPurchases().filter(p => p.id !== id)); },

  // Purchase Deliveries
  getPurchaseDeliveries: (): PurchaseDelivery[] => storage.get<PurchaseDelivery>(STORAGE_KEYS.purchaseDeliveries),
  setPurchaseDeliveries: (deliveries: PurchaseDelivery[]) => storage.set(STORAGE_KEYS.purchaseDeliveries, deliveries),
  addPurchaseDelivery: (delivery: PurchaseDelivery) => { storage.setPurchaseDeliveries([...storage.getPurchaseDeliveries(), delivery]); },
  updatePurchaseDelivery: (id: string, delivery: PurchaseDelivery) => { storage.setPurchaseDeliveries(storage.getPurchaseDeliveries().map(d => d.id === id ? delivery : d)); },
  deletePurchaseDelivery: (id: string) => { storage.setPurchaseDeliveries(storage.getPurchaseDeliveries().filter(d => d.id !== id)); },

  // Transactions
  getTransactions: (): Transaction[] => storage.get<Transaction>(STORAGE_KEYS.transactions),
  setTransactions: (transactions: Transaction[]) => storage.set(STORAGE_KEYS.transactions, transactions),
  addTransaction: (transaction: Transaction) => { storage.setTransactions([...storage.getTransactions(), transaction]); },
  updateTransaction: (id: string, transaction: Transaction) => { storage.setTransactions(storage.getTransactions().map(t => t.id === id ? transaction : t)); },
  deleteTransaction: (id: string) => { storage.setTransactions(storage.getTransactions().filter(t => t.id !== id)); },

  // Stock
  getStock: (): Stock[] => storage.get<Stock>(STORAGE_KEYS.stock),
  setStock: (stock: Stock[]) => storage.set(STORAGE_KEYS.stock, stock),
  addStock: (stock: Stock) => { storage.setStock([...storage.getStock(), stock]); },
  updateStock: (id: string, stock: Stock) => { storage.setStock(storage.getStock().map(s => s.id === id ? stock : s)); },
  deleteStock: (id: string) => { storage.setStock(storage.getStock().filter(s => s.id !== id)); },

  // Worker Profiles
  getWorkerProfiles: (): WorkerProfile[] => storage.get<WorkerProfile>(STORAGE_KEYS.workerProfiles),
  setWorkerProfiles: (profiles: WorkerProfile[]) => storage.set(STORAGE_KEYS.workerProfiles, profiles),
  addWorkerProfile: (profile: WorkerProfile) => { storage.setWorkerProfiles([...storage.getWorkerProfiles(), profile]); },
  updateWorkerProfile: (id: string, profile: WorkerProfile) => { storage.setWorkerProfiles(storage.getWorkerProfiles().map(p => p.id === id ? profile : p)); },
  deleteWorkerProfile: (id: string) => { storage.setWorkerProfiles(storage.getWorkerProfiles().filter(p => p.id !== id)); },

  // Firms
  getFirms: (): Firm[] => storage.get<Firm>(STORAGE_KEYS.firms),
  setFirms: (firms: Firm[]) => storage.set(STORAGE_KEYS.firms, firms),
  addFirm: (firm: Firm) => { storage.setFirms([...storage.getFirms(), firm]); },
  updateFirm: (id: string, firm: Firm) => { storage.setFirms(storage.getFirms().map(f => f.id === id ? firm : f)); },
  deleteFirm: (id: string) => { storage.setFirms(storage.getFirms().filter(f => f.id !== id)); },

  // Qualities
  getQualities: (): Quality[] => storage.get<Quality>(STORAGE_KEYS.qualities),
  addQuality: (quality: Quality) => { storage.set(STORAGE_KEYS.qualities, [...storage.getQualities(), quality]); },
  updateQuality: (id: string, quality: Quality) => { storage.set(STORAGE_KEYS.qualities, storage.getQualities().map(q => q.id === id ? quality : q)); },
  deleteQuality: (id: string) => { storage.set(STORAGE_KEYS.qualities, storage.getQualities().filter(q => q.id !== id)); },

  // Beam Pasar
  getBeamPasars: (): BeamPasar[] => storage.get<BeamPasar>(STORAGE_KEYS.beamPasar),
  addBeamPasar: (bp: BeamPasar) => { storage.set(STORAGE_KEYS.beamPasar, [...storage.getBeamPasars(), bp]); },
  updateBeamPasar: (id: string, bp: BeamPasar) => { storage.set(STORAGE_KEYS.beamPasar, storage.getBeamPasars().map(b => b.id === id ? bp : b)); },
  deleteBeamPasar: (id: string) => { storage.set(STORAGE_KEYS.beamPasar, storage.getBeamPasars().filter(b => b.id !== id)); },

  // Worker Records
  getWorkerRecords: (): WorkerRecord[] => storage.get<WorkerRecord>(STORAGE_KEYS.workerRecords),
  addWorkerRecord: (record: WorkerRecord) => { storage.set(STORAGE_KEYS.workerRecords, [...storage.getWorkerRecords(), record]); },
  updateWorkerRecord: (id: string, record: WorkerRecord) => { storage.set(STORAGE_KEYS.workerRecords, storage.getWorkerRecords().map(r => r.id === id ? record : r)); },
  deleteWorkerRecord: (id: string) => { storage.set(STORAGE_KEYS.workerRecords, storage.getWorkerRecords().filter(r => r.id !== id)); },

  // Worker Sheet Data
  getWorkerSheetData: (): WorkerSheetData | null => {
    const data = localStorage.getItem(STORAGE_KEYS.workerSheetData);
    return data ? JSON.parse(data) : null;
  },
  setWorkerSheetData: (data: WorkerSheetData) => {
    localStorage.setItem(STORAGE_KEYS.workerSheetData, JSON.stringify(data));
  },

  // Begari Workers
  getBegariWorkers: (): BegariWorker[] => storage.get<BegariWorker>(STORAGE_KEYS.begariWorkers),
  addBegariWorker: (w: BegariWorker) => { storage.set(STORAGE_KEYS.begariWorkers, [...storage.getBegariWorkers(), w]); },
  updateBegariWorker: (id: string, w: BegariWorker) => { storage.set(STORAGE_KEYS.begariWorkers, storage.getBegariWorkers().map(x => x.id === id ? w : x)); },
  deleteBegariWorker: (id: string) => { storage.set(STORAGE_KEYS.begariWorkers, storage.getBegariWorkers().filter(x => x.id !== id)); },

  // TFO Workers
  getTFOWorkers: (): TFOWorker[] => storage.get<TFOWorker>(STORAGE_KEYS.tfoWorkers),
  addTFOWorker: (w: TFOWorker) => { storage.set(STORAGE_KEYS.tfoWorkers, [...storage.getTFOWorkers(), w]); },
  updateTFOWorker: (id: string, w: TFOWorker) => { storage.set(STORAGE_KEYS.tfoWorkers, storage.getTFOWorkers().map(x => x.id === id ? w : x)); },
  deleteTFOWorker: (id: string) => { storage.set(STORAGE_KEYS.tfoWorkers, storage.getTFOWorkers().filter(x => x.id !== id)); },

  // TFO Attendance
  getTFOAttendance: (): TFOAttendance[] => storage.get<TFOAttendance>(STORAGE_KEYS.tfoAttendance),
  addTFOAttendance: (a: TFOAttendance) => { storage.set(STORAGE_KEYS.tfoAttendance, [...storage.getTFOAttendance(), a]); },
  updateTFOAttendance: (id: string, a: TFOAttendance) => { storage.set(STORAGE_KEYS.tfoAttendance, storage.getTFOAttendance().map(x => x.id === id ? a : x)); },
  deleteTFOAttendance: (id: string) => { storage.set(STORAGE_KEYS.tfoAttendance, storage.getTFOAttendance().filter(x => x.id !== id)); },

  // Bobbin Workers
  getBobbinWorkers: (): BobbinWorker[] => storage.get<BobbinWorker>(STORAGE_KEYS.bobbinWorkers),
  addBobbinWorker: (w: BobbinWorker) => { storage.set(STORAGE_KEYS.bobbinWorkers, [...storage.getBobbinWorkers(), w]); },
  updateBobbinWorker: (id: string, w: BobbinWorker) => { storage.set(STORAGE_KEYS.bobbinWorkers, storage.getBobbinWorkers().map(x => x.id === id ? w : x)); },
  deleteBobbinWorker: (id: string) => { storage.set(STORAGE_KEYS.bobbinWorkers, storage.getBobbinWorkers().filter(x => x.id !== id)); },

  // Bobbin Attendance
  getBobbinAttendance: (): BobbinAttendance[] => storage.get<BobbinAttendance>(STORAGE_KEYS.bobbinAttendance),
  addBobbinAttendance: (a: BobbinAttendance) => { storage.set(STORAGE_KEYS.bobbinAttendance, [...storage.getBobbinAttendance(), a]); },
  updateBobbinAttendance: (id: string, a: BobbinAttendance) => { storage.set(STORAGE_KEYS.bobbinAttendance, storage.getBobbinAttendance().map(x => x.id === id ? a : x)); },
  deleteBobbinAttendance: (id: string) => { storage.set(STORAGE_KEYS.bobbinAttendance, storage.getBobbinAttendance().filter(x => x.id !== id)); },

  // Master Workers
  getMasterWorkers: (): MasterWorker[] => storage.get<MasterWorker>(STORAGE_KEYS.masterWorkers),
  addMasterWorker: (w: MasterWorker) => { storage.set(STORAGE_KEYS.masterWorkers, [...storage.getMasterWorkers(), w]); },
  updateMasterWorker: (id: string, w: MasterWorker) => { storage.set(STORAGE_KEYS.masterWorkers, storage.getMasterWorkers().map(x => x.id === id ? w : x)); },
  deleteMasterWorker: (id: string) => { storage.set(STORAGE_KEYS.masterWorkers, storage.getMasterWorkers().filter(x => x.id !== id)); },

  // Wireman Workers
  getWiremanWorkers: (): WiremanWorker[] => storage.get<WiremanWorker>(STORAGE_KEYS.wiremanWorkers),
  addWiremanWorker: (w: WiremanWorker) => { storage.set(STORAGE_KEYS.wiremanWorkers, [...storage.getWiremanWorkers(), w]); },
  updateWiremanWorker: (id: string, w: WiremanWorker) => { storage.set(STORAGE_KEYS.wiremanWorkers, storage.getWiremanWorkers().map(x => x.id === id ? w : x)); },
  deleteWiremanWorker: (id: string) => { storage.set(STORAGE_KEYS.wiremanWorkers, storage.getWiremanWorkers().filter(x => x.id !== id)); },

  // Wireman Bills
  getWiremanBills: (): WiremanBill[] => storage.get<WiremanBill>(STORAGE_KEYS.wiremanBills),
  addWiremanBill: (b: WiremanBill) => { storage.set(STORAGE_KEYS.wiremanBills, [...storage.getWiremanBills(), b]); },
  updateWiremanBill: (id: string, b: WiremanBill) => { storage.set(STORAGE_KEYS.wiremanBills, storage.getWiremanBills().map(x => x.id === id ? b : x)); },
  deleteWiremanBill: (id: string) => { storage.set(STORAGE_KEYS.wiremanBills, storage.getWiremanBills().filter(x => x.id !== id)); },

  // Yarn Conversions
  getYarnConversions: (): YarnConversionCalculation[] => storage.get<YarnConversionCalculation>(STORAGE_KEYS.yarnConversions),
  addYarnConversion: (c: YarnConversionCalculation) => { storage.set(STORAGE_KEYS.yarnConversions, [...storage.getYarnConversions(), c]); },
  updateYarnConversion: (id: string, c: YarnConversionCalculation) => { storage.set(STORAGE_KEYS.yarnConversions, storage.getYarnConversions().map(x => x.id === id ? c : x)); },
  deleteYarnConversion: (id: string) => { storage.set(STORAGE_KEYS.yarnConversions, storage.getYarnConversions().filter(x => x.id !== id)); },

  // Fabric Calculations
  getFabricCalculations: (): FabricCalculation[] => storage.get<FabricCalculation>(STORAGE_KEYS.fabricCalculations),
  addFabricCalculation: (c: FabricCalculation) => { storage.set(STORAGE_KEYS.fabricCalculations, [...storage.getFabricCalculations(), c]); },
  updateFabricCalculation: (id: string, c: FabricCalculation) => { storage.set(STORAGE_KEYS.fabricCalculations, storage.getFabricCalculations().map(x => x.id === id ? c : x)); },
  deleteFabricCalculation: (id: string) => { storage.set(STORAGE_KEYS.fabricCalculations, storage.getFabricCalculations().filter(x => x.id !== id)); },

  // GSM Calculations
  getGSMCalculations: (): GSMCalculation[] => storage.get<GSMCalculation>(STORAGE_KEYS.gsmCalculations),
  addGSMCalculation: (c: GSMCalculation) => { storage.set(STORAGE_KEYS.gsmCalculations, [...storage.getGSMCalculations(), c]); },
  updateGSMCalculation: (id: string, c: GSMCalculation) => { storage.set(STORAGE_KEYS.gsmCalculations, storage.getGSMCalculations().map(x => x.id === id ? c : x)); },
  deleteGSMCalculation: (id: string) => { storage.set(STORAGE_KEYS.gsmCalculations, storage.getGSMCalculations().filter(x => x.id !== id)); },

  // Quality Calculations
  getQualityCalculations: (): QualityCalculation[] => storage.get<QualityCalculation>(STORAGE_KEYS.qualityCalculations),
  addQualityCalculation: (c: QualityCalculation) => { storage.set(STORAGE_KEYS.qualityCalculations, [...storage.getQualityCalculations(), c]); },
  updateQualityCalculation: (id: string, c: QualityCalculation) => { storage.set(STORAGE_KEYS.qualityCalculations, storage.getQualityCalculations().map(x => x.id === id ? c : x)); },
  deleteQualityCalculation: (id: string) => { storage.set(STORAGE_KEYS.qualityCalculations, storage.getQualityCalculations().filter(x => x.id !== id)); },

  // TFO Productions
  getTFOProductions: (): TFOProductionCalculation[] => storage.get<TFOProductionCalculation>(STORAGE_KEYS.tfoProductions),
  addTFOProduction: (c: TFOProductionCalculation) => { storage.set(STORAGE_KEYS.tfoProductions, [...storage.getTFOProductions(), c]); },
  updateTFOProduction: (id: string, c: TFOProductionCalculation) => { storage.set(STORAGE_KEYS.tfoProductions, storage.getTFOProductions().map(x => x.id === id ? c : x)); },
  deleteTFOProduction: (id: string) => { storage.set(STORAGE_KEYS.tfoProductions, storage.getTFOProductions().filter(x => x.id !== id)); },

  // Warping Productions
  getWarpingProductions: (): WarpingProductionCalculation[] => storage.get<WarpingProductionCalculation>(STORAGE_KEYS.warpingProductions),
  addWarpingProduction: (c: WarpingProductionCalculation) => { storage.set(STORAGE_KEYS.warpingProductions, [...storage.getWarpingProductions(), c]); },
  updateWarpingProduction: (id: string, c: WarpingProductionCalculation) => { storage.set(STORAGE_KEYS.warpingProductions, storage.getWarpingProductions().map(x => x.id === id ? c : x)); },
  deleteWarpingProduction: (id: string) => { storage.set(STORAGE_KEYS.warpingProductions, storage.getWarpingProductions().filter(x => x.id !== id)); },

  // Notes
  getNotes: (): Note[] => storage.get<Note>(STORAGE_KEYS.notes),
  addNote: (note: Note) => { storage.set(STORAGE_KEYS.notes, [...storage.getNotes(), note]); },
  updateNote: (id: string, note: Note) => { storage.set(STORAGE_KEYS.notes, storage.getNotes().map(n => n.id === id ? note : n)); },
  deleteNote: (id: string) => { storage.set(STORAGE_KEYS.notes, storage.getNotes().filter(n => n.id !== id)); },

  // Yarn Consumptions
  getYarnConsumptions: (): YarnConsumptionCalculation[] => storage.get<YarnConsumptionCalculation>(STORAGE_KEYS.yarnConsumptions),
  addYarnConsumption: (c: YarnConsumptionCalculation) => { storage.set(STORAGE_KEYS.yarnConsumptions, [...storage.getYarnConsumptions(), c]); },
  updateYarnConsumption: (id: string, c: YarnConsumptionCalculation) => { storage.set(STORAGE_KEYS.yarnConsumptions, storage.getYarnConsumptions().map(x => x.id === id ? c : x)); },
  deleteYarnConsumption: (id: string) => { storage.set(STORAGE_KEYS.yarnConsumptions, storage.getYarnConsumptions().filter(x => x.id !== id)); },

  // Clear Methods
  clearBeams: () => storage.set(STORAGE_KEYS.beams, []),
  clearBeamPasars: () => storage.set(STORAGE_KEYS.beamPasar, []),
  clearTFOAttendance: () => storage.set(STORAGE_KEYS.tfoAttendance, []),
  clearBobbinAttendance: () => storage.set(STORAGE_KEYS.bobbinAttendance, []),
  clearWiremanBills: () => storage.set(STORAGE_KEYS.wiremanBills, []),
  clearWorkerSheetData: () => storage.set(STORAGE_KEYS.workerSheetData, null),
};
