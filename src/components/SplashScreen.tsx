import { useEffect, useState } from "react";
import { Layers } from "lucide-react";

const MOTIVATIONAL_QUOTES = [
    {
        quote: "Every thread woven with care is a product of excellence. Keep weaving your success.",
        author: "Grey Loom Manager",
    },
    {
        quote: "The loom of life rewards those who stay consistent. Your factory's story is still being written.",
        author: "Grey Loom Manager",
    },
    {
        quote: "Quality is not an act, it is a habit. Each beam, each taka — crafted with pride.",
        author: "Grey Loom Manager",
    },
    {
        quote: "Hard work is the warp; dedication is the weft. Together, they create something beautiful.",
        author: "Grey Loom Manager",
    },
    {
        quote: "Great businesses are built one day at a time. Today is your opportunity to build something great.",
        author: "Grey Loom Manager",
    },
    {
        quote: "In the textile of business, every transaction, every worker, every beam counts. Make them all matter.",
        author: "Grey Loom Manager",
    },
    {
        quote: "Success in manufacturing is about precision, patience, and passion. You have all three.",
        author: "Grey Loom Manager",
    },
];

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
    const [quote] = useState(
        () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
    );

    useEffect(() => {
        // Enter phase → visible after 100ms
        const t1 = setTimeout(() => setPhase("visible"), 100);
        // Stay visible for 3.2s, then exit
        const t2 = setTimeout(() => setPhase("exit"), 3300);
        // Call onComplete after exit animation (0.8s)
        const t3 = setTimeout(() => onComplete(), 4100);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [onComplete]);

    return (
        <div
            className="splash-screen"
            style={{
                opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1,
                transform: phase === "enter" ? "scale(1.04)" : phase === "exit" ? "scale(0.97)" : "scale(1)",
                transition: phase === "enter"
                    ? "opacity 0.5s ease, transform 0.5s ease"
                    : "opacity 0.8s ease, transform 0.8s ease",
            }}
        >
            {/* Animated background orbs */}
            <div className="splash-bg">
                <div className="splash-orb splash-orb-1" />
                <div className="splash-orb splash-orb-2" />
                <div className="splash-orb splash-orb-3" />
                <div className="splash-grid" />
            </div>

            <div className="splash-content">
                {/* Logo */}
                <div className="splash-logo-wrap">
                    <div className="splash-logo-ring splash-logo-ring-outer" />
                    <div className="splash-logo-ring splash-logo-ring-inner" />
                    <div className="splash-logo-icon">
                        <Layers className="h-10 w-10" />
                    </div>
                </div>

                {/* App name */}
                <h1 className="splash-title">Grey Loom Manager</h1>
                <p className="splash-tagline">Manufacturing Excellence Platform</p>

                {/* Divider */}
                <div className="splash-divider">
                    <div className="splash-divider-line" />
                    <div className="splash-divider-dot" />
                    <div className="splash-divider-line" />
                </div>

                {/* Motivational quote */}
                <div className="splash-quote-wrap">
                    <span className="splash-quote-mark">"</span>
                    <p className="splash-quote">{quote.quote}</p>
                    <p className="splash-quote-author">— {quote.author}</p>
                </div>

                {/* Loading indicator */}
                <div className="splash-loader">
                    <div className="splash-loader-track">
                        <div className="splash-loader-bar" />
                    </div>
                    <p className="splash-loader-text">Loading your workspace...</p>
                </div>
            </div>
        </div>
    );
}
