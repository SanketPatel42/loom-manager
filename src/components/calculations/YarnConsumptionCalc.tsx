import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Info, Sparkles, ArrowUp, ArrowRight, CheckCircle2 } from "lucide-react";

export default function YarnConsumptionCalc() {
    const [activeTab, setActiveTab] = useState<"warp" | "weft">("warp");

    // Warp consumption
    const [warpLength, setWarpLength] = useState<string>("");
    const [totalEnds, setTotalEnds] = useState<string>("");
    const [warpDenier, setWarpDenier] = useState<string>("");
    const [warpResult, setWarpResult] = useState<string>("");
    const [warpAnimating, setWarpAnimating] = useState(false);

    // Weft consumption
    const [weftLength, setWeftLength] = useState<string>("");
    const [picksPerDm, setPicksPerDm] = useState<string>("");
    const [weftDenier, setWeftDenier] = useState<string>("");
    const [reedSpaceDm, setReedSpaceDm] = useState<string>("");
    const [weftResult, setWeftResult] = useState<string>("");
    const [weftAnimating, setWeftAnimating] = useState(false);

    const calculateWarp = () => {
        if (warpLength && totalEnds && warpDenier) {
            const weight = (parseFloat(warpLength) * parseFloat(totalEnds) * parseFloat(warpDenier)) / (9000 * 1000);
            setWarpAnimating(true);
            setWarpResult(`${weight.toFixed(2)} kg`);
            setTimeout(() => setWarpAnimating(false), 600);
        }
    };

    const calculateWeft = () => {
        if (weftLength && picksPerDm && weftDenier && reedSpaceDm) {
            const weight = (parseFloat(weftLength) * parseFloat(picksPerDm) * parseFloat(weftDenier) * parseFloat(reedSpaceDm)) / (9000 * 1000);
            setWeftAnimating(true);
            setWeftResult(`${weight.toFixed(2)} kg`);
            setTimeout(() => setWeftAnimating(false), 600);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Selection */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setActiveTab("warp")}
                    className={`
                        relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300
                        ${activeTab === "warp"
                            ? 'border-teal-500 bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-cyan-500/20 shadow-lg shadow-teal-500/10'
                            : 'border-border/50 hover:border-border hover:bg-muted/50'
                        }
                    `}
                >
                    <div className={`p-3 rounded-xl ${activeTab === "warp" ? 'bg-teal-500/20' : 'bg-muted'}`}>
                        <ArrowUp className={`h-6 w-6 ${activeTab === "warp" ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className={`font-semibold text-lg ${activeTab === "warp" ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                            Warp Consumption
                        </h3>
                        <p className="text-sm text-muted-foreground">Calculate yarn for warp beam</p>
                    </div>
                    {activeTab === "warp" && (
                        <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("weft")}
                    className={`
                        relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300
                        ${activeTab === "weft"
                            ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-indigo-500/20 shadow-lg shadow-cyan-500/10'
                            : 'border-border/50 hover:border-border hover:bg-muted/50'
                        }
                    `}
                >
                    <div className={`p-3 rounded-xl ${activeTab === "weft" ? 'bg-cyan-500/20' : 'bg-muted'}`}>
                        <ArrowRight className={`h-6 w-6 ${activeTab === "weft" ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="text-left flex-1">
                        <h3 className={`font-semibold text-lg ${activeTab === "weft" ? 'text-cyan-600 dark:text-cyan-400' : ''}`}>
                            Weft Consumption
                        </h3>
                        <p className="text-sm text-muted-foreground">Calculate yarn for weaving</p>
                    </div>
                    {activeTab === "weft" && (
                        <CheckCircle2 className="h-5 w-5 text-cyan-500" />
                    )}
                </button>
            </div>

            {/* Warp Calculator */}
            {activeTab === "warp" && (
                <Card className="overflow-hidden border-2 shadow-xl animate-in fade-in slide-in-from-left-4 duration-300">
                    <CardHeader className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/20">
                                <Package className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <CardTitle>Warp Yarn Consumption</CardTitle>
                                <CardDescription>Calculate the yarn weight needed for warp</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Formula Display */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-500/5 to-emerald-500/5 border border-teal-500/20">
                            <Info className="h-5 w-5 text-teal-500 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Formula</p>
                                <code className="text-sm font-mono font-semibold">
                                    Weight (kg) = (Length × Total Ends × Denier) / (9000 × 1000)
                                </code>
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Fabric Length (meters)
                                </Label>
                                <Input
                                    type="number"
                                    value={warpLength}
                                    onChange={(e) => setWarpLength(e.target.value)}
                                    placeholder="e.g., 110"
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Total Ends
                                </Label>
                                <Input
                                    type="number"
                                    value={totalEnds}
                                    onChange={(e) => setTotalEnds(e.target.value)}
                                    placeholder="e.g., 4000"
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">3</span>
                                    Warp Denier
                                </Label>
                                <Input
                                    type="number"
                                    value={warpDenier}
                                    onChange={(e) => setWarpDenier(e.target.value)}
                                    placeholder="e.g., 75"
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <Button
                            onClick={calculateWarp}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-500/25"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Calculate Warp Consumption
                        </Button>

                        {/* Result */}
                        {warpResult && (
                            <div className={`
                                relative overflow-hidden p-6 rounded-2xl 
                                bg-gradient-to-br from-teal-500/20 via-emerald-500/15 to-cyan-500/20
                                border-2 border-teal-500/30
                                ${warpAnimating ? 'animate-pulse' : ''}
                            `}>
                                <div className="relative text-center">
                                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wider">
                                        Warp Yarn Required
                                    </p>
                                    <p className="text-4xl font-bold text-foreground tracking-tight">
                                        {warpResult}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Weft Calculator */}
            {activeTab === "weft" && (
                <Card className="overflow-hidden border-2 shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
                    <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-indigo-500/10 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20">
                                <Package className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <CardTitle>Weft Yarn Consumption</CardTitle>
                                <CardDescription>Calculate the yarn weight needed for weft</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Formula Display */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20">
                            <Info className="h-5 w-5 text-cyan-500 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Formula</p>
                                <code className="text-sm font-mono font-semibold">
                                    Weight (kg) = (Length × Picks/dm × Denier × Reed Space) / (9000 × 1000)
                                </code>
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Fabric Length (meters)
                                </Label>
                                <Input
                                    type="number"
                                    value={weftLength}
                                    onChange={(e) => setWeftLength(e.target.value)}
                                    placeholder="e.g., 100"
                                    className="h-11 border-2 focus:border-cyan-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Picks per Decimeter
                                </Label>
                                <Input
                                    type="number"
                                    value={picksPerDm}
                                    onChange={(e) => setPicksPerDm(e.target.value)}
                                    placeholder="e.g., 72"
                                    className="h-11 border-2 focus:border-cyan-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">3</span>
                                    Weft Denier
                                </Label>
                                <Input
                                    type="number"
                                    value={weftDenier}
                                    onChange={(e) => setWeftDenier(e.target.value)}
                                    placeholder="e.g., 78"
                                    className="h-11 border-2 focus:border-cyan-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold">4</span>
                                    Reed Space (decimeters)
                                </Label>
                                <Input
                                    type="number"
                                    value={reedSpaceDm}
                                    onChange={(e) => setReedSpaceDm(e.target.value)}
                                    placeholder="e.g., 49.5"
                                    className="h-11 border-2 focus:border-cyan-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <Button
                            onClick={calculateWeft}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Calculate Weft Consumption
                        </Button>

                        {/* Result */}
                        {weftResult && (
                            <div className={`
                                relative overflow-hidden p-6 rounded-2xl 
                                bg-gradient-to-br from-cyan-500/20 via-blue-500/15 to-indigo-500/20
                                border-2 border-cyan-500/30
                                ${weftAnimating ? 'animate-pulse' : ''}
                            `}>
                                <div className="relative text-center">
                                    <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-2 uppercase tracking-wider">
                                        Weft Yarn Required
                                    </p>
                                    <p className="text-4xl font-bold text-foreground tracking-tight">
                                        {weftResult}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
