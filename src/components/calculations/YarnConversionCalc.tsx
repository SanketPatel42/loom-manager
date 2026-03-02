import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Info, CheckCircle2, Sparkles } from "lucide-react";

export default function YarnConversionCalc() {
    const [calcType, setCalcType] = useState<string>("denier-to-count");
    const [denier, setDenier] = useState<string>("");
    const [count, setCount] = useState<string>("");
    const [coneWeightGrams, setConeWeightGrams] = useState<string>("");
    const [coneWeightKg, setConeWeightKg] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [isAnimating, setIsAnimating] = useState(false);

    const calculate = () => {
        let res = 0;
        let unit = "";

        if (calcType === "denier-to-count" && denier) {
            res = 5315 / parseFloat(denier);
            unit = "Count";
        } else if (calcType === "count-to-denier" && count) {
            res = 5315 / parseFloat(count);
            unit = "Denier";
        } else if (calcType === "filament-length" && coneWeightGrams && denier) {
            res = (parseFloat(coneWeightGrams) * 9000 * 1000) / parseFloat(denier);
            unit = "meters (" + (res / 1000).toFixed(2) + " km)";
        } else if (calcType === "staple-length" && coneWeightKg && count) {
            res = parseFloat(coneWeightKg) * parseFloat(count) * 1693.37;
            unit = "meters";
        }

        if (res > 0) {
            setIsAnimating(true);
            setResult(`${res.toFixed(4)} ${unit}`);
            setTimeout(() => setIsAnimating(false), 600);
        } else {
            setResult("");
        }
    };

    const methods = {
        "denier-to-count": {
            title: "Denier → Count",
            formula: "Count = 5315 / Denier",
            description: "Convert Denier to Count",
            icon: "🔄"
        },
        "count-to-denier": {
            title: "Count → Denier",
            formula: "Denier = 5315 / Count",
            description: "Convert Count to Denier",
            icon: "🔁"
        },
        "filament-length": {
            title: "Filament Length",
            formula: "Length = (Weight × 9000 × 1000) / Denier",
            description: "Calculate filament yarn length from cone",
            icon: "📏"
        },
        "staple-length": {
            title: "Staple Length",
            formula: "Length = Weight × Count × 1693.37",
            description: "Calculate staple yarn length from cone",
            icon: "🧵"
        }
    };

    const currentMethod = methods[calcType as keyof typeof methods];

    return (
        <div className="space-y-6">
            {/* Method Selection Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(methods).map(([key, method]) => (
                    <button
                        key={key}
                        onClick={() => setCalcType(key)}
                        className={`
                            relative p-4 rounded-xl border-2 text-left transition-all duration-300
                            ${calcType === key
                                ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                                : 'border-border/50 hover:border-border hover:bg-muted/50'
                            }
                        `}
                    >
                        <div className="flex flex-col items-start gap-2">
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                                <h3 className={`font-semibold text-sm ${calcType === key ? 'text-violet-600 dark:text-violet-400' : ''}`}>
                                    {method.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{method.description}</p>
                            </div>
                            {calcType === key && (
                                <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-violet-500" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Main Calculator Card */}
            <Card className="overflow-hidden border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-500/20">
                            <ArrowRightLeft className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <CardTitle>Yarn Conversion</CardTitle>
                            <CardDescription>{currentMethod.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Formula Display */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                        <Info className="h-5 w-5 text-blue-500 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Formula Used</p>
                            <code className="text-sm font-mono font-semibold text-foreground">{currentMethod.formula}</code>
                        </div>
                    </div>

                    {/* Input Fields */}
                    {calcType === "denier-to-count" && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">1</span>
                                Denier Value
                            </Label>
                            <Input
                                type="number"
                                value={denier}
                                onChange={(e) => setDenier(e.target.value)}
                                placeholder="Enter denier value (e.g., 75)"
                                className="h-12 text-lg border-2 focus:border-violet-500 transition-colors"
                            />
                        </div>
                    )}

                    {calcType === "count-to-denier" && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">1</span>
                                Count Value
                            </Label>
                            <Input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(e.target.value)}
                                placeholder="Enter count value (e.g., 40)"
                                className="h-12 text-lg border-2 focus:border-violet-500 transition-colors"
                            />
                        </div>
                    )}

                    {calcType === "filament-length" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Cone Weight (grams)
                                </Label>
                                <Input
                                    type="number"
                                    value={coneWeightGrams}
                                    onChange={(e) => setConeWeightGrams(e.target.value)}
                                    placeholder="e.g., 1200"
                                    className="h-12 text-lg border-2 focus:border-violet-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Denier
                                </Label>
                                <Input
                                    type="number"
                                    value={denier}
                                    onChange={(e) => setDenier(e.target.value)}
                                    placeholder="e.g., 150"
                                    className="h-12 text-lg border-2 focus:border-violet-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {calcType === "staple-length" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Cone Weight (kg)
                                </Label>
                                <Input
                                    type="number"
                                    value={coneWeightKg}
                                    onChange={(e) => setConeWeightKg(e.target.value)}
                                    placeholder="e.g., 1"
                                    className="h-12 text-lg border-2 focus:border-violet-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Count
                                </Label>
                                <Input
                                    type="number"
                                    value={count}
                                    onChange={(e) => setCount(e.target.value)}
                                    placeholder="e.g., 40"
                                    className="h-12 text-lg border-2 focus:border-violet-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Calculate Button */}
                    <Button
                        onClick={calculate}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Calculate
                    </Button>

                    {/* Result Display */}
                    {result && (
                        <div className={`
                            relative overflow-hidden p-6 rounded-2xl 
                            bg-gradient-to-br from-violet-500/20 via-purple-500/15 to-fuchsia-500/20
                            border-2 border-violet-500/30
                            ${isAnimating ? 'animate-pulse' : ''}
                        `}>
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-fuchsia-500/5" />
                            <div className="relative text-center">
                                <p className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-2 uppercase tracking-wider">
                                    Calculated Result
                                </p>
                                <p className="text-3xl font-bold text-foreground tracking-tight">
                                    {result}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
