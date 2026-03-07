import { useState } from "react";
import { DollarSign, Sparkles, TrendingUp } from "lucide-react";
import QualityCostingTable from "@/components/costing/QualityCostingTable";
import OverheadCostAllocation from "@/components/costing/OverheadCostAllocation";
import GrandTotalSummary from "@/components/costing/GrandTotalSummary";
import type { OverheadAllocation } from "@/types/overhead";

export default function Costing() {
    const [yarnCostData, setYarnCostData] = useState<Array<{
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
    }>>([]);

    const [overheadAllocations, setOverheadAllocations] = useState<OverheadAllocation[]>([]);

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/10 p-8">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-br from-green-500/10 to-lime-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 shadow-xl shadow-emerald-500/5 border border-emerald-500/10">
                        <DollarSign className="h-10 w-10 text-emerald-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                                Quality Costing
                            </h1>
                            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                        </div>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Complete production cost analysis including yarn, overhead, and extra expenses
                        </p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="relative mt-6 pt-6 border-t border-emerald-500/10 flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Real-time</span> Cost Calculations
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">
                            Yarn & Overhead Costing
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <span className="text-sm text-muted-foreground">
                            Monthly Tracking
                        </span>
                    </div>
                </div>
            </div>

            {/* Yarn Costing Table */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <QualityCostingTable onDataCalculated={setYarnCostData} />
            </div>

            {/* Overhead Cost Allocation */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold tracking-tight">Overhead Cost Allocation</h2>
                    <p className="text-muted-foreground">
                        Distribute monthly overhead expenses across qualities based on production volume
                    </p>
                </div>
                <OverheadCostAllocation 
                    yarnCostData={yarnCostData}
                    onAllocationsCalculated={setOverheadAllocations}
                />
            </div>

            {/* Grand Total Summary */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <GrandTotalSummary 
                    yarnCostData={yarnCostData}
                    overheadAllocations={overheadAllocations}
                />
            </div>

            {/* Tips section */}
            <div className="rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Complete Costing Workflow</h3>
                        <p className="text-sm text-muted-foreground">
                            1. Enter yarn purchase rates in the first section
                            2. Add monthly overhead expenses (electricity, rent, etc.)
                            3. Input production volumes per quality
                            4. Review the grand total cost per meter for pricing decisions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
