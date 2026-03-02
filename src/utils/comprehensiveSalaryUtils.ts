
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

        const cycle = assignment.cycle;
        const startMachine = (sheetNum - 1) * MACHINES_PER_SHEET + 1;
        const endMachine = sheetNum * MACHINES_PER_SHEET;

        let daySheetTotal = 0;
        let nightSheetTotal = 0;

        // Process each machine
        for (let machineIdx = 1; machineIdx <= MACHINES_PER_SHEET; machineIdx++) {
            grid.forEach((row: any) => {
                const dayCell = getCellData(row[`machine${machineIdx}_day`]);
                const nightCell = getCellData(row[`machine${machineIdx}_night`]);

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

        sheetSalaries.push({
            sheetNum,
            machines: `M${startMachine}-${endMachine}`,
            cycle,
            dayTotal: daySheetTotal,
            nightTotal: nightSheetTotal,
            totalSalary: daySheetTotal + nightSheetTotal
        });
    }

    return { salaries, sheetSalaries };
};

export const calculateWarpingSalaries = (beams: Beam[], activeCycle: string, selectedMonth: string): WarpingSalary[] => {
    const cycleBeams = beams.filter(b => {
        const beamDate = b.date;
        const beamMonth = beamDate.slice(0, 7);
        const day = parseInt(beamDate.split('-')[2]);
        const matchesMonth = beamMonth === selectedMonth;
        const matchesCycle = activeCycle === '1-15' ? day <= 15 : day > 15;
        return matchesMonth && matchesCycle;
    });

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
        grouped[beam.warper].totalTakas += beam.noOfTakas;
        const amount = beam.noOfTakas * beam.pricePerBeam;
        grouped[beam.warper].totalAmount += amount;
    });

    return Object.values(grouped);
};

export const calculateTFOSalaries = (workers: TFOWorker[], attendance: TFOAttendance[], activeCycle: string): TFOSalary[] => {
    return workers.map(worker => {
        const workerAttendance = attendance.filter(
            a => a.workerId === worker.id && a.cycle === activeCycle
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

export const calculateBobbinSalaries = (workers: BobbinWorker[], attendance: BobbinAttendance[], activeCycle: string): BobbinSalary[] => {
    return workers.map(worker => {
        const workerAttendance = attendance.filter(
            a => a.workerId === worker.id && a.cycle === activeCycle
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

export const calculateWiremanSalaries = (workers: WiremanWorker[], bills: WiremanBill[], activeCycle: string): WiremanSalary[] => {
    return workers.map(worker => {
        const workerBills = bills.filter(
            b => b.workerId === worker.id && b.cycle === activeCycle
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
    return beamPasars.filter(bp => {
        const bpDate = bp.date;
        const bpMonth = bpDate.slice(0, 7);
        const day = parseInt(bpDate.split('-')[2]);
        const matchesMonth = bpMonth === selectedMonth;
        const matchesCycle = activeCycle === '1-15' ? day <= 15 : day > 15;
        return matchesMonth && matchesCycle;
    }).map(bp => {
        return {
            ...bp,
            amount: (bp.ratePerBeam || 0)
        };
    });
};
