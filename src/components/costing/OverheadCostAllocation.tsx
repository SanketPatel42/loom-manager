import { useState, useMemo, useEffect } from "react";
import { useQualities } from "@/hooks/useAsyncStorage";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Trash2, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { asyncStorage } from "@/lib/storage";
import type { OverheadEntry, MonthlyProduction, OverheadAllocation } from "@/types/overhead";

interface OverheadCostAllocationProps {
    yarnCostData: Array<{
        id: string;
        name: string;
        warpCost: number;
        weftCost: number;
        extraCostsTotal: number;
        warpWeight: number | null;
        weftWeight: number | null;
    }>;
    onAllocationsCalculated?: (allocations: OverheadAllocation[]) => void;
}

export default function OverheadCostAllocation({ yarnCostData, onAllocationsCalculated }: OverheadCostAllocationProps) {
    const { data: qualities } = useQualities();
    const { toast } = useToast();
    
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    const [overheadEntries, setOverheadEntries] = useState<OverheadEntry[]>([]);
    const [productionData, setProductionData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    // Load data for selected month
    useEffect(() => {
        loadMonthData();
    }, [selectedMonth]);

    const loadMonthData = async () => {
        try {
            setLoading(true);
            
            // Load overhead entries
            const allOverhead = await asyncStorage.getAll<OverheadEntry>('overhead_entries');
            const monthOverhead = allOverhead.filter(e => e.month === selectedMonth);
            setOverheadEntries(monthOverhead);
            
            // Load production data
            const allProduction = await asyncStorage.getAll<MonthlyProduction>('monthly_production');
            const monthProduction = allProduction.filter(p => p.month === selectedMonth);
            
            const prodMap: Record<string, number> = {};
            monthProduction.forEach(p => {
                prodMap[p.qualityId] = p.metersProduced;
            });
            setProductionData(prodMap);
        } catch (error) {
            console.error("Failed to load overhead data:", error);
            toast({
                title: "Error",
                description: "Failed to load overhead data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const totalOverhead = useMemo(() => {
        return overheadEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    }, [overheadEntries]);

    const totalProduction = useMemo(() => {
        return Object.values(productionData).reduce((sum, meters) => sum + (meters || 0), 0);
    }, [productionData]);

    const overheadAllocations = useMemo((): OverheadAllocation[] => {
        if (!qualities || totalProduction === 0) return [];

        return qualities.map(q => {
            const metersProduced = productionData[q.id] || 0;
            const sharePercentage = totalProduction > 0 ? (metersProduced / totalProduction) * 100 : 0;
            const allocatedOverhead = (sharePercentage / 100) * totalOverhead;
            const overheadPerMeter = metersProduced > 0 ? allocatedOverhead / metersProduced : 0;

            return {
                qualityId: q.id,
                qualityName: q.name,
                metersProduced,
                sharePercentage,
                allocatedOverhead,
                overheadPerMeter
            };
        });
    }, [qualities, productionData, totalProduction, totalOverhead]);

    // Notify parent of calculated allocations
    useMemo(() => {
        if (onAllocationsCalculated && overheadAllocations.length > 0) {
            onAllocationsCalculated(overheadAllocations);
        }
    }, [overheadAllocations, onAllocationsCalculated]);

    const handleAddOverhead = async () => {
        const newEntry: OverheadEntry = {
            id: `overhead-${Date.now()}`,
            month: selectedMonth,
            name: "New Overhead",
            amount: 0
        };

        try {
            await asyncStorage.upsert('overhead_entries', newEntry);
            setOverheadEntries(prev => [...prev, newEntry]);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add overhead entry",
                variant: "destructive"
            });
        }
    };

    const handleUpdateOverhead = async (id: string, field: 'name' | 'amount', value: string | number) => {
        const entry = overheadEntries.find(e => e.id === id);
        if (!entry) return;

        const updated = {
            ...entry,
            [field]: field === 'amount' ? (parseFloat(value as string) || 0) : value
        };

        try {
            await asyncStorage.upsert('overhead_entries', updated);
            setOverheadEntries(prev => prev.map(e => e.id === id ? updated : e));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update overhead entry",
                variant: "destructive"
            });
        }
    };

    const handleDeleteOverhead = async (id: string) => {
        try {
            await asyncStorage.deleteRecord('overhead_entries', id);
            setOverheadEntries(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete overhead entry",
                variant: "destructive"
            });
        }
    };

    const handleUpdateProduction = async (qualityId: string, meters: string) => {
        const metersValue = parseFloat(meters) || 0;
        
        const prodId = `prod-${selectedMonth}-${qualityId}`;
        const entry: MonthlyProduction = {
            id: prodId,
            month: selectedMonth,
            qualityId,
            metersProduced: metersValue
        };

        try {
            await asyncStorage.upsert('monthly_production', entry);
            setProductionData(prev => ({ ...prev, [qualityId]: metersValue }));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update production data",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading overhead data...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Section 1: Monthly Overhead Inputs */}
            <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/20">
                                <Building2 className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <CardTitle>Monthly Overhead Expenses</CardTitle>
                                <CardDescription>
                                    Enter all overhead costs for the selected month
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-40"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {overheadEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-3">
                                <Input
                                    value={entry.name}
                                    onChange={(e) => handleUpdateOverhead(entry.id, 'name', e.target.value)}
                                    placeholder="Overhead name (e.g., Electricity)"
                                    className="flex-1"
                                />
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground">₹</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={entry.amount}
                                        onChange={(e) => handleUpdateOverhead(entry.id, 'amount', e.target.value)}
                                        placeholder="0.00"
                                        className="w-40"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteOverhead(entry.id)}
                                    className="h-9 w-9 p-0"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        
                        <Button
                            onClick={handleAddOverhead}
                            variant="outline"
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Overhead Entry
                        </Button>

                        <div className="pt-4 border-t mt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Monthly Overhead:</span>
                                <span className="text-orange-600">₹{totalOverhead.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Production Input */}
            <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle>Production Data (Meters)</CardTitle>
                            <CardDescription>
                                Enter meters produced per quality for {selectedMonth}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {qualities?.map((quality) => (
                            <div key={quality.id} className="flex items-center gap-3">
                                <span className="font-medium w-32">{quality.name}</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={productionData[quality.id] || ''}
                                    onChange={(e) => handleUpdateProduction(quality.id, e.target.value)}
                                    placeholder="0"
                                    className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground w-16">meters</span>
                            </div>
                        ))}

                        <div className="pt-4 border-t mt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Production:</span>
                                <span className="text-blue-600">{totalProduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} meters</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Overhead Allocation Table */}
            <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle>Overhead Allocation by Quality</CardTitle>
                            <CardDescription>
                                Automatic distribution based on production share
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="text-center font-bold">Quality Name</TableHead>
                                    <TableHead className="text-center font-bold">Meters Produced</TableHead>
                                    <TableHead className="text-center font-bold">Share (%)</TableHead>
                                    <TableHead className="text-center font-bold">Allocated Overhead (₹)</TableHead>
                                    <TableHead className="text-center font-bold">Overhead/Meter (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overheadAllocations.map((allocation) => (
                                    <TableRow key={allocation.qualityId} className="hover:bg-primary/5">
                                        <TableCell className="font-medium text-center">{allocation.qualityName}</TableCell>
                                        <TableCell className="text-center font-mono">
                                            {allocation.metersProduced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-blue-600">
                                            {allocation.sharePercentage.toFixed(2)}%
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-orange-600">
                                            ₹{allocation.allocatedOverhead.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                ₹{allocation.overheadPerMeter.toFixed(2)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="p-4 bg-muted/30 border-t">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p>
                                    <strong>Allocation Logic:</strong> Each quality's overhead share is proportional to its production volume.
                                </p>
                                <p>
                                    <strong>Formula:</strong> Overhead/Meter = (Quality Meters ÷ Total Meters) × Total Overhead ÷ Quality Meters
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
