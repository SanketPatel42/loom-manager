import type { Beam, Quality } from "@/lib/types";

export interface YarnUsageByQuality {
  qualityId: string;
  qualityName: string;
  totalKg: number;
  beamCount: number;
}

/**
 * Calculate yarn usage by quality for a given time period
 * @param beams - Array of beam records
 * @param qualities - Array of quality definitions
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - Optional end date in YYYY-MM-DD format (defaults to today)
 * @returns Array of yarn usage by quality
 */
export function calculateYarnUsageByQuality(
  beams: Beam[],
  qualities: Quality[],
  startDate: string,
  endDate?: string
): YarnUsageByQuality[] {
  const end = endDate || new Date().toISOString().split('T')[0];
  
  // Filter beams by date range
  const filteredBeams = beams.filter(
    beam => beam.date >= startDate && beam.date <= end
  );

  // Group by quality
  const usageMap = new Map<string, { totalKg: number; beamCount: number }>();

  filteredBeams.forEach(beam => {
    if (!beam.qualityId || !beam.yarnUsedKg) return;

    const existing = usageMap.get(beam.qualityId) || { totalKg: 0, beamCount: 0 };
    usageMap.set(beam.qualityId, {
      totalKg: existing.totalKg + beam.yarnUsedKg,
      beamCount: existing.beamCount + 1,
    });
  });

  // Convert to array with quality names
  const result: YarnUsageByQuality[] = [];
  usageMap.forEach((usage, qualityId) => {
    const quality = qualities.find(q => q.id === qualityId);
    if (quality) {
      result.push({
        qualityId,
        qualityName: quality.name,
        totalKg: usage.totalKg,
        beamCount: usage.beamCount,
      });
    }
  });

  // Sort by total kg descending
  return result.sort((a, b) => b.totalKg - a.totalKg);
}

/**
 * Calculate total yarn usage for a time period
 */
export function calculateTotalYarnUsage(
  beams: Beam[],
  startDate: string,
  endDate?: string
): number {
  const end = endDate || new Date().toISOString().split('T')[0];
  
  return beams
    .filter(beam => beam.date >= startDate && beam.date <= end)
    .reduce((total, beam) => total + (beam.yarnUsedKg || 0), 0);
}
