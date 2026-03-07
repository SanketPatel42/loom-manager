import { useMemo, useState } from "react";
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
import { DollarSign, Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { asyncStorage } from "@/lib/storage";
import type { QualityCosting, ExtraCost } from "@/types/costing";

interface QualityCostingTableProps {
    onDataCalculated?: (data: Array<{
        id: string;
        name: string;
        warpWeight: number | null;
        weftWeight: number | null;
        warpCost: number;
        weftCost: number;
        totalYarnCost: number;
        extraCostsTotal: number;
        grandTotal: number;
        costPerMeter: number;
    }>) => void;
}

export default function QualityCostingTable({ onDataCalculated }: QualityCostingTableProps) {
    const { data: qualities, loading } = useQualities();
    const { toast } = useToast();
    const [costingData, setCostingData] = useState<Record<string, QualityCosting>>({});
    const [loadingCosting, setLoadingCosting] = useState(true);

    // Load costing data
    useMemo(() => {
        const loadCostingData = async () => {
            try {
                const data = await asyncStorage.getAll<QualityCosting>('quality_costing');
                const mapped = data.reduce((acc, item) => {
                    acc[item.qualityId] = item;
                    return acc;
                }, {} as Record<string, QualityCosting>);
                setCostingData(mapped);
            } catch (error) {
                console.error("Failed to load costing data:", error);
            } finally {
                setLoadingCosting(false);
            }
        };
        loadCostingData();
    }, []);

    const parseDenier = (denierStr: string | undefined): number | null => {
        if (!denierStr) return null;
        const match = denierStr.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
    };

    const calculatedData = useMemo(() => {
        if (!qualities) return [];

        return qualities.map(q => {
            const denier = parseDenier(q.danier);
            const epi = q.epi || 0;
            const ppi = q.ppi || 0;
            const tars = q.tars || 0;

            // Calculate weights (same as CalculatedQualitiesTable)
            let warpWeight100m = null;
            if (denier && tars) {
                warpWeight100m = (denier * 100 * tars) / 9000000;
            }

            let estimatedWidth = null;
            if (tars && epi) {
                estimatedWidth = tars / epi;
            }

            let weftWeight100m = null;
            if (estimatedWidth && ppi && denier) {
                weftWeight100m = (estimatedWidth * ppi * 100 * denier) / 9000000;
            }

            // Get costing data for this quality
            const costing = costingData[q.id] || {
                id: q.id,
                qualityId: q.id,
                warpRate: 0,
                weftRate: 0,
                extraCosts: []
            };

            // Calculate costs
            const warpCost = warpWeight100m && costing.warpRate ? warpWeight100m * costing.warpRate : 0;
            const weftCost = weftWeight100m && costing.weftRate ? weftWeight100m * costing.weftRate : 0;
            const totalYarnCost = warpCost + weftCost;
            
            const extraCostsTotal = costing.extraCosts.reduce((sum, ec) => sum + (ec.amount || 0), 0);
            const grandTotal = totalYarnCost + extraCostsTotal;
            const costPerMeter = grandTotal / 100;

            return {
                id: q.id,
                name: q.name,
                epi: q.epi,
                ppi: q.ppi,
                danier: q.danier,
                tars: q.tars,
                warpWeight: warpWeight100m,
                weftWeight: weftWeight100m,
                warpRate: costing.warpRate,
                weftRate: costing.weftRate,
                warpCost,
                weftCost,
                totalYarnCost,
                extraCosts: costing.extraCosts,
                extraCostsTotal,
                grandTotal,
                costPerMeter
            };
        });
    }, [qualities, costingData]);

    // Notify parent of calculated data
    useMemo(() => {
        if (onDataCalculated && calculatedData.length > 0) {
            onDataCalculated(calculatedData);
        }
    }, [calculatedData, onDataCalculated]);

    const handleRateChange = async (qualityId: string, field: 'warpRate' | 'weftRate', value: string) => {
        const numValue = parseFloat(value) || 0;
        
        const existing = costingData[qualityId] || {
            id: qualityId,
            qualityId,
            warpRate: 0,
            weftRate: 0,
            extraCosts: []
        };

        const updated = { ...existing, [field]: numValue };
        
        try {
            await asyncStorage.upsert('quality_costing', updated);
            setCostingData(prev => ({ ...prev, [qualityId]: updated }));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save rate",
                variant: "destructive"
            });
        }
    };

    const handleAddExtraCost = async (qualityId: string) => {
        const existing = costingData[qualityId] || {
            id: qualityId,
            qualityId,
            warpRate: 0,
            weftRate: 0,
            extraCosts: []
        };

        const updated = {
            ...existing,
            extraCosts: [...existing.extraCosts, { label: "New Cost", amount: 0 }]
        };

        try {
            await asyncStorage.upsert('quality_costing', updated);
            setCostingData(prev => ({ ...prev, [qualityId]: updated }));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add extra cost",
                variant: "destructive"
            });
        }
    };

    const handleUpdateExtraCost = async (qualityId: string, index: number, field: 'label' | 'amount', value: string | number) => {
        const existing = costingData[qualityId];
        if (!existing) return;

        const updated = {
            ...existing,
            extraCosts: existing.extraCosts.map((ec, i) => 
                i === index ? { ...ec, [field]: field === 'amount' ? (parseFloat(value as string) || 0) : value } : ec
            )
        };

        try {
            await asyncStorage.upsert('quality_costing', updated);
            setCostingData(prev => ({ ...prev, [qualityId]: updated }));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update extra cost",
                variant: "destructive"
            });
        }
    };

    const handleRemoveExtraCost = async (qualityId: string, index: number) => {
        const existing = costingData[qualityId];
        if (!existing) return;

        const updated = {
            ...existing,
            extraCosts: existing.extraCosts.filter((_, i) => i !== index)
        };

        try {
            await asyncStorage.upsert('quality_costing', updated);
            setCostingData(prev => ({ ...prev, [qualityId]: updated }));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove extra cost",
                variant: "destructive"
            });
        }
    };

    if (loading || loadingCosting) {
        return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }

    if (!qualities || qualities.length === 0) {
        return (
            <Card className="mt-8">
                <CardContent className="p-8 text-center text-muted-foreground">
                    No qualities found. Please add qualities first to calculate costing.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-8 border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle>Quality Costing Analysis</CardTitle>
                        <CardDescription>
                            Calculate yarn costs per 100 meters based on warp/weft weights and purchase rates
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="text-center font-bold">Quality</TableHead>
                                <TableHead className="text-center font-bold">Details</TableHead>
                                <TableHead className="text-center font-bold">Warp Wt (kg)</TableHead>
                                <TableHead className="text-center font-bold">Weft Wt (kg)</TableHead>
                                <TableHead className="text-center font-bold">Warp Rate (₹/kg)</TableHead>
                                <TableHead className="text-center font-bold">Weft Rate (₹/kg)</TableHead>
                                <TableHead className="text-center font-bold">Warp Cost</TableHead>
                                <TableHead className="text-center font-bold">Weft Cost</TableHead>
                                <TableHead className="text-center font-bold">Yarn Cost (100m)</TableHead>
                                <TableHead className="text-center font-bold">Extra Costs</TableHead>
                                <TableHead className="text-center font-bold">Grand Total</TableHead>
                                <TableHead className="text-center font-bold">Cost/Meter</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calculatedData.map((data) => (
                                <>
                                    <TableRow key={data.id} className="hover:bg-primary/5 transition-colors">
                                        <TableCell className="font-medium text-center">{data.name}</TableCell>
                                        <TableCell className="text-center text-xs text-muted-foreground">
                                            {data.epi}/{data.ppi} | {data.danier}D
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-blue-600 dark:text-blue-400">
                                            {data.warpWeight?.toFixed(3) || "-"}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-teal-600 dark:text-teal-400">
                                            {data.weftWeight?.toFixed(3) || "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.warpRate}
                                                onChange={(e) => handleRateChange(data.id, 'warpRate', e.target.value)}
                                                className="w-24 h-8 text-center"
                                                placeholder="0.00"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={data.weftRate}
                                                onChange={(e) => handleRateChange(data.id, 'weftRate', e.target.value)}
                                                className="w-24 h-8 text-center"
                                                placeholder="0.00"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-blue-600">
                                            ₹{data.warpCost.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-teal-600">
                                            ₹{data.weftCost.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center font-bold font-mono">
                                            ₹{data.totalYarnCost.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAddExtraCost(data.id)}
                                                className="h-7 text-xs"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center font-bold font-mono text-emerald-600">
                                            ₹{data.grandTotal.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                ₹{data.costPerMeter.toFixed(2)}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                    {data.extraCosts.length > 0 && (
                                        <TableRow key={`${data.id}-extra`} className="bg-muted/30">
                                            <TableCell colSpan={9} className="py-2">
                                                <div className="space-y-2 px-4">
                                                    {data.extraCosts.map((ec, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <Input
                                                                value={ec.label}
                                                                onChange={(e) => handleUpdateExtraCost(data.id, idx, 'label', e.target.value)}
                                                                className="h-7 text-xs flex-1"
                                                                placeholder="Cost label"
                                                            />
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={ec.amount}
                                                                onChange={(e) => handleUpdateExtraCost(data.id, idx, 'amount', e.target.value)}
                                                                className="h-7 text-xs w-32"
                                                                placeholder="0.00"
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveExtraCost(data.id, idx)}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell colSpan={3} className="text-center font-mono text-sm">
                                                Extra: ₹{data.extraCostsTotal.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 bg-muted/30 border-t">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p>
                                <strong>Costing Basis:</strong> All costs calculated for 100 meters of fabric.
                                Warp/Weft weights from automatic quality calculations.
                            </p>
                            <p>
                                <strong>Formulas:</strong> Warp Cost = Warp Wt × Warp Rate | Weft Cost = Weft Wt × Weft Rate | Cost/Meter = Grand Total / 100
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                                💡 Add extra costs (Processing, Dyeing, Overhead) using the "Add" button for comprehensive costing.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
