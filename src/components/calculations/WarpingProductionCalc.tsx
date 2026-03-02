import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, Info, Sparkles, Activity, Timer, Percent } from "lucide-react";

export default function WarpingProductionCalc() {
    const [headRPM, setHeadRPM] = useState<string>("");
    const [timeMinutes, setTimeMinutes] = useState<string>("");
    const [picksPerDm, setPicksPerDm] = useState<string>("");
    const [efficiency, setEfficiency] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [isAnimating, setIsAnimating] = useState(false);

    const calculate = () => {
        if (headRPM && timeMinutes && picksPerDm && efficiency) {
            const production = (parseFloat(headRPM) * parseFloat(timeMinutes) * parseFloat(picksPerDm) * (parseFloat(efficiency) / 100)) / (39.37 * 100 * 3.0);
            setIsAnimating(true);
            setResult(`${production.toFixed(2)} meters`);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    return (
        <div className="space-y-6">
            {/* Visual Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-blue-500/10 border border-sky-500/20 p-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-full blur-2xl" />
                </div>
                <div className="relative flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-sky-500/20">
                        <Zap className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">Warping Machine Production</h3>
                        <p className="text-sm text-muted-foreground">
                            Calculate the warping production output based on machine parameters and efficiency. Results are given in meters of warp beam produced.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20">
                    <Activity className="h-4 w-4 text-sky-500" />
                    <span className="text-xs font-medium">RPM Based</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20">
                    <Timer className="h-4 w-4 text-sky-500" />
                    <span className="text-xs font-medium">Time Tracking</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/20">
                    <Percent className="h-4 w-4 text-sky-500" />
                    <span className="text-xs font-medium">Efficiency Factor</span>
                </div>
            </div>

            {/* Main Calculator Card */}
            <Card className="overflow-hidden border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-blue-500/10 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500/20">
                            <Zap className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <CardTitle>Warping Production Calculator</CardTitle>
                            <CardDescription>Calculate output in meters</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Formula Display */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border border-sky-500/20">
                        <Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Formula</p>
                            <code className="text-xs font-mono font-semibold">
                                Production = (RPM × Time × Picks/dm × Efficiency%) / (39.37 × 100 × 3.0)
                            </code>
                        </div>
                    </div>

                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">1</span>
                                Head RPM
                            </Label>
                            <Input
                                type="number"
                                value={headRPM}
                                onChange={(e) => setHeadRPM(e.target.value)}
                                placeholder="e.g., 500"
                                className="h-11 border-2 focus:border-sky-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">2</span>
                                Time (minutes)
                            </Label>
                            <Input
                                type="number"
                                value={timeMinutes}
                                onChange={(e) => setTimeMinutes(e.target.value)}
                                placeholder="e.g., 720"
                                className="h-11 border-2 focus:border-sky-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">3</span>
                                Picks per Decimeter
                            </Label>
                            <Input
                                type="number"
                                value={picksPerDm}
                                onChange={(e) => setPicksPerDm(e.target.value)}
                                placeholder="e.g., 72"
                                className="h-11 border-2 focus:border-sky-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">4</span>
                                Efficiency (%)
                            </Label>
                            <Input
                                type="number"
                                value={efficiency}
                                onChange={(e) => setEfficiency(e.target.value)}
                                placeholder="e.g., 95"
                                className="h-11 border-2 focus:border-sky-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <Button
                        onClick={calculate}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Calculate Production
                    </Button>

                    {/* Result Display */}
                    {result && (
                        <div className={`
                            relative overflow-hidden p-6 rounded-2xl 
                            bg-gradient-to-br from-sky-500/20 via-indigo-500/15 to-blue-500/20
                            border-2 border-sky-500/30
                            ${isAnimating ? 'animate-pulse' : ''}
                        `}>
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-indigo-500/5" />
                            <div className="relative text-center">
                                <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mb-2 uppercase tracking-wider">
                                    Warping Production
                                </p>
                                <p className="text-4xl font-bold text-foreground tracking-tight">
                                    {result}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Warp beam length produced
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
