// ============================================================
// Production Metrics Utilities
// Calculate meters produced from worker sheet data
// ============================================================

import type { WorkerSheetData, Quality } from "@/lib/types";

export interface ProductionByQuality {
  qualityId: string;
  qualityName: string;
  totalMeters: number;
  dayMeters: number;
  nightMeters: number;
}

/**
 * Calculate total meters produced from start of month, grouped by quality
 * @param workerSheetData - The worker sheet data containing grid data and assignments
 * @param qualities - Array of quality definitions
 * @returns Array of production metrics by quality
 */
export function calculateMonthlyProductionByQuality(
  workerSheetData: WorkerSheetData | null,
  qualities: Quality[]
): ProductionByQuality[] {
  if (!workerSheetData) return [];

  const now = new Date();
  const currentDay = now.getDate();
  
  // Map to accumulate meters by quality
  const productionMap = new Map<string, { dayMeters: number; nightMeters: number }>();

  // Process each sheet
  Object.keys(workerSheetData.gridData).forEach(sheetKey => {
    const sheetData = workerSheetData.gridData[sheetKey];
    const assignment = workerSheetData.assignments[sheetKey];
    
    if (!assignment || !sheetData) return;

    const colorQualityMap = assignment.colorQualityMap || {};

    // Process each day from start of month to current day
    sheetData.forEach(row => {
      if (row.day > currentDay) return; // Only count days that have passed

      // Process each machine (12 machines per sheet)
      for (let m = 1; m <= 12; m++) {
        const dayKey = `machine${m}_day`;
        const nightKey = `machine${m}_night`;

        const dayCell = row[dayKey];
        const nightCell = row[nightKey];

        // Extract value and color from cell data
        const dayValue = typeof dayCell === 'object' && dayCell !== null ? dayCell.value : dayCell;
        const dayColor = typeof dayCell === 'object' && dayCell !== null ? dayCell.color : null;
        
        const nightValue = typeof nightCell === 'object' && nightCell !== null ? nightCell.value : nightCell;
        const nightColor = typeof nightCell === 'object' && nightCell !== null ? nightCell.color : null;

        // Map color to quality ID
        const dayQualityId = colorQualityMap[String(dayColor)] || colorQualityMap['null'] || 'unassigned';
        const nightQualityId = colorQualityMap[String(nightColor)] || colorQualityMap['null'] || 'unassigned';

        // Accumulate day shift meters
        if (dayValue && typeof dayValue === 'number' && dayValue > 0) {
          const existing = productionMap.get(dayQualityId) || { dayMeters: 0, nightMeters: 0 };
          existing.dayMeters += dayValue;
          productionMap.set(dayQualityId, existing);
        }

        // Accumulate night shift meters
        if (nightValue && typeof nightValue === 'number' && nightValue > 0) {
          const existing = productionMap.get(nightQualityId) || { dayMeters: 0, nightMeters: 0 };
          existing.nightMeters += nightValue;
          productionMap.set(nightQualityId, existing);
        }
      }
    });
  });

  // Convert map to array with quality names
  const result: ProductionByQuality[] = [];
  
  productionMap.forEach((meters, qualityId) => {
    const quality = qualities.find(q => q.id === qualityId);
    const qualityName = quality?.name || (qualityId === 'unassigned' ? 'Unassigned' : 'Unknown');
    
    result.push({
      qualityId,
      qualityName,
      totalMeters: meters.dayMeters + meters.nightMeters,
      dayMeters: meters.dayMeters,
      nightMeters: meters.nightMeters,
    });
  });

  // Sort by total meters descending
  return result.sort((a, b) => b.totalMeters - a.totalMeters);
}

/**
 * Calculate grand total meters across all qualities
 */
export function calculateTotalMetersProduced(productionByQuality: ProductionByQuality[]): number {
  return productionByQuality.reduce((sum, item) => sum + item.totalMeters, 0);
}
