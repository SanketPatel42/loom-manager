import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { OverheadAllocation } from "@/types/overhead";

interface GrandTotalSummaryProps {
    yarnCostData: Array<{
        id: string;
        name: string;
        warpWeight: number | null;
        weftWeight: number | null;
        warpCost: number;
        weftCost: number;
        extraCostsTotal: number;
    }>;
    overheadAllocations: OverheadAllocation[];
}

export default function GrandTotalSummary({ yarnCostData, overheadAllocations }: GrandTotalSummaryProps) {
    const summaryData = useMemo(() => {
        return yarnCostData.map(yarn => {
            const overhead = overheadAllocations.find(o => o.qualityId === yarn.id);
            
            // Calculate per-meter costs (yarn costs are per 100m, so divide by 100)
            const warpCostPerMeter = yarn.warpCost / 100;
            const weftCostPerMeter = yarn.weftCost / 100;
            const extraCostPerMeter = yarn.extraCostsTotal / 100;
            const overheadPerMeter = overhead?.overheadPerMeter || 0;
            
            const grandTotal = warpCostPerMeter + weftCostPerMeter + extraCostPerMeter + overheadPerMeter;

            return {
                id: yarn.id,
                name: yarn.name,
                warpCostPerMeter,
                weftCostPerMeter,
                extraCostPerMeter,
                overheadPerMeter,
                grandTotal
            };
        });
    }, [yarnCostData, overheadAllocations]);

    return (
        <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle>Grand Total Cost Summary</CardTitle>
                        <CardDescription>
                            Complete cost breakdown per meter for all qualities
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
                                <TableHead className="text-center font-bold">Warp Yarn/m</TableHead>
                                <TableHead className="text-center font-bold">Weft Yarn/m</TableHead>
                                <TableHead className="text-center font-bold">Extra Costs/m</TableHead>
                                <TableHead className="text-center font-bold">Overhead/m</TableHead>
                                <TableHead className="text-center font-bold text-lg">✅ Grand Total/m</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summaryData.map((data) => (
                                <TableRow key={data.id} className="hover:bg-primary/5">
                                    <TableCell className="font-bold text-center text-base">{data.name}</TableCell>
                                    <TableCell className="text-center font-mono text-blue-600">
                                        ₹{data.warpCostPerMeter.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-teal-600">
                                        ₹{data.weftCostPerMeter.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-amber-600">
                                        ₹{data.extraCostPerMeter.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-purple-600">
                                        ₹{data.overheadPerMeter.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-base font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-md">
                                            ₹{data.grandTotal.toFixed(2)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-transparent border-t">
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground">
                            💡 This is your complete production cost per meter including all expenses
                        </p>
                        <p>
                            Use these figures for pricing decisions, profit margin calculations, and cost optimization analysis.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
