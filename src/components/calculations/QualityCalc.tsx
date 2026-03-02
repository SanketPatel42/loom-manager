import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ruler, Info, Sparkles, Target } from "lucide-react";

export default function QualityCalc() {
    const [gsm, setGsm] = useState<string>("");
    const [fabricWidth, setFabricWidth] = useState<string>("");
    const [result, setResult] = useState<{ grams: string; kg: string } | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const calculate = () => {
        if (gsm && fabricWidth) {
            const qualityGrams = (parseFloat(gsm) * parseFloat(fabricWidth) * 100) / 39.37;
            const qualityKg = qualityGrams / 1000;
            setIsAnimating(true);
            setResult({
                grams: qualityGrams.toFixed(2),
                kg: qualityKg.toFixed(2)
            });
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20 p-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-2xl" />
                </div>
                <div className="relative flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-500/20">
                        <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">100 Meter Quality Measurement</h3>
                        <p className="text-sm text-muted-foreground">
                            This calculator helps you determine the total weight of fabric for a 100-meter roll based on GSM and width specifications.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Calculator Card */}
            <Card className="overflow-hidden border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                            <Ruler className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <CardTitle>Quality Calculator</CardTitle>
                            <CardDescription>Calculate fabric weight for 100 meters</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Formula Display */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                        <Info className="h-5 w-5 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Formula</p>
                            <code className="text-sm font-mono font-semibold">
                                Quality (grams) = (GSM × Width × 100) / 39.37
                            </code>
                        </div>
                    </div>

                    {/* Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                                GSM (Grams per Square Meter)
                            </Label>
                            <Input
                                type="number"
                                value={gsm}
                                onChange={(e) => setGsm(e.target.value)}
                                placeholder="e.g., 120"
                                className="h-12 text-lg border-2 focus:border-amber-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                                Fabric Width (inches)
                            </Label>
                            <Input
                                type="number"
                                value={fabricWidth}
                                onChange={(e) => setFabricWidth(e.target.value)}
                                placeholder="e.g., 48"
                                className="h-12 text-lg border-2 focus:border-amber-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <Button
                        onClick={calculate}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Calculate Quality
                    </Button>

                    {/* Result Display */}
                    {result && (
                        <div className={`
                            relative overflow-hidden rounded-2xl 
                            bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20
                            border-2 border-amber-500/30
                            ${isAnimating ? 'animate-pulse' : ''}
                        `}>
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-yellow-500/5" />
                            <div className="relative p-6">
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-4 uppercase tracking-wider text-center">
                                    Weight for 100 Meters
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm">
                                        <p className="text-3xl font-bold text-foreground">{result.grams}</p>
                                        <p className="text-sm text-muted-foreground mt-1">grams</p>
                                    </div>
                                    <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur-sm">
                                        <p className="text-3xl font-bold text-foreground">{result.kg}</p>
                                        <p className="text-sm text-muted-foreground mt-1">kilograms</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
