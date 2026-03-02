import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Info, Sparkles, ArrowRight } from "lucide-react";

export default function FabricWeightCalc() {
    const [activeTab, setActiveTab] = useState<"warp" | "weft">("warp");

    // Warp calculation state
    const [epi, setEpi] = useState<string>("");
    const [fabricWidth, setFabricWidth] = useState<string>("");
    const [selvedgeReduction, setSelvedgeReduction] = useState<string>("2");
    const [selvedgeTars, setSelvedgeTars] = useState<string>("32");
    const [warpDenier, setWarpDenier] = useState<string>("");
    const [fabricLength, setFabricLength] = useState<string>("1");
    const [warpWeight, setWarpWeight] = useState<string>("");
    const [warpAnimating, setWarpAnimating] = useState(false);

    // Weft calculation state
    const [ppi, setPpi] = useState<string>("");
    const [weftDenier, setWeftDenier] = useState<string>("");
    const [weftFabricWidth, setWeftFabricWidth] = useState<string>("");
    const [weftFabricLength, setWeftFabricLength] = useState<string>("1");
    const [weftWeight, setWeftWeight] = useState<string>("");
    const [weftAnimating, setWeftAnimating] = useState(false);

    const calculateWarp = () => {
        const totalEnds = (parseFloat(epi) * (parseFloat(fabricWidth) - parseFloat(selvedgeReduction))) + parseFloat(selvedgeTars);
        const weight = (parseFloat(warpDenier) * parseFloat(fabricLength) * totalEnds) / (9000 * 1000);
        setWarpAnimating(true);
        setWarpWeight(weight.toFixed(6) + " grams");
        setTimeout(() => setWarpAnimating(false), 600);
    };

    const calculateWeft = () => {
        const widthMeters = parseFloat(weftFabricWidth);
        const weight = (widthMeters * parseFloat(ppi) * parseFloat(weftFabricLength) * parseFloat(weftDenier)) / (9000 * 1000);
        setWeftAnimating(true);
        setWeftWeight(weight.toFixed(6) + " grams");
        setTimeout(() => setWeftAnimating(false), 600);
    };

    return (
        <div className="space-y-6">
            {/* Tab Selection */}
            <div className="flex gap-4 p-2 bg-muted/50 rounded-xl border">
                <button
                    onClick={() => setActiveTab("warp")}
                    className={`
                        flex-1 flex items-center justify-center gap-3 p-4 rounded-lg transition-all duration-300
                        ${activeTab === "warp"
                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 shadow-lg shadow-blue-500/10'
                            : 'hover:bg-muted border-2 border-transparent'
                        }
                    `}
                >
                    <div className={`p-2 rounded-lg ${activeTab === "warp" ? 'bg-blue-500/20' : 'bg-muted'}`}>
                        <span className="text-xl">⬆️</span>
                    </div>
                    <div className="text-left">
                        <h3 className={`font-semibold ${activeTab === "warp" ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            Warp Weight
                        </h3>
                        <p className="text-xs text-muted-foreground">Vertical yarn calculation</p>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("weft")}
                    className={`
                        flex-1 flex items-center justify-center gap-3 p-4 rounded-lg transition-all duration-300
                        ${activeTab === "weft"
                            ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/50 shadow-lg shadow-teal-500/10'
                            : 'hover:bg-muted border-2 border-transparent'
                        }
                    `}
                >
                    <div className={`p-2 rounded-lg ${activeTab === "weft" ? 'bg-teal-500/20' : 'bg-muted'}`}>
                        <span className="text-xl">➡️</span>
                    </div>
                    <div className="text-left">
                        <h3 className={`font-semibold ${activeTab === "weft" ? 'text-teal-600 dark:text-teal-400' : ''}`}>
                            Weft Weight
                        </h3>
                        <p className="text-xs text-muted-foreground">Horizontal yarn calculation</p>
                    </div>
                </button>
            </div>

            {/* Warp Calculator */}
            {activeTab === "warp" && (
                <Card className="overflow-hidden border-2 shadow-xl animate-in fade-in slide-in-from-left-4 duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-teal-500/10 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle>Warp Weight Calculation</CardTitle>
                                <CardDescription>Calculate the weight of warp yarn required</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Formula Display */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
                            <Info className="h-5 w-5 text-blue-500 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Formula</p>
                                <code className="text-xs font-mono font-semibold">
                                    Weight = (Denier × Length × Total Ends) / (9000 × 1000)
                                </code>
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                                    EPI (Ends Per Inch)
                                </Label>
                                <Input
                                    type="number"
                                    value={epi}
                                    onChange={(e) => setEpi(e.target.value)}
                                    placeholder="e.g., 90"
                                    className="h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                                    Fabric Width (inches)
                                </Label>
                                <Input
                                    type="number"
                                    value={fabricWidth}
                                    onChange={(e) => setFabricWidth(e.target.value)}
                                    placeholder="e.g., 48"
                                    className="h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
                                    Selvedge Reduction (inches)
                                </Label>
                                <Input
                                    type="number"
                                    value={selvedgeReduction}
                                    onChange={(e) => setSelvedgeReduction(e.target.value)}
                                    className="h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
                                    Selvedge Tars (both sides)
                                </Label>
                                <Input
                                    type="number"
                                    value={selvedgeTars}
                                    onChange={(e) => setSelvedgeTars(e.target.value)}
                                    className="h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">5</span>
                                    Warp Denier
                                </Label>
                                <Input
                                    type="number"
                                    value={warpDenier}
                                    onChange={(e) => setWarpDenier(e.target.value)}
                                    placeholder="e.g., 70"
                                    className="h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">6</span>
                                    Fabric Length (meters)
                                </Label>
                                <Input
                                    type="number"
                                    value={fabricLength}
                                    onChange={(e) => setFabricLength(e.target.value)}
                                    className="h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={calculateWarp}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Calculate Warp Weight
                        </Button>

                        {warpWeight && (
                            <div className={`
                                relative overflow-hidden p-6 rounded-2xl 
                                bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-teal-500/20
                                border-2 border-blue-500/30
                                ${warpAnimating ? 'animate-pulse' : ''}
                            `}>
                                <div className="relative text-center">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
                                        Warp Weight
                                    </p>
                                    <p className="text-4xl font-bold text-foreground tracking-tight">
                                        {warpWeight}
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
                    <CardHeader className="bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-emerald-500/10 border-b">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/20">
                                <ArrowRight className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <CardTitle>Weft Weight Calculation</CardTitle>
                                <CardDescription>Calculate the weight of weft yarn required</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Formula Display */}
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-500/5 to-cyan-500/5 border border-teal-500/20">
                            <Info className="h-5 w-5 text-teal-500 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Formula</p>
                                <code className="text-xs font-mono font-semibold">
                                    Weight = (Width × PPI × Length × Denier) / (9000 × 1000)
                                </code>
                            </div>
                        </div>

                        {/* Input Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">1</span>
                                    Fabric Width (inches)
                                </Label>
                                <Input
                                    type="number"
                                    value={weftFabricWidth}
                                    onChange={(e) => setWeftFabricWidth(e.target.value)}
                                    placeholder="e.g., 48"
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">2</span>
                                    PPI (Picks Per Inch)
                                </Label>
                                <Input
                                    type="number"
                                    value={ppi}
                                    onChange={(e) => setPpi(e.target.value)}
                                    placeholder="e.g., 72"
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">3</span>
                                    Weft Denier
                                </Label>
                                <Input
                                    type="number"
                                    value={weftDenier}
                                    onChange={(e) => setWeftDenier(e.target.value)}
                                    placeholder="e.g., 75"
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">4</span>
                                    Fabric Length (meters)
                                </Label>
                                <Input
                                    type="number"
                                    value={weftFabricLength}
                                    onChange={(e) => setWeftFabricLength(e.target.value)}
                                    className="h-11 border-2 focus:border-teal-500 transition-colors"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={calculateWeft}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/25"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Calculate Weft Weight
                        </Button>

                        {weftWeight && (
                            <div className={`
                                relative overflow-hidden p-6 rounded-2xl 
                                bg-gradient-to-br from-teal-500/20 via-cyan-500/15 to-emerald-500/20
                                border-2 border-teal-500/30
                                ${weftAnimating ? 'animate-pulse' : ''}
                            `}>
                                <div className="relative text-center">
                                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wider">
                                        Weft Weight
                                    </p>
                                    <p className="text-4xl font-bold text-foreground tracking-tight">
                                        {weftWeight}
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
