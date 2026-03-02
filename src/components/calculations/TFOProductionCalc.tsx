import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cog, Info, Sparkles, Gauge, Clock, Layers } from "lucide-react";

export default function TFOProductionCalc() {
    const [spindleRPM, setSpindleRPM] = useState<string>("");
    const [workingHours, setWorkingHours] = useState<string>("");
    const [denier, setDenier] = useState<string>("");
    const [totalSpindles, setTotalSpindles] = useState<string>("");
    const [tpm, setTpm] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [isAnimating, setIsAnimating] = useState(false);

    const calculate = () => {
        if (spindleRPM && workingHours && denier && totalSpindles && tpm) {
            const production = 2 * ((parseFloat(spindleRPM) * parseFloat(workingHours) * 60 * parseFloat(denier) * parseFloat(totalSpindles)) / (parseFloat(tpm) * 9000 * 1000));
            setIsAnimating(true);
            setResult(`${production.toFixed(2)} kg`);
            setTimeout(() => setIsAnimating(false), 600);
        }
    };

    return (
        <div className="space-y-6">
            {/* Visual Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-red-500/10 border border-rose-500/20 p-6">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-full blur-2xl" />
                </div>
                <div className="relative flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-rose-500/20 animate-pulse">
                        <Cog className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-1">T.F.O. Machine Production</h3>
                        <p className="text-sm text-muted-foreground">
                            Two-for-One Twisting machine production calculation. The factor of 2 accounts for the double twist per revolution characteristic of TFO machines.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Calculator Card */}
            <Card className="overflow-hidden border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-red-500/10 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-500/20">
                            <Cog className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <CardTitle>TFO Production Calculator</CardTitle>
                            <CardDescription>Calculate yarn production output in kilograms</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Formula Display */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-rose-500/5 to-pink-500/5 border border-rose-500/20">
                        <Info className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Formula</p>
                            <code className="text-xs font-mono font-semibold block">
                                Production = 2 × [(RPM × Hours × 60 × Denier × Spindles) / (TPM × 9000 × 1000)]
                            </code>
                            <p className="text-xs text-muted-foreground mt-2 italic">
                                Factor 2 accounts for two twists per revolution
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                            <Gauge className="h-4 w-4 text-rose-500" />
                            <span className="text-xs text-muted-foreground">RPM Based</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                            <Clock className="h-4 w-4 text-rose-500" />
                            <span className="text-xs text-muted-foreground">Time Based</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                            <Layers className="h-4 w-4 text-rose-500" />
                            <span className="text-xs text-muted-foreground">Multi-Spindle</span>
                        </div>
                    </div>

                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">1</span>
                                Spindle RPM
                            </Label>
                            <Input
                                type="number"
                                value={spindleRPM}
                                onChange={(e) => setSpindleRPM(e.target.value)}
                                placeholder="e.g., 9000"
                                className="h-11 border-2 focus:border-rose-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">2</span>
                                Working Time (hours)
                            </Label>
                            <Input
                                type="number"
                                value={workingHours}
                                onChange={(e) => setWorkingHours(e.target.value)}
                                placeholder="e.g., 24"
                                className="h-11 border-2 focus:border-rose-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">3</span>
                                Denier
                            </Label>
                            <Input
                                type="number"
                                value={denier}
                                onChange={(e) => setDenier(e.target.value)}
                                placeholder="e.g., 70"
                                className="h-11 border-2 focus:border-rose-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">4</span>
                                Total Spindles
                            </Label>
                            <Input
                                type="number"
                                value={totalSpindles}
                                onChange={(e) => setTotalSpindles(e.target.value)}
                                placeholder="e.g., 440"
                                className="h-11 border-2 focus:border-rose-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">5</span>
                                TPM (Twists Per Meter)
                            </Label>
                            <Input
                                type="number"
                                value={tpm}
                                onChange={(e) => setTpm(e.target.value)}
                                placeholder="e.g., 2000"
                                className="h-11 border-2 focus:border-rose-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Calculate Button */}
                    <Button
                        onClick={calculate}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/30"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Calculate Production
                    </Button>

                    {/* Result Display */}
                    {result && (
                        <div className={`
                            relative overflow-hidden p-6 rounded-2xl 
                            bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-red-500/20
                            border-2 border-rose-500/30
                            ${isAnimating ? 'animate-pulse' : ''}
                        `}>
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-pink-500/5" />
                            <div className="relative text-center">
                                <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-2 uppercase tracking-wider">
                                    Production Output
                                </p>
                                <p className="text-4xl font-bold text-foreground tracking-tight">
                                    {result}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Total yarn production
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
