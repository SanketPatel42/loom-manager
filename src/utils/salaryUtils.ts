
import type { WorkerProfile, Quality, WorkerSheetData, SheetAssignment, CellData } from "@/lib/types";

export interface QualityBreakdown {
    qualityName: string;
    rate: number;
    totalMeters: number;
    totalAmount: number;
}

export interface SheetEntry {
    sheetNum: number;
    machines: string;
    dayTotal: number;
    nightTotal: number;
    activeDays: number[];
}

export interface WorkerSalary {
    workerId: string;
    workerName: string;
    cycle: '1-15' | '16-30';
    sheets: SheetEntry[];
    totalDaySalary: number;
    totalNightSalary: number;
    totalSalary: number;
    qualityBreakdown: QualityBreakdown[];
}

const MACHINES_PER_SHEET = 12;
const TOTAL_SHEETS = 12;

// Helper to get CellData from legacy or new format
const getCellData = (cellValue: any): { value: number; color: string | null } => {
    if (typeof cellValue === 'object' && cellValue !== null && 'value' in cellValue) {
        return cellValue;
    }
    return { value: typeof cellValue === 'number' ? cellValue : 0, color: null };
};

// Helper to get worker for a specific day/shift
const getWorkerForDay = (assign: SheetAssignment, shift: 'day' | 'night', day: number): string => {
    const splits = shift === 'day' ? assign.dayWorkerSplits : assign.nightWorkerSplits;
    if (splits && Array.isArray(splits)) {
        const split = splits.find((s) => day >= s.startDay && day <= s.endDay);
        if (split) return split.workerId;
    }
    return shift === 'day' ? assign.dayWorker : assign.nightWorker;
};

export const calculateSalaries = (
    sheetData: WorkerSheetData,
    workerProfiles: WorkerProfile[],
    qualityData: Quality[],
    filterCycle: '1-15' | '16-30'
): WorkerSalary[] => {
    const { assignments, gridData } = sheetData;
    const salaries: Record<string, WorkerSalary> = {};
    const workerQualityStats: Record<string, Record<string, { qualityName: string; rate: number; totalMeters: number; totalAmount: number }>> = {};

    const updateQualityStats = (workerId: string, quality: Quality | undefined, meters: number, amount: number) => {
        if (!workerId || amount === 0) return;

        if (!workerQualityStats[workerId]) {
            workerQualityStats[workerId] = {};
        }

        const qualityId = quality?.id || 'unknown';
        const qualityName = quality?.name || 'Unknown Quality';
        const rate = quality?.ratePerMeter || 0;

        if (!workerQualityStats[workerId][qualityId]) {
            workerQualityStats[workerId][qualityId] = {
                qualityName: qualityName,
                rate: rate,
                totalMeters: 0,
                totalAmount: 0
            };
        }

        workerQualityStats[workerId][qualityId].totalMeters += meters;
        workerQualityStats[workerId][qualityId].totalAmount += amount;
    };

    // Process each sheet
    for (let sheetNum = 1; sheetNum <= TOTAL_SHEETS; sheetNum++) {
        const sheetKey = sheetNum.toString();
        const assignment = assignments[sheetKey];
        const grid = gridData[sheetKey];

        if (!assignment || !grid) continue;

        const cycle = assignment.cycle;

        // Filter by cycle
        if (cycle !== filterCycle) continue;

        const startMachine = (sheetNum - 1) * MACHINES_PER_SHEET + 1;
        const endMachine = sheetNum * MACHINES_PER_SHEET;

        // Process each machine
        for (let machineIdx = 1; machineIdx <= MACHINES_PER_SHEET; machineIdx++) {
            grid.forEach((row: any) => {
                const dayNum = row.day;
                const dayCell = getCellData(row[`machine${machineIdx}_day`]);
                const nightCell = getCellData(row[`machine${machineIdx}_night`]);

                const dayWorkerId = getWorkerForDay(assignment, 'day', dayNum);
                const nightWorkerId = getWorkerForDay(assignment, 'night', dayNum);

                const dayColorKey = dayCell.color === null ? 'null' : dayCell.color;
                const nightColorKey = nightCell.color === null ? 'null' : nightCell.color;

                let dayQualityId = assignment.colorQualityMap?.[dayColorKey];
                let nightQualityId = assignment.colorQualityMap?.[nightColorKey];

                // Fallback to legacy machineQualities
                if (!dayQualityId && assignment.machineQualities) {
                    dayQualityId = assignment.machineQualities[machineIdx];
                }
                if (!nightQualityId && assignment.machineQualities) {
                    nightQualityId = assignment.machineQualities[machineIdx];
                }

                const dayQuality = qualityData.find(q => q.id === dayQualityId);
                const nightQuality = qualityData.find(q => q.id === nightQualityId);

                const dayRate = dayQuality?.ratePerMeter || 0;
                const nightRate = nightQuality?.ratePerMeter || 0;

                const dayAmount = dayCell.value * dayRate;
                const nightAmount = nightCell.value * nightRate;

                // Process Day Worker
                if (dayWorkerId) {
                    updateQualityStats(dayWorkerId, dayQuality, dayCell.value, dayAmount);

                    if (!salaries[dayWorkerId]) {
                        const worker = workerProfiles.find(w => w.id === dayWorkerId);
                        salaries[dayWorkerId] = {
                            workerId: dayWorkerId,
                            workerName: worker?.name || 'Unknown',
                            cycle,
                            sheets: [],
                            totalDaySalary: 0,
                            totalNightSalary: 0,
                            totalSalary: 0,
                            qualityBreakdown: [],
                        };
                    }

                    let sheetEntry = salaries[dayWorkerId].sheets.find(s => s.sheetNum === sheetNum);
                    if (!sheetEntry) {
                        sheetEntry = {
                            sheetNum,
                            machines: `${startMachine}-${endMachine}`,
                            dayTotal: 0,
                            nightTotal: 0,
                            activeDays: [],
                        };
                        salaries[dayWorkerId].sheets.push(sheetEntry);
                    }

                    sheetEntry.dayTotal += dayAmount;
                    if (!sheetEntry.activeDays.includes(dayNum)) {
                        sheetEntry.activeDays.push(dayNum);
                        sheetEntry.activeDays.sort((a, b) => a - b);
                    }
                    salaries[dayWorkerId].totalDaySalary += dayAmount;
                    salaries[dayWorkerId].totalSalary += dayAmount;
                }

                // Process Night Worker
                if (nightWorkerId) {
                    updateQualityStats(nightWorkerId, nightQuality, nightCell.value, nightAmount);

                    if (!salaries[nightWorkerId]) {
                        const worker = workerProfiles.find(w => w.id === nightWorkerId);
                        salaries[nightWorkerId] = {
                            workerId: nightWorkerId,
                            workerName: worker?.name || 'Unknown',
                            cycle,
                            sheets: [],
                            totalDaySalary: 0,
                            totalNightSalary: 0,
                            totalSalary: 0,
                            qualityBreakdown: [],
                        };
                    }

                    let sheetEntry = salaries[nightWorkerId].sheets.find(s => s.sheetNum === sheetNum);
                    if (!sheetEntry) {
                        sheetEntry = {
                            sheetNum,
                            machines: `${startMachine}-${endMachine}`,
                            dayTotal: 0,
                            nightTotal: 0,
                            activeDays: [],
                        };
                        salaries[nightWorkerId].sheets.push(sheetEntry);
                    }

                    sheetEntry.nightTotal += nightAmount;
                    if (!sheetEntry.activeDays.includes(dayNum)) {
                        sheetEntry.activeDays.push(dayNum);
                        sheetEntry.activeDays.sort((a, b) => a - b);
                    }
                    salaries[nightWorkerId].totalNightSalary += nightAmount;
                    salaries[nightWorkerId].totalSalary += nightAmount;
                }
            });
        }
    }

    // Convert stats to array and assign to salaries
    Object.keys(salaries).forEach(workerId => {
        const stats = workerQualityStats[workerId];
        if (stats) {
            salaries[workerId].qualityBreakdown = Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
        }
    });

    return Object.values(salaries);
};
