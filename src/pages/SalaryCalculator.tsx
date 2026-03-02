import { useState, useEffect } from "react";
import { storage } from "@/lib/localStorage";
import type { WorkerProfile, Quality } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, TrendingUp, ChevronDown, ChevronRight, AlertTriangle, Search, ArrowUpDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import { calculateSalaries, WorkerSalary } from "@/utils/salaryUtils";
import { APP_CONSTANTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const { MACHINES_PER_SHEET, TOTAL_SHEETS, CURRENCY_SYMBOL } = APP_CONSTANTS;

export default function SalaryCalculator() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [salaryData, setSalaryData] = useState<WorkerSalary[]>([]);
  const [activeCycle, setActiveCycle] = useState<'1-15' | '16-30'>('1-15');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof WorkerSalary | 'sheetsCount', direction: 'asc' | 'desc' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleRow = (workerId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(workerId)) {
      newExpanded.delete(workerId);
    } else {
      newExpanded.add(workerId);
    }
    setExpandedRows(newExpanded);
  };

  useEffect(() => {
    loadData();
  }, [activeCycle]); // Reload when cycle changes

  const loadData = () => {
    setIsLoading(true);
    // Simulate a small delay for better UX (so the user sees the loading state comfortably)
    setTimeout(() => {
      console.log('=== SalaryCalculator: Loading Data ===');
      console.log('Active Cycle:', activeCycle);
      const workerProfiles = storage.getWorkerProfiles();
      const qualityData = storage.getQualities();
      const sheetData = storage.getWorkerSheetData();

      console.log('Worker Profiles:', workerProfiles.length);
      console.log('Quality Data:', qualityData.length);
      console.log('Sheet Data:', sheetData);

      setWorkers(workerProfiles);
      setQualities(qualityData);

      if (sheetData) {
        console.log('Calculating salaries for cycle:', activeCycle);
        const calculatedSalaries = calculateSalaries(sheetData, workerProfiles, qualityData, activeCycle);
        setSalaryData(calculatedSalaries);
      } else {
        console.log('No sheet data found!');
        setSalaryData([]);
      }
      setIsLoading(false);
    }, 500);
  };

  // Local calculateSalaries removed. Using utility function.

  // Sorting and Filtering Logic
  const handleSort = (key: keyof WorkerSalary | 'sheetsCount') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredSalaries = salaryData
    .filter(salary =>
      salary.workerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;

      let valA: any = a[key as keyof WorkerSalary];
      let valB: any = b[key as keyof WorkerSalary];

      if (key === 'sheetsCount') {
        valA = a.sheets.length;
        valB = b.sheets.length;
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPayout = filteredSalaries.reduce((sum, s) => sum + s.totalSalary, 0);
  const totalWorkers = filteredSalaries.length;

  // Detect workers with excessive machine assignments
  const workersWithTooManySheets = filteredSalaries.filter(s => s.sheets.length > 2);

  console.log('Displaying salaries:', { totalWorkers, totalPayout, filteredSalaries });

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Salary Calculator</h1>
        <p className="text-muted-foreground">
          Calculate worker wages based on quality rates and daily production averages
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
            <p className="text-xs text-muted-foreground">Active in {activeCycle} cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : `${CURRENCY_SYMBOL}${totalPayout.toFixed(2)}`}</div>
            <p className="text-xs text-muted-foreground">For {activeCycle} cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Worker</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `${CURRENCY_SYMBOL}${totalWorkers > 0 ? (totalPayout / totalWorkers).toFixed(2) : '0.00'}`}
            </div>
            <p className="text-xs text-muted-foreground">15-day average</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Salary Breakdown</CardTitle>
          <CardDescription>Detailed salary calculations per cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCycle} onValueChange={(v) => setActiveCycle(v as '1-15' | '16-30')}>
            <div className="flex md:flex-row flex-col gap-4 justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="1-15">Days 1-15</TabsTrigger>
                <TabsTrigger value="16-30">Days 16-30</TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <TabsContent value="1-15" className="space-y-4">
              {/* Warning for workers with too many sheets */}
              {workersWithTooManySheets.length > 0 && (
                <Alert variant="destructive" className="mb-4">
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

              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : filteredSalaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No salary data available for Days 1-15 cycle
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] cursor-pointer hover:bg-muted/50" onClick={() => handleSort('workerName')}>
                          <div className="flex items-center gap-1">
                            Worker Name {sortConfig?.key === 'workerName' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('sheetsCount')}>
                          <div className="flex items-center gap-1">
                            Sheets Assigned {sortConfig?.key === 'sheetsCount' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalDaySalary')}>
                          <div className="flex items-center justify-end gap-1">
                            Day Shift {sortConfig?.key === 'totalDaySalary' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalNightSalary')}>
                          <div className="flex items-center justify-end gap-1">
                            Night Shift {sortConfig?.key === 'totalNightSalary' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalSalary')}>
                          <div className="flex items-center justify-end gap-1">
                            Total Salary {sortConfig?.key === 'totalSalary' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalaries.map((salary) => (
                        <>
                          <TableRow key={salary.workerId} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(salary.workerId)}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                  {expandedRows.has(salary.workerId) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                {salary.workerName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 items-center">
                                {salary.sheets.map((sheet) => {
                                  // Format active days string
                                  let dayStr = "";
                                  if (sheet.activeDays && sheet.activeDays.length > 0) {
                                    const days = sheet.activeDays;
                                    // Check if consecutive
                                    let isConsecutive = true;
                                    for (let i = 0; i < days.length - 1; i++) {
                                      if (days[i + 1] !== days[i] + 1) {
                                        isConsecutive = false;
                                        break;
                                      }
                                    }

                                    if (isConsecutive && days.length > 1) {
                                      dayStr = `Days ${days[0]}-${days[days.length - 1]}`;
                                    } else {
                                      dayStr = `Days ${days.join(', ')}`;
                                    }
                                  }

                                  return (
                                    <Badge
                                      key={sheet.sheetNum}
                                      variant={salary.sheets.length > 2 ? "destructive" : "secondary"}
                                      className="text-xs"
                                      title={dayStr}
                                    >
                                      S{sheet.sheetNum} ({dayStr || sheet.machines})
                                    </Badge>
                                  )
                                })}
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({salary.sheets.length * 12} machines total)
                                  {salary.sheets.length > 2 && (
                                    <span className="text-destructive font-semibold ml-1">⚠️</span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {CURRENCY_SYMBOL}{salary.totalDaySalary.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {CURRENCY_SYMBOL}{salary.totalNightSalary.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              {CURRENCY_SYMBOL}{salary.totalSalary.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(salary.workerId) && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={5} className="p-4">
                                <div className="rounded-md border bg-background p-4">
                                  <h4 className="mb-2 font-semibold text-sm">Quality-wise Breakdown</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Quality Name</TableHead>
                                        <TableHead className="text-right">Rate / Meter</TableHead>
                                        <TableHead className="text-right">Total Meters</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {salary.qualityBreakdown.map((item, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell>{item.qualityName}</TableCell>
                                          <TableCell className="text-right">{CURRENCY_SYMBOL}{item.rate.toFixed(2)}</TableCell>
                                          <TableCell className="text-right">{item.totalMeters.toFixed(2)} m</TableCell>
                                          <TableCell className="text-right font-medium">{CURRENCY_SYMBOL}{item.totalAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow className="bg-muted/50 font-medium">
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell className="text-right">
                                          {CURRENCY_SYMBOL}{salary.qualityBreakdown.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total Payout</TableCell>
                        <TableCell className="text-right">
                          {CURRENCY_SYMBOL}{filteredSalaries.reduce((sum, s) => sum + s.totalDaySalary, 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {CURRENCY_SYMBOL}{filteredSalaries.reduce((sum, s) => sum + s.totalNightSalary, 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-lg">
                          {CURRENCY_SYMBOL}{totalPayout.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="16-30" className="space-y-4">
              {/* Warning for workers with too many sheets */}
              {workersWithTooManySheets.length > 0 && (
                <Alert variant="destructive" className="mb-4">
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

              {filteredSalaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No salary data available for Days 16-30 cycle
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] cursor-pointer hover:bg-muted/50" onClick={() => handleSort('workerName')}>
                          <div className="flex items-center gap-1">
                            Worker Name {sortConfig?.key === 'workerName' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('sheetsCount')}>
                          <div className="flex items-center gap-1">
                            Sheets Assigned {sortConfig?.key === 'sheetsCount' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalDaySalary')}>
                          <div className="flex items-center justify-end gap-1">
                            Day Shift {sortConfig?.key === 'totalDaySalary' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalNightSalary')}>
                          <div className="flex items-center justify-end gap-1">
                            Night Shift {sortConfig?.key === 'totalNightSalary' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold cursor-pointer hover:bg-muted/50" onClick={() => handleSort('totalSalary')}>
                          <div className="flex items-center justify-end gap-1">
                            Total Salary {sortConfig?.key === 'totalSalary' && <ArrowUpDown className="h-3 w-3" />}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalaries.map((salary) => (
                        <>
                          <TableRow key={salary.workerId} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(salary.workerId)}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                  {expandedRows.has(salary.workerId) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                {salary.workerName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 items-center">
                                {salary.sheets.map((sheet) => {
                                  // Format active days string
                                  let dayStr = "";
                                  if (sheet.activeDays && sheet.activeDays.length > 0) {
                                    const days = sheet.activeDays;
                                    // Check if consecutive
                                    let isConsecutive = true;
                                    for (let i = 0; i < days.length - 1; i++) {
                                      if (days[i + 1] !== days[i] + 1) {
                                        isConsecutive = false;
                                        break;
                                      }
                                    }

                                    if (isConsecutive && days.length > 1) {
                                      dayStr = `Days ${days[0]}-${days[days.length - 1]}`;
                                    } else {
                                      dayStr = `Days ${days.join(', ')}`;
                                    }
                                  }

                                  return (
                                    <Badge
                                      key={sheet.sheetNum}
                                      variant={salary.sheets.length > 2 ? "destructive" : "secondary"}
                                      className="text-xs"
                                      title={dayStr}
                                    >
                                      S{sheet.sheetNum} ({dayStr || sheet.machines})
                                    </Badge>
                                  )
                                })}
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({salary.sheets.length * 12} machines total)
                                  {salary.sheets.length > 2 && (
                                    <span className="text-destructive font-semibold ml-1">⚠️</span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{salary.totalDaySalary.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{salary.totalNightSalary.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              ₹{salary.totalSalary.toFixed(2)}
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(salary.workerId) && (
                            <TableRow className="bg-muted/30">
                              <TableCell colSpan={5} className="p-4">
                                <div className="rounded-md border bg-background p-4">
                                  <h4 className="mb-2 font-semibold text-sm">Quality-wise Breakdown</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Quality Name</TableHead>
                                        <TableHead className="text-right">Rate / Meter</TableHead>
                                        <TableHead className="text-right">Total Meters</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {salary.qualityBreakdown.map((item, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell>{item.qualityName}</TableCell>
                                          <TableCell className="text-right">₹{item.rate.toFixed(2)}</TableCell>
                                          <TableCell className="text-right">{item.totalMeters.toFixed(2)} m</TableCell>
                                          <TableCell className="text-right font-medium">₹{item.totalAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow className="bg-muted/50 font-medium">
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell className="text-right">
                                          ₹{salary.qualityBreakdown.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total Payout</TableCell>
                        <TableCell className="text-right">
                          ₹{filteredSalaries.reduce((sum, s) => sum + s.totalDaySalary, 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{filteredSalaries.reduce((sum, s) => sum + s.totalNightSalary, 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-lg">
                          ₹{totalPayout.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
