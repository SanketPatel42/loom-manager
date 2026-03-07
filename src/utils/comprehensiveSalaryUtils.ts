
import type {
    WorkerProfile,
    Quality,
    Beam,
    BeamPasar,
    WorkerSheetData,
    TFOWorker,
    TFOAttendance,
    BobbinWorker,
    BobbinAttendance,
    WiremanWorker,
    WiremanBill
} from "@/lib/types";
import { calculateSalaries, WorkerSalary } from "@/utils/salaryUtils";
import { APP_CONSTANTS } from "@/lib/constants";

export type { WorkerSalary };

export interface SheetSalary {
    sheetNum: number;
    machines: string;
    cycle: '1-15' | '16-30';
    dayTotal: number;
    nightTotal: number;
    totalSalary: number;
}

export interface TFOSalary {
    workerId: string;
    workerName: string;
    fullDays: number;
    halfDays: number;
    totalSalary: number;
}

export interface BobbinSalary {
    workerId: string;
    workerName: string;
    fullDays: number;
    halfDays: number;
    totalSalary: number;
}

export interface WiremanSalary {
    workerId: string;
    workerName: string;
    totalBills: number;
}

export interface WarpingSalary {
    warperName: string;
    totalBeams: number;
    totalTakas: number;
    totalAmount: number;
}

export interface BeamPasarSalary extends BeamPasar {
    amount: number;
}

export const calculateProductionSalaries = (
    sheetData: WorkerSheetData,
    workerProfiles: WorkerProfile[],
    qualityData: Quality[]
): { salaries: WorkerSalary[]; sheetSalaries: SheetSalary[] } => {

    // Use the existing utility for worker salaries
    const salaries = calculateSalaries(sheetData, workerProfiles, qualityData, '1-15').concat(calculateSalaries(sheetData, workerProfiles, qualityData, '16-30'));

    // We need to re-derive sheet salaries based on the sheetData specifically for the summary view
    // This part logic was embedded in the component, so we extract it here.
    const { assignments, gridData } = sheetData;
    const sheetSalaries: SheetSalary[] = [];
    const { MACHINES_PER_SHEET, TOTAL_SHEETS } = APP_CONSTANTS;

    // Helper to get CellData from legacy or new format
    const getCellData = (cellValue: any): { value: number; color: string | null } => {
        if (typeof cellValue === 'object' && cellValue !== null && 'value' in cellValue) {
            return cellValue;
        }
        return { value: typeof cellValue === 'number' ? cellValue : 0, color: null };
    };

    for (let sheetNum = 1; sheetNum <= TOTAL_SHEETS; sheetNum++) {
        const sheetKey = sheetNum.toString();
        const assignment = assignments[sheetKey];
        const grid = gridData[sheetKey];

        if (!assignment || !grid) continue;

        const startMachine = (sheetNum - 1) * MACHINES_PER_SHEET + 1;
        const endMachine = sheetNum * MACHINES_PER_SHEET;

        // Calculate for each cycle
        ['1-15', '16-30'].forEach((cycle: any) => {
            let daySheetTotal = 0;
            let nightSheetTotal = 0;
            let hasProduction = false;

            // Process each machine
            for (let machineIdx = 1; machineIdx <= MACHINES_PER_SHEET; machineIdx++) {
                grid.forEach((row: any) => {
                    const dayNum = row.day;
                    const matchesCycle = cycle === '1-15' ? dayNum <= 15 : dayNum > 15;
                    if (!matchesCycle) return;

                    const dayCell = getCellData(row[`machine${machineIdx}_day`]);
                    const nightCell = getCellData(row[`machine${machineIdx}_night`]);

                    if (dayCell.value > 0 || nightCell.value > 0) hasProduction = true;

                    // Get quality
                    const dayColorKey = dayCell.color === null ? 'null' : dayCell.color;
                    const nightColorKey = nightCell.color === null ? 'null' : nightCell.color;

                    let dayQualityId = assignment.colorQualityMap?.[dayColorKey];
                    let nightQualityId = assignment.colorQualityMap?.[nightColorKey];

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

                    daySheetTotal += dayCell.value * dayRate;
                    nightSheetTotal += nightCell.value * nightRate;
                });
            }

            if (hasProduction || daySheetTotal > 0 || nightSheetTotal > 0) {
                sheetSalaries.push({
                    sheetNum,
                    machines: `M${startMachine}-${endMachine}`,
                    cycle,
                    dayTotal: daySheetTotal,
                    nightTotal: nightSheetTotal,
                    totalSalary: daySheetTotal + nightSheetTotal
                });
            }
        });
    }

    return { salaries, sheetSalaries };
};

export const calculateWarpingSalaries = (beams: Beam[], activeCycle: string, selectedMonth: string): WarpingSalary[] => {
    console.log('calculateWarpingSalaries called with:', { beamsCount: beams.length, activeCycle, selectedMonth });
    
    const cycleBeams = beams.filter(b => {
        const beamDate = b.date;
        const beamMonth = beamDate.slice(0, 7);
        const day = parseInt(beamDate.split('-')[2]);
        const matchesMonth = beamMonth === selectedMonth;
        const matchesCycle = activeCycle === '1-15' ? day <= 15 : day > 15;
        return matchesMonth && matchesCycle;
    });

    console.log('Filtered beams for cycle:', cycleBeams.length);

    const grouped: Record<string, WarpingSalary> = {};
    cycleBeams.forEach(beam => {
        if (!grouped[beam.warper]) {
            grouped[beam.warper] = {
                warperName: beam.warper,
                totalBeams: 0,
                totalTakas: 0,
                totalAmount: 0
            };
        }
        grouped[beam.warper].totalBeams++;
        grouped[beam.warper].totalTakas += beam.noOfTakas || 0;
        // Calculate amount properly: noOfTakas * pricePerBeam
        const amount = (beam.noOfTakas || 0) * (beam.pricePerBeam || 0);
        grouped[beam.warper].totalAmount += amount;
    });

    const result = Object.values(grouped);
    console.log('Warping salaries result:', result);
    return result;
};

export const calculateTFOSalaries = (workers: TFOWorker[], attendance: TFOAttendance[], activeCycle: string, selectedMonth: string): TFOSalary[] => {
    return workers.map(worker => {
        const workerAttendance = attendance.filter(
            a => {
                const matchesWorker = a.workerId === worker.id;
                const matchesCycle = a.cycle === activeCycle;
                const matchesMonth = a.date.slice(0, 7) === selectedMonth;
                return matchesWorker && matchesCycle && matchesMonth;
            }
        );
        const fullDays = workerAttendance.filter(a => a.type === 'full').length;
        const halfDays = workerAttendance.filter(a => a.type === 'half').length;
        const totalSalary = (fullDays * worker.fullDaySalary) + (halfDays * worker.fullDaySalary / 2);

        return {
            workerId: worker.id,
            workerName: worker.name,
            fullDays,
            halfDays,
            totalSalary,
        };
    });
};

export const calculateBobbinSalaries = (workers: BobbinWorker[], attendance: BobbinAttendance[], activeCycle: string, selectedMonth: string): BobbinSalary[] => {
    return workers.map(worker => {
        const workerAttendance = attendance.filter(
            a => {
                const matchesWorker = a.workerId === worker.id;
                const matchesCycle = a.cycle === activeCycle;
                const matchesMonth = a.date.slice(0, 7) === selectedMonth;
                return matchesWorker && matchesCycle && matchesMonth;
            }
        );
        const fullDays = workerAttendance.filter(a => a.type === 'full').length;
        const halfDays = workerAttendance.filter(a => a.type === 'half').length;
        const totalSalary = (fullDays * worker.fullDaySalary) + (halfDays * worker.fullDaySalary / 2);

        return {
            workerId: worker.id,
            workerName: worker.name,
            fullDays,
            halfDays,
            totalSalary,
        };
    });
};

export const calculateWiremanSalaries = (workers: WiremanWorker[], bills: WiremanBill[], activeCycle: string, selectedMonth: string): WiremanSalary[] => {
    return workers.map(worker => {
        const workerBills = bills.filter(
            b => {
                const matchesWorker = b.workerId === worker.id;
                const matchesCycle = b.cycle === activeCycle;
                const matchesMonth = b.date.slice(0, 7) === selectedMonth;
                return matchesWorker && matchesCycle && matchesMonth;
            }
        );
        const totalBills = workerBills.reduce((sum, bill) => sum + bill.billAmount, 0);

        return {
            workerId: worker.id,
            workerName: worker.name,
            totalBills,
        };
    });
};

export const calculateBeamPasarSalaries = (beamPasars: BeamPasar[], activeCycle: string, selectedMonth: string): BeamPasarSalary[] => {
    console.log('calculateBeamPasarSalaries called with:', { beamPasarsCount: beamPasars.length, activeCycle, selectedMonth });
    
    const filtered = beamPasars.filter(bp => {
        const bpDate = bp.date;
        const bpMonth = bpDate.slice(0, 7);
        const day = parseInt(bpDate.split('-')[2]);
        const matchesMonth = bpMonth === selectedMonth;
        const matchesCycle = activeCycle === '1-15' ? day <= 15 : day > 15;
        return matchesMonth && matchesCycle;
    });

    console.log('Filtered beam pasars for cycle:', filtered.length);

    // Group by rate per beam to count entries for each rate
    const rateGroups: Record<number, BeamPasar[]> = {};
    filtered.forEach(bp => {
        const rate = bp.ratePerBeam || 0;
        if (!rateGroups[rate]) {
            rateGroups[rate] = [];
        }
        rateGroups[rate].push(bp);
    });

    console.log('Rate groups:', Object.keys(rateGroups).map(rate => ({ rate, count: rateGroups[Number(rate)].length })));

    const result = filtered.map(bp => {
        const rate = bp.ratePerBeam || 0;
        const beamEntriesForThisRate = rateGroups[rate].length;
        
        // Calculate amount based on beam entries count and rate per beam
        const amount = beamEntriesForThisRate * rate;
        
        console.log(`Beam pasar calculation: ${beamEntriesForThisRate} entries × ₹${rate} = ₹${amount}`);
        
        return {
            ...bp,
            amount: amount
        };
    });

    console.log('Beam pasar salaries result:', result);
    return result;
};
