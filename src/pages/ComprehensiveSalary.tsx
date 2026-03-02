import { useState, useEffect } from "react";
import { storage, asyncStorage } from "@/lib/storage";
import type { WorkerProfile, Quality, BegariWorker, TFOWorker, TFOAttendance, MasterWorker, WiremanWorker, WiremanBill, Beam, BeamPasar, BobbinWorker, BobbinAttendance } from "@/lib/types";
import {
    calculateProductionSalaries,
    calculateWarpingSalaries,
    calculateTFOSalaries,
    calculateBobbinSalaries,
    calculateWiremanSalaries,
    calculateBeamPasarSalaries,
    WorkerSalary,
    SheetSalary,
    TFOSalary,
    BobbinSalary,
    WiremanSalary,
    WarpingSalary,
    BeamPasarSalary
} from "@/utils/comprehensiveSalaryUtils";
import { APP_CONSTANTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const { CURRENCY_SYMBOL } = APP_CONSTANTS;

export default function ComprehensiveSalaryCalculator() {
    const [workers, setWorkers] = useState<WorkerProfile[]>([]);
    const [qualities, setQualities] = useState<Quality[]>([]);
    const [salaryData, setSalaryData] = useState<WorkerSalary[]>([]);
    const [sheetSalaryData, setSheetSalaryData] = useState<SheetSalary[]>([]);
    const [activeCycle, setActiveCycle] = useState<'1-15' | '16-30'>('1-15');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isLoading, setIsLoading] = useState(true);

    // Additional worker types
    const [begariWorkers, setBegariWorkers] = useState<BegariWorker[]>([]);
    const [tfoWorkers, setTFOWorkers] = useState<TFOWorker[]>([]);
    const [tfoAttendance, setTFOAttendance] = useState<TFOAttendance[]>([]);
    const [bobbinWorkers, setBobbinWorkers] = useState<BobbinWorker[]>([]);
    const [bobbinAttendance, setBobbinAttendance] = useState<BobbinAttendance[]>([]);
    const [masterWorkers, setMasterWorkers] = useState<MasterWorker[]>([]);
    const [wiremanWorkers, setWiremanWorkers] = useState<WiremanWorker[]>([]);
    const [wiremanBills, setWiremanBills] = useState<WiremanBill[]>([]);
    const [beams, setBeams] = useState<Beam[]>([]);
    const [beamPasars, setBeamPasars] = useState<BeamPasar[]>([]);

    useEffect(() => {
        loadData();
    }, [selectedMonth, activeCycle]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            console.log('=== ComprehensiveSalary: Loading Data ===');
            // Simulate realistic loading
            await new Promise(resolve => setTimeout(resolve, 500));

            const workerProfiles = await Promise.resolve(storage.getWorkerProfiles());
            const qualityData = await Promise.resolve(storage.getQualities());
            const sheetData = await Promise.resolve(storage.getWorkerSheetData());

            setWorkers(workerProfiles);
            setQualities(qualityData);

            if (sheetData) {
                console.log('Calculating salaries from sheet data...');
                const { salaries, sheetSalaries } = calculateProductionSalaries(sheetData, workerProfiles, qualityData);
                setSalaryData(salaries);
                setSheetSalaryData(sheetSalaries);
            } else {
                console.log('No sheet data found!');
            }

            // Load additional worker types
            const begariWorkersData = await Promise.resolve(storage.getBegariWorkers());
            const tfoWorkersData = await Promise.resolve(storage.getTFOWorkers());
            const tfoAttendanceData = await Promise.resolve(storage.getTFOAttendance());
            const bobbinWorkersData = await Promise.resolve(storage.getBobbinWorkers());
            const bobbinAttendanceData = await Promise.resolve(storage.getBobbinAttendance());
            const masterWorkersData = await Promise.resolve(storage.getMasterWorkers());
            const wiremanWorkersData = await Promise.resolve(storage.getWiremanWorkers());
            const wiremanBillsData = await Promise.resolve(storage.getWiremanBills());

            // Beams are managed via useAsyncStorage (DB/Electron), so we use asyncStorage to fetch them
            const beamsData = await asyncStorage.getBeams();
            // Beam Pasars are managed via legacy storage (BeamPasar.tsx), so we use storage to fetch them
            const beamPasarsData = await Promise.resolve(storage.getBeamPasars());

            setBegariWorkers(begariWorkersData);
            setTFOWorkers(tfoWorkersData);
            setTFOAttendance(tfoAttendanceData);
            setBobbinWorkers(bobbinWorkersData);
            setBobbinAttendance(bobbinAttendanceData);
            setMasterWorkers(masterWorkersData);
            setWiremanWorkers(wiremanWorkersData);
            setWiremanBills(wiremanBillsData);
            setBeams(beamsData);
            setBeamPasars(beamPasarsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Local salary calculation functions removed. Using utility functions.

    const filteredSalaries = salaryData.filter(s => s.cycle === activeCycle);
    const filteredSheetSalaries = sheetSalaryData.filter(s => s.cycle === activeCycle);
    const tfoSalaries = calculateTFOSalaries(tfoWorkers, tfoAttendance, activeCycle);
    const bobbinSalaries = calculateBobbinSalaries(bobbinWorkers, bobbinAttendance, activeCycle);
    const wiremanSalaries = calculateWiremanSalaries(wiremanWorkers, wiremanBills, activeCycle);
    const warpingSalaries = calculateWarpingSalaries(beams, activeCycle, selectedMonth);
    const beamPasarSalaries = calculateBeamPasarSalaries(beamPasars, activeCycle, selectedMonth);

    // Detect workers with excessive machine assignments
    const workersWithTooManySheets = filteredSalaries.filter(s => s.sheets.length > 2);

    // Calculate totals
    const productionWorkerTotal = filteredSheetSalaries.reduce((sum, s) => sum + s.totalSalary, 0);
    const begariTotal = begariWorkers.reduce((sum, w) => sum + w.monthlySalary / 2, 0); // Half month
    const tfoTotal = tfoSalaries.reduce((sum, s) => sum + s.totalSalary, 0);
    const bobbinTotal = bobbinSalaries.reduce((sum, s) => sum + s.totalSalary, 0);
    const masterTotal = masterWorkers.reduce((sum, w) => sum + w.monthlySalary / 2, 0); // Half month
    const wiremanTotal = wiremanSalaries.reduce((sum, s) => sum + s.totalBills, 0);
    const warpingTotal = warpingSalaries.reduce((sum, s) => sum + s.totalAmount, 0);
    const beamPasarTotal = beamPasarSalaries.reduce((sum, s) => sum + s.amount, 0);
    const grandTotal = productionWorkerTotal + begariTotal + tfoTotal + bobbinTotal + masterTotal + wiremanTotal + warpingTotal + beamPasarTotal;

    const totalWorkers = filteredSheetSalaries.length + begariWorkers.length + tfoWorkers.length + bobbinWorkers.length + masterWorkers.length + wiremanWorkers.length + warpingSalaries.length;

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Comprehensive Salary Calculator</h1>
                <p className="text-muted-foreground">
                    Complete salary breakdown for all worker types
                </p>
            </div>

            {/* Month Selection */}
            <div className="mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Select Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : totalWorkers}</div>
                        <p className="text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-4 w-24 mt-1" /> : "All categories"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grand Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `${CURRENCY_SYMBOL}${grandTotal.toFixed(2)}`}</div>
                        <p className="text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-4 w-24 mt-1" /> : `For ${activeCycle} cycle`}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Production Workers</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `${CURRENCY_SYMBOL}${productionWorkerTotal.toFixed(2)}`}</div>
                        <p className="text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-4 w-20 mt-1" /> : `${filteredSheetSalaries.length} sheets`}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fixed Salary</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `${CURRENCY_SYMBOL}${(begariTotal + masterTotal).toFixed(2)}`}</div>
                        <p className="text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-4 w-24 mt-1" /> : "Begari + Master"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Salary Tables */}
            <Card>
                <CardHeader>
                    <CardTitle>Salary Breakdown by Worker Type</CardTitle>
                    <CardDescription>Detailed salary calculations per cycle</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeCycle} onValueChange={(v) => setActiveCycle(v as '1-15' | '16-30')}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="1-15">Days 1-15</TabsTrigger>
                            <TabsTrigger value="16-30">Days 16-30</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeCycle} className="space-y-6">
                            {/* Warning for workers with too many sheets */}
                            {workersWithTooManySheets.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Data Issue Detected!</AlertTitle>
                                    <AlertDescription>
                                        {workersWithTooManySheets.length} worker(s) assigned to more than 2 sheets (24+ machines):
                                        <ul className="list-disc list-inside mt-2">
                                            {workersWithTooManySheets.map(w => (
                                                <li key={w.workerId}>
                                                    <strong>{w.workerName}</strong>: {w.sheets.length} sheets ({w.sheets.length * 12} machines)
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-sm">Please check the Worker & Machine Sheet page to correct assignments.</p>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Production Workers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Production Workers</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Based on quality rates and production)
                                    </span>
                                </h3>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ) : sheetSalaryData.filter(s => s.cycle === activeCycle).length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No production worker data for this cycle
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[200px]">Sheet</TableHead>
                                                    <TableHead>Machines</TableHead>
                                                    <TableHead className="text-right">Day Shift</TableHead>
                                                    <TableHead className="text-right">Night Shift</TableHead>
                                                    <TableHead className="text-right font-semibold">Total Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sheetSalaryData
                                                    .filter(s => s.cycle === activeCycle)
                                                    .map((salary) => (
                                                        <TableRow key={salary.sheetNum}>
                                                            <TableCell className="font-medium">
                                                                S{salary.sheetNum} ({salary.machines})
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {salary.machines}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {CURRENCY_SYMBOL}{salary.dayTotal.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {CURRENCY_SYMBOL}{salary.nightTotal.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-lg">
                                                                {CURRENCY_SYMBOL}{salary.totalSalary.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={2}>Subtotal</TableCell>
                                                    <TableCell className="text-right">
                                                        {CURRENCY_SYMBOL}{sheetSalaryData
                                                            .filter(s => s.cycle === activeCycle)
                                                            .reduce((sum, s) => sum + s.dayTotal, 0)
                                                            .toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {CURRENCY_SYMBOL}{sheetSalaryData
                                                            .filter(s => s.cycle === activeCycle)
                                                            .reduce((sum, s) => sum + s.nightTotal, 0)
                                                            .toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{productionWorkerTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Begari Workers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Begari Workers</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Fixed monthly salary - half month shown)
                                    </span>
                                </h3>
                                {begariWorkers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No begari workers registered
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Worker Name</TableHead>
                                                    <TableHead>Phone Number</TableHead>
                                                    <TableHead className="text-right">Monthly Salary</TableHead>
                                                    <TableHead className="text-right font-semibold">Half Month Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {begariWorkers.map((worker) => (
                                                    <TableRow key={worker.id}>
                                                        <TableCell className="font-medium">{worker.name}</TableCell>
                                                        <TableCell>{worker.phoneNumber}</TableCell>
                                                        <TableCell className="text-right">{CURRENCY_SYMBOL}{worker.monthlySalary.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right font-bold text-lg">
                                                            {CURRENCY_SYMBOL}{(worker.monthlySalary / 2).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{begariTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* TFO Workers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">TFO Workers</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Based on attendance)
                                    </span>
                                </h3>
                                {tfoWorkers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No TFO workers registered
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Worker Name</TableHead>
                                                    <TableHead className="text-right">Full Days</TableHead>
                                                    <TableHead className="text-right">Half Days</TableHead>
                                                    <TableHead className="text-right">Rate/Day</TableHead>
                                                    <TableHead className="text-right font-semibold">Total Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {tfoSalaries.map((salary) => {
                                                    const worker = tfoWorkers.find(w => w.id === salary.workerId);
                                                    return (
                                                        <TableRow key={salary.workerId}>
                                                            <TableCell className="font-medium">{salary.workerName}</TableCell>
                                                            <TableCell className="text-right">{salary.fullDays}</TableCell>
                                                            <TableCell className="text-right">{salary.halfDays}</TableCell>
                                                            <TableCell className="text-right">{CURRENCY_SYMBOL}{worker?.fullDaySalary.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right font-bold text-lg">
                                                                {CURRENCY_SYMBOL}{salary.totalSalary.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={4}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{tfoTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Bobbin Workers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Bobbin Workers</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Based on attendance)
                                    </span>
                                </h3>
                                {bobbinWorkers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No Bobbin workers registered
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Worker Name</TableHead>
                                                    <TableHead className="text-right">Full Days</TableHead>
                                                    <TableHead className="text-right">Half Days</TableHead>
                                                    <TableHead className="text-right">Rate/Day</TableHead>
                                                    <TableHead className="text-right font-semibold">Total Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {bobbinSalaries.map((salary) => {
                                                    const worker = bobbinWorkers.find(w => w.id === salary.workerId);
                                                    return (
                                                        <TableRow key={salary.workerId}>
                                                            <TableCell className="font-medium">{salary.workerName}</TableCell>
                                                            <TableCell className="text-right">{salary.fullDays}</TableCell>
                                                            <TableCell className="text-right">{salary.halfDays}</TableCell>
                                                            <TableCell className="text-right">{CURRENCY_SYMBOL}{worker?.fullDaySalary.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right font-bold text-lg">
                                                                {CURRENCY_SYMBOL}{salary.totalSalary.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={4}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{bobbinTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Master Workers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Master Workers</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Fixed monthly salary - half month shown)
                                    </span>
                                </h3>
                                {masterWorkers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No master workers registered
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Worker Name</TableHead>
                                                    <TableHead>Phone Number</TableHead>
                                                    <TableHead className="text-right">Monthly Salary</TableHead>
                                                    <TableHead className="text-right font-semibold">Half Month Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {masterWorkers.map((worker) => (
                                                    <TableRow key={worker.id}>
                                                        <TableCell className="font-medium">{worker.name}</TableCell>
                                                        <TableCell>{worker.phoneNumber}</TableCell>
                                                        <TableCell className="text-right">{CURRENCY_SYMBOL}{worker.monthlySalary.toFixed(2)}</TableCell>
                                                        <TableCell className="text-right font-bold text-lg">
                                                            {CURRENCY_SYMBOL}{(worker.monthlySalary / 2).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{masterTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Wireman Workers */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Wireman</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Based on bills)
                                    </span>
                                </h3>
                                {wiremanWorkers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No wireman workers registered
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Worker Name</TableHead>
                                                    <TableHead>Phone Number</TableHead>
                                                    <TableHead className="text-right">Number of Bills</TableHead>
                                                    <TableHead className="text-right font-semibold">Total Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {wiremanSalaries.map((salary) => {
                                                    const worker = wiremanWorkers.find(w => w.id === salary.workerId);
                                                    const billCount = wiremanBills.filter(
                                                        b => b.workerId === salary.workerId && b.cycle === activeCycle
                                                    ).length;
                                                    return (
                                                        <TableRow key={salary.workerId}>
                                                            <TableCell className="font-medium">{salary.workerName}</TableCell>
                                                            <TableCell>{worker?.phoneNumber}</TableCell>
                                                            <TableCell className="text-right">{billCount}</TableCell>
                                                            <TableCell className="text-right font-bold text-lg">
                                                                {CURRENCY_SYMBOL}{salary.totalBills.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{wiremanTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>


                            {/* Warping Salaries */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Warping</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Based on beams produced - Total: {warpingSalaries.reduce((sum, s) => sum + s.totalBeams, 0)} beams in {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })})
                                    </span>
                                </h3>
                                {warpingSalaries.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No warping records for this cycle
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Warper Name</TableHead>
                                                    <TableHead className="text-right">Total Beams</TableHead>
                                                    <TableHead className="text-right">Total Takas</TableHead>
                                                    <TableHead className="text-right font-semibold">Total Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {warpingSalaries.map((salary) => (
                                                    <TableRow key={salary.warperName}>
                                                        <TableCell className="font-medium">{salary.warperName}</TableCell>
                                                        <TableCell className="text-right">{salary.totalBeams}</TableCell>
                                                        <TableCell className="text-right">{salary.totalTakas}</TableCell>
                                                        <TableCell className="text-right font-bold text-lg">
                                                            {CURRENCY_SYMBOL}{salary.totalAmount.toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{warpingTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Beam Pasar Salaries */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Badge variant="default">Beam Pasar</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        (Based on rate per beam - Total: {beamPasarSalaries.length} entries in {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })})
                                    </span>
                                </h3>
                                {beamPasarSalaries.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                                        No beam pasar records for this cycle
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Beam No</TableHead>
                                                    <TableHead>Quality</TableHead>
                                                    <TableHead className="text-right">Rate</TableHead>
                                                    <TableHead className="text-right font-semibold">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {beamPasarSalaries.map((salary) => {
                                                    const quality = qualities.find(q => q.id === salary.qualityId);
                                                    return (
                                                        <TableRow key={salary.id}>
                                                            <TableCell className="font-medium">{salary.date}</TableCell>
                                                            <TableCell>{salary.beamNo}</TableCell>
                                                            <TableCell>{quality?.name || 'N/A'}</TableCell>
                                                            <TableCell className="text-right">{CURRENCY_SYMBOL}{salary.ratePerBeam?.toFixed(2) || '0.00'}</TableCell>
                                                            <TableCell className="text-right font-bold text-lg">
                                                                {CURRENCY_SYMBOL}{salary.amount.toFixed(2)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow className="bg-muted/50 font-bold">
                                                    <TableCell colSpan={3}>Subtotal</TableCell>
                                                    <TableCell className="text-right text-lg">
                                                        {CURRENCY_SYMBOL}{beamPasarTotal.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            {/* Grand Total */}
                            <Card className="bg-primary/5 border-primary">
                                <CardContent className="pt-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold">Grand Total</h3>
                                            <p className="text-sm text-muted-foreground">
                                                All workers for {activeCycle} cycle
                                            </p>
                                        </div>
                                        <div className="text-4xl font-bold text-primary">
                                            {CURRENCY_SYMBOL}{grandTotal.toFixed(2)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div >
    );
}
