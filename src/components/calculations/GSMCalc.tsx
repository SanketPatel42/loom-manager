import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Info, CheckCircle2 } from "lucide-react";

export default function GSMCalc() {
    const [calcType, setCalcType] = useState<string>("from-yarn-weight");
    const [totalYarnUsed, setTotalYarnUsed] = useState<string>("");
    const [fabricWidth, setFabricWidth] = useState<string>("");
    const [fabricWeightKg, setFabricWeightKg] = useState<string>("");
    const [fabricLength, setFabricLength] = useState<string>("");
    const [epi, setEpi] = useState<string>("");
    const [warpCount, setWarpCount] = useState<string>("");
    const [ppi, setPpi] = useState<string>("");
    const [weftCount, setWeftCount] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [isAnimating, setIsAnimating] = useState(false);

    const calculate = () => {
        let gsm = 0;

        if (calcType === "from-yarn-weight" && totalYarnUsed && fabricWidth) {
            gsm = (parseFloat(totalYarnUsed) * 39.37) / parseFloat(fabricWidth);
        } else if (calcType === "from-fabric-weight" && fabricWeightKg && fabricLength && fabricWidth) {
            gsm = (parseFloat(fabricWeightKg) * 39.37 * 1000) / (parseFloat(fabricLength) * parseFloat(fabricWidth));
        } else if (calcType === "staple-yarn" && epi && warpCount && ppi && weftCount) {
            gsm = ((parseFloat(epi) / parseFloat(warpCount)) + (parseFloat(ppi) / parseFloat(weftCount))) * 25.6;
        }

        if (gsm > 0) {
            setIsAnimating(true);
            setResult(gsm.toFixed(2) + " GSM");
            setTimeout(() => setIsAnimating(false), 600);
        } else {
            setResult("");
        }
    };

    const methodDescriptions = {
        "from-yarn-weight": {
            title: "From Yarn Weight",
            formula: "GSM = (Yarn Used × 39.37) / Width",
            description: "Calculate GSM using total yarn weight per meter"
        },
        "from-fabric-weight": {
            title: "From Fabric Weight",
            formula: "GSM = (Weight × 39.37 × 1000) / (Length × Width)",
            description: "Calculate GSM from fabric roll weight and dimensions"
        },
        "staple-yarn": {
            title: "Staple Yarn Formula",
            formula: "GSM = ((EPI/Warp Count) + (PPI/Weft Count)) × 25.6",
            description: "Calculate GSM using yarn specifications"
        }
    };

    const currentMethod = methodDescriptions[calcType as keyof typeof methodDescriptions];

    return (
        <div className="space-y-6">
            {/* Method Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(methodDescriptions).map(([key, method]) => (
                    <button
                        key={key}
                        onClick={() => setCalcType(key)}
                        className={`
                            relative p-4 rounded-xl border-2 text-left transition-all duration-300
                            ${calcType === key
                                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                : 'border-border/50 hover:border-border hover:bg-muted/50'
                            }
                        `}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className={`font-semibold mb-1 ${calcType === key ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                    {method.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                            </div>
                            {calcType === key && (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Main Calculator Card */}
            <Card className="overflow-hidden border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-lime-500/10 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle>GSM Calculation</CardTitle>
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
                    {calcType === "from-yarn-weight" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Total Yarn Used (grams/meter)
                                </Label>
                                <Input
                                    type="number"
                                    value={totalYarnUsed}
                                    onChange={(e) => setTotalYarnUsed(e.target.value)}
                                    placeholder="e.g., 0.0436"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Fabric Width (inches)
                                </Label>
                                <Input
                                    type="number"
                                    value={fabricWidth}
                                    onChange={(e) => setFabricWidth(e.target.value)}
                                    placeholder="e.g., 48"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {calcType === "from-fabric-weight" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Fabric Weight (kg)
                                </Label>
                                <Input
                                    type="number"
                                    value={fabricWeightKg}
                                    onChange={(e) => setFabricWeightKg(e.target.value)}
                                    placeholder="e.g., 14.5"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Fabric Length (meters)
                                </Label>
                                <Input
                                    type="number"
                                    value={fabricLength}
                                    onChange={(e) => setFabricLength(e.target.value)}
                                    placeholder="e.g., 100"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                                    Fabric Width (inches)
                                </Label>
                                <Input
                                    type="number"
                                    value={fabricWidth}
                                    onChange={(e) => setFabricWidth(e.target.value)}
                                    placeholder="e.g., 48"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {calcType === "staple-yarn" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">1</span>
                                    EPI (Ends Per Inch)
                                </Label>
                                <Input
                                    type="number"
                                    value={epi}
                                    onChange={(e) => setEpi(e.target.value)}
                                    placeholder="e.g., 92"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Warp Count
                                </Label>
                                <Input
                                    type="number"
                                    value={warpCount}
                                    onChange={(e) => setWarpCount(e.target.value)}
                                    placeholder="e.g., 40"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                                    PPI (Picks Per Inch)
                                </Label>
                                <Input
                                    type="number"
                                    value={ppi}
                                    onChange={(e) => setPpi(e.target.value)}
                                    placeholder="e.g., 76"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                                    Weft Count
                                </Label>
                                <Input
                                    type="number"
                                    value={weftCount}
                                    onChange={(e) => setWeftCount(e.target.value)}
                                    placeholder="e.g., 40"
                                    className="h-12 text-lg border-2 focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Calculate Button */}
                    <Button
                        onClick={calculate}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Calculate GSM
                    </Button>

                    {/* Result Display */}
                    {result && (
                        <div className={`
                            relative overflow-hidden p-6 rounded-2xl 
                            bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-lime-500/20
                            border-2 border-emerald-500/30
                            ${isAnimating ? 'animate-pulse' : ''}
                        `}>
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-lime-500/5" />
                            <div className="relative text-center">
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider">
                                    Calculated Result
                                </p>
                                <p className="text-4xl font-bold text-foreground tracking-tight">
                                    {result}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Grams per Square Meter
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
