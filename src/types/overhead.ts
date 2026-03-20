export interface OverheadEntry {
    id: string;
    month: string; // Format: YYYY-MM
    name: string;
    amount: number;
    createdAt?: number;
    updatedAt?: number;
}

export interface MonthlyProduction {
    id: string;
    month: string; // Format: YYYY-MM
    qualityId: string;
    metersProduced: number;
    createdAt?: number;
    updatedAt?: number;
}

export interface OverheadAllocation {
    qualityId: string;
    qualityName: string;
    metersProduced: number;
    sharePercentage: number;
    allocatedOverhead: number;
    overheadPerMeter: number;
}
