import { useState } from "react";
import {
    Calculator,
    Scale,
    Ruler,
    SquareStack,
    Cog,
    ArrowRightLeft,
    Package,
    ArrowLeft,
    Sparkles,
    Zap
} from "lucide-react";
import YarnConversionCalc from "@/components/calculations/YarnConversionCalc";
import FabricWeightCalc from "@/components/calculations/FabricWeightCalc";
import GSMCalc from "@/components/calculations/GSMCalc";
import QualityCalc from "@/components/calculations/QualityCalc";
import TFOProductionCalc from "@/components/calculations/TFOProductionCalc";
import WarpingProductionCalc from "@/components/calculations/WarpingProductionCalc";
import YarnConsumptionCalc from "@/components/calculations/YarnConsumptionCalc";
import CalculatedQualitiesTable from "@/components/calculations/CalculatedQualitiesTable";
import { Button } from "@/components/ui/button";

interface CalculatorCard {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    hoverGradient: string;
    accentColor: string;
    component: React.ReactNode;
}

const calculators: CalculatorCard[] = [
    {
        id: "yarn-conversion",
        title: "Yarn Conversion",
        description: "Convert between denier and count, calculate yarn lengths",
        icon: ArrowRightLeft,
        gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
        hoverGradient: "group-hover:from-violet-500/30 group-hover:via-purple-500/20 group-hover:to-fuchsia-500/30",
        accentColor: "text-violet-500",
        component: <YarnConversionCalc />
    },
    {
        id: "fabric-weight",
        title: "Fabric Weight",
        description: "Calculate warp and weft yarn weight required",
        icon: Scale,
        gradient: "from-blue-500/20 via-cyan-500/10 to-teal-500/20",
        hoverGradient: "group-hover:from-blue-500/30 group-hover:via-cyan-500/20 group-hover:to-teal-500/30",
        accentColor: "text-blue-500",
        component: <FabricWeightCalc />
    },
    {
        id: "gsm",
        title: "GSM Calculator",
        description: "Calculate fabric GSM using different methods",
        icon: SquareStack,
        gradient: "from-emerald-500/20 via-green-500/10 to-lime-500/20",
        hoverGradient: "group-hover:from-emerald-500/30 group-hover:via-green-500/20 group-hover:to-lime-500/30",
        accentColor: "text-emerald-500",
        component: <GSMCalc />
    },
    {
        id: "quality",
        title: "100m Quality",
        description: "Calculate fabric weight for 100 meters",
        icon: Ruler,
        gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20",
        hoverGradient: "group-hover:from-amber-500/30 group-hover:via-orange-500/20 group-hover:to-yellow-500/30",
        accentColor: "text-amber-500",
        component: <QualityCalc />
    },
    {
        id: "tfo",
        title: "T.F.O. Production",
        description: "Calculate Two-for-One twisting machine production",
        icon: Cog,
        gradient: "from-rose-500/20 via-pink-500/10 to-red-500/20",
        hoverGradient: "group-hover:from-rose-500/30 group-hover:via-pink-500/20 group-hover:to-red-500/30",
        accentColor: "text-rose-500",
        component: <TFOProductionCalc />
    },
    {
        id: "warping",
        title: "Warping Production",
        description: "Calculate warping production output in meters",
        icon: Zap,
        gradient: "from-sky-500/20 via-indigo-500/10 to-blue-500/20",
        hoverGradient: "group-hover:from-sky-500/30 group-hover:via-indigo-500/20 group-hover:to-blue-500/30",
        accentColor: "text-sky-500",
        component: <WarpingProductionCalc />
    },
    {
        id: "consumption",
        title: "Yarn Consumption",
        description: "Calculate warp and weft yarn consumption for fabric",
        icon: Package,
        gradient: "from-teal-500/20 via-emerald-500/10 to-cyan-500/20",
        hoverGradient: "group-hover:from-teal-500/30 group-hover:via-emerald-500/20 group-hover:to-cyan-500/30",
        accentColor: "text-teal-500",
        component: <YarnConsumptionCalc />
    }
];

export default function TextileCalculations() {
    const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);

    const activeCalc = calculators.find(c => c.id === selectedCalculator);

    if (selectedCalculator && activeCalc) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header with back button */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedCalculator(null)}
                        className="shrink-0 hover:bg-primary/10 transition-all duration-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${activeCalc.gradient} shadow-lg`}>
                            <activeCalc.icon className={`h-6 w-6 ${activeCalc.accentColor}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{activeCalc.title}</h1>
                            <p className="text-muted-foreground text-sm">{activeCalc.description}</p>
                        </div>
                    </div>
                </div>

                {/* Calculator Component */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    {activeCalc.component}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-xl shadow-primary/5 border border-primary/10">
                        <Calculator className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                                Textile Calculations
                            </h1>
                            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                        </div>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Comprehensive formulas for textile manufacturing processes
                        </p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="relative mt-6 pt-6 border-t border-primary/10 flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">7</span> Calculators Available
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">
                            Industry Standard Formulas
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-sm text-muted-foreground">
                            Instant Results
                        </span>
                    </div>
                </div>
            </div>

            {/* Calculator Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {calculators.map((calc, index) => (
                    <button
                        key={calc.id}
                        onClick={() => setSelectedCalculator(calc.id)}
                        className="group relative text-left"
                        style={{
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeSlideIn 0.5s ease forwards',
                            opacity: 0
                        }}
                    >
                        <div className={`
                            relative overflow-hidden rounded-xl border border-border/50 p-6 
                            transition-all duration-300 ease-out
                            hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
                            hover:-translate-y-1
                            bg-gradient-to-br ${calc.gradient} ${calc.hoverGradient}
                        `}>
                            {/* Glow effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className={`absolute inset-0 bg-gradient-to-br ${calc.gradient} blur-xl`} />
                            </div>

                            {/* Content */}
                            <div className="relative">
                                {/* Icon */}
                                <div className={`
                                    inline-flex p-3 rounded-xl mb-4
                                    bg-background/80 backdrop-blur-sm
                                    shadow-lg shadow-black/5
                                    group-hover:scale-110 transition-transform duration-300
                                    border border-border/50
                                `}>
                                    <calc.icon className={`h-6 w-6 ${calc.accentColor} transition-all duration-300`} />
                                </div>

                                {/* Title & Description */}
                                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                    {calc.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {calc.description}
                                </p>

                                {/* Arrow indicator */}
                                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    <span>Open Calculator</span>
                                    <ArrowRightLeft className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quality Comparison Table */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <CalculatedQualitiesTable />
            </div>

            {/* Footer tips section */}

            <div className="rounded-xl border border-border/50 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Pro Tip</h3>
                        <p className="text-sm text-muted-foreground">
                            All calculations use industry-standard textile formulas. Results are automatically
                            formatted with appropriate decimal precision for accurate manufacturing decisions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
