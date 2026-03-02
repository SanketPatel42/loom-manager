import { useMemo } from "react";
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
import { Calculator, Info, Ruler, Scale } from "lucide-react";

export default function CalculatedQualitiesTable() {
    const { data: qualities, loading } = useQualities();

    const parseDenier = (denierStr: string | undefined): number | null => {
        if (!denierStr) return null;
        // Try to extract the first number (e.g., "80/1" -> 80, "150" -> 150)
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

            // 1. Warp Weight (kg per 100 meters)
            // Formula: (Denier * 100 * Tars) / 9,000,000
            let warpWeight100m = null;
            if (denier && tars) {
                warpWeight100m = (denier * 100 * tars) / 9000000;
            }

            // 2. Estimate Width (inches)
            // Formula: Tars / EPI
            let estimatedWidth = null;
            if (tars && epi) {
                estimatedWidth = tars / epi;
            }

            // 3. Weft Weight (kg per 100 meters)
            // Formula: (Estimated Width (in) * PPI * 100) * Denier / 9,000,000
            let weftWeight100m = null;
            if (estimatedWidth && ppi && denier) {
                weftWeight100m = (estimatedWidth * ppi * 100 * denier) / 9000000;
            }

            // 4. Total Weight (kg per 100 meters)
            let totalWeight100m = null;
            if (warpWeight100m !== null && weftWeight100m !== null) {
                totalWeight100m = warpWeight100m + weftWeight100m;
            }

            // 5. GSM
            // Formula: (Total Weight in grams) / (Width in meters * 100 meters)
            // Total Weight in grams = totalWeight100m * 1000
            // Width in meters = estimatedWidth * 0.0254
            let gsm = null;
            if (totalWeight100m && estimatedWidth) {
                const totalGrams = totalWeight100m * 1000;
                const area = (estimatedWidth * 0.0254) * 100;
                gsm = totalGrams / area;
            }

            return {
                id: q.id,
                name: q.name,
                epi: q.epi,
                ppi: q.ppi,
                danier: q.danier,
                tars: q.tars,
                width: estimatedWidth?.toFixed(2),
                warpWeight: warpWeight100m?.toFixed(3),
                weftWeight: weftWeight100m?.toFixed(3),
                totalWeight: totalWeight100m?.toFixed(3),
                gsm: gsm?.toFixed(2)
            };
        });
    }, [qualities]);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading qualities...</div>;
    }

    if (!qualities || qualities.length === 0) {
        return null;
    }

    return (
        <Card className="mt-8 border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                        <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Automatic Quality Calculations</CardTitle>
                        <CardDescription>
                            Calculated estimates for all qualities based on saved specifications (100-meter basis)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                <TableHead className="font-bold">Quality Name</TableHead>
                                <TableHead className="text-center font-bold">Details (E/P/D)</TableHead>
                                <TableHead className="text-center font-bold">Est. Width (in)</TableHead>
                                <TableHead className="text-center font-bold">Warp Wt (kg)</TableHead>
                                <TableHead className="text-center font-bold">Weft Wt (kg)</TableHead>
                                <TableHead className="text-center font-bold">Total Wt (kg)</TableHead>
                                <TableHead className="text-center font-bold">GSM</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calculatedData.map((data) => (
                                <TableRow key={data.id} className="hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-medium">{data.name}</TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">
                                        {data.epi}/{data.ppi} | {data.danier}D
                                    </TableCell>
                                    <TableCell className="text-center font-mono">{data.width || "-"}</TableCell>
                                    <TableCell className="text-center font-mono text-blue-600 dark:text-blue-400">
                                        {data.warpWeight || "-"}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-teal-600 dark:text-teal-400">
                                        {data.weftWeight || "-"}
                                    </TableCell>
                                    <TableCell className="text-center font-bold font-mono">
                                        {data.totalWeight || "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {data.gsm ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                {data.gsm}
                                            </span>
                                        ) : "-"}
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
                                <strong>Assumptions:</strong> Calculations assume standard filament yarn properties.
                                Width is estimated as <em>Tars / EPI</em>.
                                Weights are for 100 meters of finished fabric.
                            </p>
                            <p>
                                Formulas: Warp = (D * 100 * Tars) / 9M | Weft = (Width * PPI * 100 * D) / 9M
                            </p>

                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
