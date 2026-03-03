import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
// Import storage test in development
import "./test-storage";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Beams from "./pages/Beams";
import Takas from "./pages/Takas";
import Workers from "./pages/Workers";
import WorkerProfiles from "./pages/WorkerProfiles";
import SalaryCalculator from "./pages/SalaryCalculator";
import ComprehensiveSalary from "./pages/ComprehensiveSalary";
import AdditionalWorkers from "./pages/AdditionalWorkers";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Transactions from "./pages/Transactions";
import Stock from "./pages/Stock";
import Qualities from "./pages/Qualities";
import BeamPasar from "./pages/BeamPasar";
import TextileCalculations from "./pages/TextileCalculations";
import Settings from "./pages/Settings";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import FactoryLogin from "./pages/FactoryLogin";

import { ThemeProvider } from "@/components/theme-provider";
import { FactoryProvider, useFactory } from "@/lib/factoryContext";
import { electronDb } from "@/lib/electronDb";
import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import UserGuide, { useUserGuide } from "./components/UserGuide";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isFactorySelected } = useFactory();
  const { showGuide } = useUserGuide();
  const [guideVisible, setGuideVisible] = useState(showGuide);

  if (!isFactorySelected) {
    return (
      <>
        {guideVisible && (
          <UserGuide onComplete={() => setGuideVisible(false)} />
        )}
        <FactoryLogin />
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/beams" element={<Layout><Beams /></Layout>} />
      <Route path="/takas" element={<Layout><Takas /></Layout>} />
      <Route path="/workers" element={<Layout><Workers /></Layout>} />
      <Route path="/worker-profiles" element={<Layout><WorkerProfiles /></Layout>} />
      <Route path="/salary-calculator" element={<Layout><SalaryCalculator /></Layout>} />
      <Route path="/comprehensive-salary" element={<Layout><ComprehensiveSalary /></Layout>} />
      <Route path="/additional-workers" element={<Layout><AdditionalWorkers /></Layout>} />
      <Route path="/sales" element={<Layout><Sales /></Layout>} />
      <Route path="/purchases" element={<Layout><Purchases /></Layout>} />
      <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
      <Route path="/stock" element={<Layout><Stock /></Layout>} />
      <Route path="/qualities" element={<Layout><Qualities /></Layout>} />
      <Route path="/textile-calculations" element={<Layout><TextileCalculations /></Layout>} />
      <Route path="/beam-pasar" element={<Layout><BeamPasar /></Layout>} />
      <Route path="/notes" element={<Layout><Notes /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Attempt migration on startup
    electronDb.migrate().then(() => {
      console.log("Migration check init");
    }).catch(console.error);
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* Splash screen shown on every app open */}
          {!splashDone && (
            <SplashScreen onComplete={() => setSplashDone(true)} />
          )}

          {/* Main app (rendered behind splash, shown after) */}
          <div style={{ visibility: splashDone ? "visible" : "hidden" }}>
            <FactoryProvider>
              <HashRouter>
                <AppContent />
              </HashRouter>
            </FactoryProvider>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
