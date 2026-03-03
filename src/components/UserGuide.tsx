import { useState } from "react";
import {
    LayoutDashboard,
    Layers,
    Users,
    ShoppingCart,
    Package,
    TrendingUp,
    Calculator,
    Settings,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Building2,
    Star,
    Sparkles,
    BookOpen,
} from "lucide-react";

const GUIDE_STEPS = [
    {
        icon: <Sparkles className="h-8 w-8" />,
        color: "#6366f1",
        title: "Welcome to Grey Loom Manager!",
        subtitle: "Your all-in-one textile manufacturing ERP",
        description:
            "This quick guide will walk you through the key features of the app. Grey Loom Manager helps you track beams, takas, workers, sales, purchases, and much more — all in one place.",
        features: [
            "Manage multiple factory profiles",
            "Track beams and takas with full history",
            "Comprehensive worker & salary management",
            "Sales, purchases, and financial tracking",
        ],
        tip: "You can revisit this guide anytime from Settings → User Guide.",
    },
    {
        icon: <Building2 className="h-8 w-8" />,
        color: "#14b8a6",
        title: "Factory Profiles",
        subtitle: "Multi-factory management made easy",
        description:
            "Create separate profiles for each factory location. Each factory stores its data completely independently — beams, workers, sales, everything.",
        features: [
            "Create unlimited factory profiles",
            "Color-coded identification",
            "Switch between factories instantly",
            "Backup each factory separately",
        ],
        tip: "Start by creating your first factory — click 'Add New Factory' on the login screen.",
    },
    {
        icon: <LayoutDashboard className="h-8 w-8" />,
        color: "#f59e0b",
        title: "Dashboard",
        subtitle: "Your factory at a glance",
        description:
            "The Dashboard gives you a real-time overview of your factory operations — pending deliveries, recent activity, financial summaries, and key metrics.",
        features: [
            "Pending sales & purchase tracking",
            "Delivery status with progress bars",
            "Quick-access to critical data",
            "Database backup status",
        ],
        tip: "Click on any stat card to navigate directly to that section.",
    },
    {
        icon: <Layers className="h-8 w-8" />,
        color: "#8b5cf6",
        title: "Beams & Takas",
        subtitle: "Core production tracking",
        description:
            "Beams are the core production units. Each beam can have multiple takas (fabric pieces). Track production, weights, quality grades, and more in a spreadsheet-style interface.",
        features: [
            "Spreadsheet-style data entry",
            "Multiple takas per beam",
            "Quality and paint mapping",
            "Beam Pasar for multi-beam tasks",
        ],
        tip: "Use the Tab key to move between cells for fast data entry.",
    },
    {
        icon: <Users className="h-8 w-8" />,
        color: "#f43f5e",
        title: "Workers & Salary",
        subtitle: "Workforce management",
        description:
            "Manage your workforce with detailed profiles, track daily work assignments, and calculate salaries automatically based on beam/taka production.",
        features: [
            "Worker profiles with contact info",
            "Salary calculator by beam work",
            "Additional worker payments",
            "Comprehensive salary reports",
        ],
        tip: "Set up worker profiles first, then assign them to beams in the Workers tab.",
    },
    {
        icon: <ShoppingCart className="h-8 w-8" />,
        color: "#06b6d4",
        title: "Sales & Purchases",
        subtitle: "Financial transactions",
        description:
            "Track all your business transactions. Record sales with payment details, manage purchases, and keep complete financial records with multiple payment methods.",
        features: [
            "Sales orders with payment tracking",
            "Mark as paid — full or partial",
            "Purchase management",
            "RTGS, cheque, cash payment records",
        ],
        tip: "Pending payments are highlighted in red — never miss a follow-up.",
    },
    {
        icon: <Package className="h-8 w-8" />,
        color: "#10b981",
        title: "Stock & Transactions",
        subtitle: "Inventory & ledger",
        description:
            "Keep track of your yarn stock, finished goods, and all financial transactions. The Transactions ledger provides a complete audit trail of all money movements.",
        features: [
            "Stock levels with alerts",
            "Yarn and material tracking",
            "Complete transaction history",
            "Quality-wise stock breakdown",
        ],
        tip: "Run the Textile Calculator for quick fabric calculations and estimations.",
    },
    {
        icon: <Settings className="h-8 w-8" />,
        color: "#d946ef",
        title: "Settings & Backup",
        subtitle: "Keep your data safe",
        description:
            "Configure your app preferences, manage database settings, and set up automatic cloud backups. Your data is precious — back it up regularly.",
        features: [
            "Theme: light/dark/system",
            "Manual & cloud backup options",
            "Database management tools",
            "Auto-update manager",
        ],
        tip: "Set up a regular backup schedule to protect your factory data.",
    },
];

const USER_GUIDE_KEY = "grey_loom_user_guide_completed";

export function useUserGuide() {
    const completed = localStorage.getItem(USER_GUIDE_KEY) === "true";
    return { showGuide: !completed };
}

export function markGuideCompleted() {
    localStorage.setItem(USER_GUIDE_KEY, "true");
}

export function resetUserGuide() {
    localStorage.removeItem(USER_GUIDE_KEY);
}

interface UserGuideProps {
    onComplete: () => void;
}

export default function UserGuide({ onComplete }: UserGuideProps) {
    const [step, setStep] = useState(0);
    const [exiting, setExiting] = useState(false);
    const totalSteps = GUIDE_STEPS.length;
    const current = GUIDE_STEPS[step];
    const isLast = step === totalSteps - 1;

    const handleComplete = () => {
        setExiting(true);
        markGuideCompleted();
        setTimeout(() => onComplete(), 500);
    };

    const handleSkip = () => {
        markGuideCompleted();
        onComplete();
    };

    const goNext = () => {
        if (isLast) {
            handleComplete();
        } else {
            setStep((s) => s + 1);
        }
    };

    const goPrev = () => {
        setStep((s) => Math.max(0, s - 1));
    };

    return (
        <div
            className="user-guide-overlay"
            style={{
                opacity: exiting ? 0 : 1,
                transition: "opacity 0.5s ease",
            }}
        >
            {/* Backdrop */}
            <div className="user-guide-backdrop" />

            {/* Modal panel */}
            <div className="user-guide-modal">
                {/* Skip button */}
                <button className="user-guide-skip" onClick={handleSkip}>
                    <X className="h-4 w-4" />
                    <span>Skip</span>
                </button>

                {/* Step indicator dots */}
                <div className="user-guide-dots">
                    {GUIDE_STEPS.map((_, i) => (
                        <button
                            key={i}
                            className={`user-guide-dot ${i === step ? "user-guide-dot-active" : ""} ${i < step ? "user-guide-dot-done" : ""}`}
                            onClick={() => setStep(i)}
                            style={i === step ? { background: current.color } : undefined}
                        />
                    ))}
                </div>

                {/* Icon hero */}
                <div
                    className="user-guide-icon"
                    style={{
                        background: `linear-gradient(135deg, ${current.color}22 0%, ${current.color}44 100%)`,
                        border: `2px solid ${current.color}44`,
                        color: current.color,
                    }}
                >
                    {current.icon}
                    <div
                        className="user-guide-icon-glow"
                        style={{ background: current.color }}
                    />
                </div>

                {/* Content */}
                <div className="user-guide-content">
                    <span
                        className="user-guide-badge"
                        style={{ color: current.color, background: `${current.color}18` }}
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        Step {step + 1} of {totalSteps}
                    </span>
                    <h2 className="user-guide-title">{current.title}</h2>
                    <p className="user-guide-subtitle">{current.subtitle}</p>
                    <p className="user-guide-desc">{current.description}</p>

                    {/* Feature list */}
                    <ul className="user-guide-features">
                        {current.features.map((feat, i) => (
                            <li key={i} className="user-guide-feature">
                                <Check
                                    className="h-4 w-4 shrink-0"
                                    style={{ color: current.color }}
                                />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Tip box */}
                    <div
                        className="user-guide-tip"
                        style={{
                            background: `${current.color}10`,
                            borderLeft: `3px solid ${current.color}`,
                        }}
                    >
                        <Star className="h-4 w-4 shrink-0" style={{ color: current.color }} />
                        <p>{current.tip}</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="user-guide-nav">
                    <button
                        className="user-guide-nav-btn user-guide-nav-prev"
                        onClick={goPrev}
                        disabled={step === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>

                    <button
                        className="user-guide-nav-btn user-guide-nav-next"
                        style={{ background: current.color }}
                        onClick={goNext}
                    >
                        {isLast ? (
                            <>
                                <Check className="h-4 w-4" />
                                Get Started
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
