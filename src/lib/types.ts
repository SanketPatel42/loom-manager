// ============================================================
// Centralized type definitions for the Grey Loom Manager ERP
// All entity interfaces live here — imported by every layer.
// ============================================================

// ── Core Business Entities ─────────────────────────────────

export interface Beam {
    id: string;
    date: string;
    warper: string;
    beamNo: string;
    noOfTakas: number;
    noOfTar: number;
    pricePerBeam: number;
    total: number;
    qualityId?: string;
}

export interface Taka {
    id: string;
    date: string;
    available: number;
    folded: number;
    remaining: number;
    qualityId?: string;
}

export interface WorkerRecord {
    id: string;
    workerId: string;
    date: string;
    dayAvg: number;
    nightAvg: number;
    qualityId?: string;
}

export interface OldWorkerRecord {
    id: string;
    date: string;
    machineGroup: number;
    workerDay: string;
    workerNight: string;
    avgDay: number;
    avgNight: number;
    halfMonthPeriod: string;
}

export interface Quality {
    id: string;
    name: string;
    ratePerMeter: number;
    description?: string;
    epi?: number;
    ppi?: number;
    danier?: string;
    createdAt: string;
    tars: number;
    beamRate: number;
    beamPasarRate: number;
}

export interface Sale {
    id: string;
    date: string;
    party: string;
    takas: number;
    meters: number;
    ratePerMeter: number;
    amount: number;
    tax: number;
    total: number;
    paymentTerms: number;
    expectedPaymentDate: string;
    status: 'pending' | 'paid';
    type: 'spot' | 'advance_meters' | 'advance_lots';
    qualityId?: string;
    paymentMethod?: 'RTGS' | 'Cheque' | 'Cash' | 'Other';
    paidAmount?: number;
    billNumbers?: string;
    paymentDate?: string;
    paymentNotes?: string;
}

export interface SaleDelivery {
    id: string;
    saleId: string;
    date: string;
    takas: number;
    meters: number;
    notes?: string;
}

export interface BeamPasar {
    id: string;
    date: string;
    beamNo: string;
    count?: number;
    tars: number;
    noOfTaka?: number;
    ratePerBeam: number;
    qualityId?: string;
}

export interface Purchase {
    id: string;
    date: string;
    supplier: string;
    type: 'yarn' | 'beam';
    yarnType?: string;
    danier?: string;
    tons?: number;
    ratePerTon?: number;
    // For beam purchases
    numberOfBeams?: number;
    ratePerBeam?: number;
    qualityId?: string;
    tars?: number;
    meters?: number;
    total: number;
}

export interface PurchaseDelivery {
    id: string;
    purchaseId: string;
    date: string;
    kg?: number; // for yarn
    numberOfBeams?: number;
    // for beams
    beamNo?: string;
    weight?: number;
    meters?: number;
    notes?: string;
}

export interface Transaction {
    id: string;
    date: string;
    firm: string;
    type: 'Payment' | 'Received' | 'Other';
    amount: number;
    purpose: string;
    payee: string;
}

export interface Stock {
    id: string;
    date: string;
    yarnCount: string;
    boxesAvailable: number;
}

export interface WorkerProfile {
    id: string;
    name: string;
    phoneNumber: string;
    emergencyContact: string;
}

// ── Worker Sheet / Machine Data ────────────────────────────

export type CellColorType = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'purple' | 'grey' | null;

export interface CellData {
    value: number;
    color: CellColorType;
}

export interface MachineSheetData {
    day: number;
    [key: string]: string | number | CellData;
}

export interface ColorQualityMapping {
    [color: string]: string;
}

export interface WorkerSplit {
    workerId: string;
    startDay: number;
    endDay: number;
}

export interface SheetAssignment {
    dayWorker: string;
    nightWorker: string;
    dayWorkerSplits?: WorkerSplit[];
    nightWorkerSplits?: WorkerSplit[];
    colorQualityMap: ColorQualityMapping;
    cycle: '1-15' | '16-30';
    machineQualities?: Record<number, string>;
}

export interface WorkerSheetData {
    assignments: Record<string, SheetAssignment>;
    gridData: Record<string, MachineSheetData[]>;
    lastUpdated: string;
}

// ── Firms ──────────────────────────────────────────────────

export interface FirmDocument {
    id: string;
    name: string;
    uploadDate: string;
    size: number;
    type: string;
    data: string;
}

export interface Firm {
    id: string;
    name: string;
    gstNumber: string;
    address: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
    documents: FirmDocument[];
}

// ── Additional Worker Types ────────────────────────────────

export interface BegariWorker {
    id: string;
    name: string;
    phoneNumber: string;
    monthlySalary: number;
    joinDate: string;
}

export interface TFOAttendance {
    id: string;
    workerId: string;
    date: string;
    type: 'full' | 'half';
    cycle: '1-15' | '16-30';
}

export interface TFOWorker {
    id: string;
    name: string;
    phoneNumber: string;
    fullDaySalary: number;
    joinDate: string;
}

export interface MasterWorker {
    id: string;
    name: string;
    phoneNumber: string;
    monthlySalary: number;
    joinDate: string;
}

export interface WiremanBill {
    id: string;
    workerId: string;
    date: string;
    billAmount: number;
    description: string;
    cycle: '1-15' | '16-30';
}

export interface WiremanWorker {
    id: string;
    name: string;
    phoneNumber: string;
    joinDate: string;
}

export interface BobbinWorker {
    id: string;
    name: string;
    phoneNumber: string;
    fullDaySalary: number;
    joinDate: string;
}

export interface BobbinAttendance {
    id: string;
    workerId: string;
    date: string;
    type: 'full' | 'half';
    cycle: '1-15' | '16-30';
}

// ── Notes ──────────────────────────────────────────────────

export interface Note {
    id: string;
    title: string;
    content: string;
    isReminder: boolean;
    reminderDate?: string;
    completed: boolean;
    createdAt: string;
}

// ── Textile Calculations ───────────────────────────────────

export interface YarnConversionCalculation {
    id: string;
    name: string;
    date: string;
    type: 'denier-to-count' | 'filament-length' | 'staple-length';
    denier?: number;
    count?: number;
    coneWeightGrams?: number;
    coneWeightKg?: number;
    result: number;
    resultUnit: string;
}

export interface FabricCalculation {
    id: string;
    name: string;
    date: string;
    type: 'warp-weight' | 'weft-weight' | 'total-fabric-weight';
    fabricLength: number;
    fabricWidth: number;
    epi?: number;
    selvedgeReduction?: number;
    selvedgeTars?: number;
    warpDenier?: number;
    totalEnds?: number;
    ppi?: number;
    weftDenier?: number;
    warpWeight?: number;
    weftWeight?: number;
    totalWeight?: number;
}

export interface GSMCalculation {
    id: string;
    name: string;
    date: string;
    type: 'from-yarn-weight' | 'from-fabric-weight' | 'staple-yarn';
    fabricWidth: number;
    totalYarnUsed?: number;
    fabricWeightKg?: number;
    fabricLength?: number;
    epi?: number;
    warpCount?: number;
    ppi?: number;
    weftCount?: number;
    gsm: number;
}

export interface QualityCalculation {
    id: string;
    name: string;
    date: string;
    gsm: number;
    fabricWidth: number;
    qualityGrams: number;
}

export interface TFOProductionCalculation {
    id: string;
    name: string;
    date: string;
    spindleRPM: number;
    workingTimeHours: number;
    denier: number;
    totalSpindles: number;
    tpm: number;
    productionKg: number;
}

export interface WarpingProductionCalculation {
    id: string;
    name: string;
    date: string;
    headRPM: number;
    timeMinutes: number;
    picksPerDm: number;
    efficiency: number;
    productionMeters: number;
}

export interface YarnConsumptionCalculation {
    id: string;
    name: string;
    date: string;
    type: 'warp' | 'weft' | 'total';
    fabricLength: number;
    totalEnds?: number;
    warpDenier?: number;
    picksPerDm?: number;
    weftDenier?: number;
    reedSpaceDm?: number;
    warpWeightKg?: number;
    weftWeightKg?: number;
    totalWeightKg?: number;
}

// ── Standardized Table Names ───────────────────────────────
// Single source of truth for table names used across ALL layers
// (electronDb, browserDb, encryption, backups).

export const TABLE_NAMES = {
    beams: 'beams',
    takas: 'takas',
    workerProfiles: 'workerProfiles',
    qualities: 'qualities',
    sales: 'sales',
    purchases: 'purchases',
    firms: 'firms',
    transactions: 'transactions',
    stock: 'stock',
    beamPasar: 'beamPasar',
    workerSheetData: 'workerSheetData',
    notes: 'notes',
    begariWorkers: 'begariWorkers',
    tfoWorkers: 'tfoWorkers',
    tfoAttendance: 'tfoAttendance',
    masterWorkers: 'masterWorkers',
    wiremanWorkers: 'wiremanWorkers',
    wiremanBills: 'wiremanBills',
    bobbinWorkers: 'bobbinWorkers',
    bobbinAttendance: 'bobbinAttendance',
    yarnConversions: 'yarnConversions',
    fabricCalculations: 'fabricCalculations',
    gsmCalculations: 'gsmCalculations',
    qualityCalculations: 'qualityCalculations',
    tfoProductions: 'tfoProductions',
    warpingProductions: 'warpingProductions',
    yarnConsumptions: 'yarnConsumptions',
    purchaseDeliveries: 'purchaseDeliveries',
    saleDeliveries: 'saleDeliveries',
} as const;

export type TableName = keyof typeof TABLE_NAMES;

// All table names that hold list data (for export/import/clear)
export const ALL_DATA_TABLES: string[] = Object.values(TABLE_NAMES);
