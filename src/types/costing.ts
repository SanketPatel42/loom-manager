export interface ExtraCost {
    label: string;
    amount: number;
}

export interface QualityCosting {
    id: string;
    qualityId: string;
    warpRate: number;
    weftRate: number;
    extraCosts: ExtraCost[];
    createdAt?: number;
    updatedAt?: number;
}
