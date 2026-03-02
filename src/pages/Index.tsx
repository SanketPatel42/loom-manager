import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { asyncStorage } from "@/lib/storage";
import { onDataChange } from "@/lib/events";
import {
  Package,
  Wind,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  Activity,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Truck,
  History,
  Database
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DatabaseStatus from "@/components/DatabaseStatus";
import RefreshTool from "@/components/RefreshTool";
import CloudBackup from "@/components/CloudBackup";
import ManualBackupRestore from "@/components/ManualBackupRestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Animated counter component
const AnimatedCounter = ({ value, prefix = "", suffix = "", className = "" }: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second animation
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className={`stat-value ${className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// Mini trend indicator
const TrendIndicator = ({ positive = true }: { positive?: boolean }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium ${positive ? 'text-green-500' : 'text-red-500'}`}>
    {positive ? (
      <ArrowUpRight className="h-3 w-3" />
    ) : (
      <ArrowDownRight className="h-3 w-3" />
    )}
  </span>
);

const Index = () => {
  const [stats, setStats] = useState({
    beamsYesterday: 0,
    takasProduced: 0,
    takasInStock: 0,
    foldedYesterday: 0,
    salesMonth: 0,
    purchasesMonth: 0,
    productionMonthBeams: 0,
    productionMonthTakas: 0,
    pendingPayments: 0,
    lowStockItems: [] as any[],
    pendingPurchases: [] as any[],
    pendingSales: [] as any[],
  });

  const [dailyRecords, setDailyRecords] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      console.log('[Dashboard] Starting data load...');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      // Use local date parts for consistency with YYYY-MM-DD storage
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const startOfMonth = `${year}-${month}-01`;

      const yDate = new Date(today);
      yDate.setDate(today.getDate() - 1);
      const yesterdayStr = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;

      // Use async storage for database operations
      const [beams, takas, sales, purchases, transactions, stock, purchaseDeliveries, saleDeliveries] = await Promise.all([
        asyncStorage.getBeams(),
        asyncStorage.getTakas(),
        asyncStorage.getSales(),
        asyncStorage.getPurchases(),
        asyncStorage.getTransactions(),
        asyncStorage.getStock(),
        asyncStorage.getPurchaseDeliveries(),
        asyncStorage.getSaleDeliveries(),
      ]);

      // --- Daily Stats (Yesterday) ---
      const beamsYesterday = beams.filter(b => b.date === yesterdayStr).length;

      // Calculate daily sums for Takas (Yesterday) across all qualities
      const yesterdayTakas = takas.filter(t => t.date === yesterdayStr);
      const yesterdayTakasProduced = yesterdayTakas.reduce((sum, t) => sum + (t.available || 0), 0);
      const yesterdayTakasFolded = yesterdayTakas.reduce((sum, t) => sum + (t.folded || 0), 0);

      // --- Stock ---
      // Get latest stock for each unique yarn count
      // Sort stock by Date Desc, then ID Desc (assuming ID is somewhat chronological or at least unique tie-breaker)
      const sortedStock = [...stock].sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id.localeCompare(a.id); // Tie-breaker
      });

      const latestStockByYarn: Record<string, any> = {};
      sortedStock.forEach(s => {
        if (!latestStockByYarn[s.yarnCount]) {
          latestStockByYarn[s.yarnCount] = s;
        }
      });
      const lowStockItems = Object.values(latestStockByYarn).filter((s: any) => s.boxesAvailable < 10);

      // Calculate Total Takas In Stock
      // Sort takas by Date Desc, then ID Desc to find the absolute latest record for each quality
      const sortedTakas = [...takas].sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id.localeCompare(a.id);
      });

      const latestTakasByQuality: Record<string, any> = {};
      sortedTakas.forEach(t => {
        const qId = t.qualityId || 'unassigned';
        if (!latestTakasByQuality[qId]) {
          latestTakasByQuality[qId] = t;
        }
      });

      const takasInStock = Object.values(latestTakasByQuality).reduce((sum: number, t: any) => sum + (t.remaining || 0), 0);

      // --- Monthly Stats ---
      // For sales revenue, we count:
      // 1. All SPOT sales this month
      // 2. All DELIVERIES made this month for advance sales
      const spotSalesTotal = sales
        .filter(s => s.date >= startOfMonth && (s.type === 'spot' || !s.type))
        .reduce((sum, s) => sum + (s.total || 0), 0);

      const monthlyDeliveriesTotal = saleDeliveries
        .filter(d => d.date >= startOfMonth)
        .reduce((sum, d) => {
          const sale = sales.find(s => s.id === d.saleId);
          if (!sale || sale.type === 'spot') return sum; // Spot sales are already counted in spotSalesTotal

          // Calculate delivery value (meters * rate * 1.05 for tax)
          const value = d.meters * (sale.ratePerMeter || 0) * 1.05;
          return sum + value;
        }, 0);

      const salesMonth = spotSalesTotal + monthlyDeliveriesTotal;

      const purchasesMonth = purchases
        .filter(p => p.date >= startOfMonth)
        .reduce((sum, p) => sum + (p.tons || 0), 0);

      const productionMonthBeams = beams
        .filter(b => b.date >= startOfMonth)
        .length;

      // Note: Taka records are daily snapshots, not additive production logs usually. 
      // But we can approximate 'Produced' by summing 'available' from entries this month?
      // Actually 'available' in Taka record usually means "New Takas available today".
      const productionMonthTakas = takas
        .filter(t => t.date >= startOfMonth)
        .reduce((sum, t) => sum + (t.available || 0), 0);

      // --- Pending Deliveries Tracking ---

      // Calculate pending purchases
      const pendingPurchasesData = purchases.map(p => {
        const pDeliveries = purchaseDeliveries.filter(d => d.purchaseId === p.id);
        let delivered = 0;
        let total = 0;
        let unit = "";

        if (p.type === 'beam') {
          delivered = pDeliveries.reduce((sum, d) => sum + (d.numberOfBeams || 1), 0);
          total = p.numberOfBeams || 0;
          unit = "Beams";
        } else {
          delivered = pDeliveries.reduce((sum, d) => sum + (d.kg || 0), 0);
          total = (p.tons || 0) * 1000;
          unit = "kg";
        }

        return {
          id: p.id,
          supplier: p.supplier,
          item: p.type === 'beam' ? 'Sizing Beams' : (p.danier || 'Yarn'),
          delivered,
          total,
          unit,
          progress: total > 0 ? (delivered / total) * 100 : 0
        };
      }).filter(p => p.progress < 100).sort((a, b) => b.progress - a.progress);

      // Calculate pending sales deliveries
      const pendingSalesData = sales.map(s => {
        const sDeliveries = saleDeliveries.filter(d => d.saleId === s.id);
        const delivered = sDeliveries.reduce((sum, d) => sum + (d.takas || 0), 0);
        const total = s.takas || 0;

        return {
          id: s.id,
          party: s.party,
          delivered,
          total,
          progress: total > 0 ? (delivered / total) * 100 : 0,
          status: s.status,
          expectedDate: s.expectedPaymentDate
        };
      }).filter(s => s.progress < 100).sort((a, b) => {
        // Sort by progress first, then by status
        if (a.progress !== b.progress) return a.progress - b.progress;
        return a.status === 'pending' ? -1 : 1;
      });

      // --- Financial Health ---
      const pendingPayments = sales
        .filter(s => s.status === 'pending')
        .reduce((sum, s) => {
          if (s.type === 'advance_lots') {
            const sDeliveries = saleDeliveries.filter(d => d.saleId === s.id);
            const deliveredMeters = sDeliveries.reduce((dSum, d) => dSum + (d.meters || 0), 0);
            const value = deliveredMeters * (s.ratePerMeter || 0) * 1.05;
            return sum + value;
          }
          return sum + (s.total || 0);
        }, 0);

      setStats({
        beamsYesterday,
        takasProduced: yesterdayTakasProduced,
        takasInStock,
        foldedYesterday: yesterdayTakasFolded,
        salesMonth,
        purchasesMonth,
        productionMonthBeams,
        productionMonthTakas,
        pendingPayments,
        lowStockItems,
        pendingPurchases: pendingPurchasesData,
        pendingSales: pendingSalesData,
      });

      // Group all records by date
      const grouped: Record<string, any> = {};

      [...beams, ...takas, ...sales, ...purchases, ...transactions, ...stock].forEach(record => {
        const date = record.date;
        if (!grouped[date]) {
          grouped[date] = {
            beams: [],
            takas: [],
            sales: [],
            purchases: [],
            transactions: [],
            stock: []
          };
        }

        if ('warper' in record) grouped[date].beams.push(record);
        else if ('folded' in record) grouped[date].takas.push(record);
        else if ('party' in record) grouped[date].sales.push(record);
        else if ('supplier' in record) grouped[date].purchases.push(record);
        else if ('firm' in record) grouped[date].transactions.push(record);
        else if ('yarnCount' in record) grouped[date].stock.push(record);
      });

      // Sort by date descending
      const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const sortedGrouped: Record<string, any> = {};
      sortedDates.slice(0, 30).forEach(date => { // Limit to last 30 days of records
        sortedGrouped[date] = grouped[date];
      });

      setDailyRecords(sortedGrouped);
      setIsLoading(false);
    } catch (error) {
      console.error('[Dashboard] Error loading dashboard data:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    const unsubscribe = onDataChange(() => {
      loadData();
    });
    const interval = setInterval(loadData, 10000); // 10s refresh

    return () => {
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadData]);

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 dashboard-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold tracking-tight">{getGreeting()}</h2>
            <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 dashboard-actions">
          <RefreshTool onRefresh={loadData} />
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-[1.02] cursor-default">
          <div className="stat-icon stat-icon-green">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Today's Target</p>
            <p className="font-bold text-green-600 dark:text-green-400">On Track</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.02] cursor-default">
          <div className="stat-icon stat-icon-blue">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">{stats.productionMonthBeams} Beams</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-[1.02] cursor-default">
          <div className="stat-icon stat-icon-purple">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock Ready</p>
            <p className="font-bold text-purple-600 dark:text-purple-400">{stats.takasInStock} Takas</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-[1.02] cursor-default">
          <div className="stat-icon stat-icon-orange">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-bold text-orange-600 dark:text-orange-400">₹{(stats.salesMonth / 1000).toFixed(0)}K</p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {
        stats.lowStockItems.length > 0 && (
          <div className="dashboard-alert rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-semibold mb-3 relative z-10">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
              Low Stock Alerts
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {stats.lowStockItems.length} Items
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
              {stats.lowStockItems.map((item, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="dashboard-badge bg-white/80 dark:bg-black/30 border-yellow-400/50 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-default"
                >
                  <Package className="h-3 w-3 mr-1" />
                  {item.yarnCount}: {item.boxesAvailable} boxes left
                </Badge>
              ))}
            </div>
          </div>
        )
      }

      {/* Pending Tasks & Tracking Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Purchase Tracking */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Purchase Deliveries Tracking
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-1">
                {stats.pendingPurchases.length} Pending
              </Badge>
            </div>
            <CardDescription className="text-sm">Yarn and Beam shipments currently in-transit</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[350px] overflow-auto">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px] text-sm font-bold text-foreground">Supplier</TableHead>
                    <TableHead className="text-sm font-bold text-foreground">Item</TableHead>
                    <TableHead className="text-right text-sm font-bold text-foreground">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.pendingPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-base">
                        All purchase deliveries complete
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.pendingPurchases.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-base py-3">{p.supplier}</TableCell>
                        <TableCell className="text-sm">{p.item}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 min-w-[140px]">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{p.delivered.toLocaleString()} / {p.total.toLocaleString()} {p.unit}</span>
                              <span>{Math.round(p.progress)}%</span>
                            </div>
                            <Progress value={p.progress} className="h-2" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Sales Tracking */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                Sales & Delivery Pending
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs py-1">
                {stats.pendingSales.length} Tasks
              </Badge>
            </div>
            <CardDescription className="text-sm">Tracking delivery and payment status for active sales</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[350px] overflow-auto">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px] text-sm font-bold text-foreground">Party</TableHead>
                    <TableHead className="text-sm font-bold text-foreground">Delivery</TableHead>
                    <TableHead className="text-right text-sm font-bold text-foreground">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.pendingSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-base">
                        No pending sales tasks
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.pendingSales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold text-base py-3">
                          {s.party}
                          <div className="text-xs text-muted-foreground opacity-80 mt-1">Due: {s.expectedDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{s.delivered} / {s.total} Lots</span>
                              <span>{Math.round(s.progress)}%</span>
                            </div>
                            <Progress value={s.progress} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={s.status === 'paid' ? 'default' : 'destructive'}
                            className="text-xs px-2 py-0.5 h-6 font-bold"
                          >
                            {s.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Financials Section */}
      <div className="space-y-4">
        <h3 className="dashboard-section-header text-lg font-semibold cursor-default">
          <DollarSign className="h-5 w-5 text-green-500" />
          Financial Health (This Month)
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="dashboard-stat-card card-green rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales (Month)</CardTitle>
              <div className="stat-icon stat-icon-green">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                <AnimatedCounter value={stats.salesMonth} prefix="₹" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <TrendIndicator positive />
                Total revenue this month
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card card-blue rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases (Month)</CardTitle>
              <div className="stat-icon stat-icon-blue">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                <AnimatedCounter value={Math.round(stats.purchasesMonth * 100) / 100} suffix=" tons" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Yarn bought this month
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card card-red rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Pending Receivables</CardTitle>
              <div className="stat-icon stat-icon-red">
                <AlertCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                <AnimatedCounter value={stats.pendingPayments} prefix="₹" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <TrendIndicator positive={false} />
                Total unpaid sales
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Production Section */}
      <div className="space-y-4">
        <h3 className="dashboard-section-header text-lg font-semibold cursor-default">
          <Activity className="h-5 w-5 text-blue-500" />
          Production & Inventory
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="dashboard-stat-card card-cyan rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beams (Yesterday)</CardTitle>
              <div className="stat-icon stat-icon-cyan">
                <Wind className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                <AnimatedCounter value={stats.beamsYesterday} />
              </div>
              <div className="text-xs text-muted-foreground mt-2 quick-stat-row">
                <span className="flex justify-between">
                  <span>Month Total:</span>
                  <span className="font-semibold">{stats.productionMonthBeams}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card card-purple rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Takas Produced</CardTitle>
              <div className="stat-icon stat-icon-purple">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                <AnimatedCounter value={stats.takasProduced} />
                <span className="text-xs font-normal text-muted-foreground ml-2">(Yesterday)</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2 quick-stat-row">
                <span className="flex justify-between">
                  <span>Month Total:</span>
                  <span className="font-semibold">{stats.productionMonthTakas}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card card-orange rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Takas Folded</CardTitle>
              <div className="stat-icon stat-icon-orange">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                <AnimatedCounter value={stats.foldedYesterday} />
                <span className="text-xs font-normal text-muted-foreground ml-2">(Yesterday)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-stat-card card-green rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Takas in Stock</CardTitle>
              <div className="stat-icon stat-icon-green">
                <Boxes className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                <AnimatedCounter value={stats.takasInStock} />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <TrendIndicator positive />
                Ready for dispatch
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Records */}
      <Card className="mt-8 dashboard-records-card rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Records Log
          </CardTitle>
          <CardDescription>Recent activity breakdown by date</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {Object.keys(dailyRecords).length === 0 ? (
            <div className="text-center py-12">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="dashboard-skeleton h-12 w-full"></div>
                  <div className="dashboard-skeleton h-12 w-full"></div>
                  <div className="dashboard-skeleton h-12 w-full"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">No records found</p>
                </div>
              )}
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-1">
              {Object.entries(dailyRecords).map(([date, records]) => {
                const totalRecords = records.beams.length + records.takas.length + records.sales.length +
                  records.purchases.length + records.transactions.length + records.stock.length;

                return (
                  <AccordionItem key={date} value={date} className="dashboard-accordion-item border rounded-lg px-2">
                    <AccordionTrigger className="hover:no-underline dashboard-accordion-trigger py-3">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold">{new Date(date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <Badge variant="secondary" className="dashboard-badge ml-2">
                          <Activity className="h-3 w-3 mr-1" />
                          {totalRecords} Activities
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="dashboard-accordion-content pb-4">
                      <div className="space-y-4 pt-2">
                        {/* Summary Row for the Day */}
                        <div className="flex gap-2 text-xs text-muted-foreground mb-4 overflow-x-auto pb-2">
                          {records.sales.length > 0 && (
                            <span className="whitespace-nowrap bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-1 hover:scale-105 transition-transform">
                              <ShoppingCart className="h-3 w-3" />
                              Sales: ₹{records.sales.reduce((s: any, i: any) => s + i.total, 0).toLocaleString()}
                            </span>
                          )}
                          {records.beams.length > 0 && (
                            <span className="whitespace-nowrap bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1 hover:scale-105 transition-transform">
                              <Wind className="h-3 w-3" />
                              Beams: {records.beams.length}
                            </span>
                          )}
                          {records.takas.length > 0 && (
                            <span className="whitespace-nowrap bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/10 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1 hover:scale-105 transition-transform">
                              <Package className="h-3 w-3" />
                              Stock Update
                            </span>
                          )}
                        </div>

                        {records.beams.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                              <Wind className="h-4 w-4" />
                              Beams Produced
                            </h4>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {records.beams.map((beam: any) => (
                                <div key={beam.id} className="dashboard-record-item text-sm bg-gradient-to-r from-muted/50 to-transparent border p-3 rounded-lg">
                                  <div className="font-medium">{beam.warper}</div>
                                  <div className="text-muted-foreground flex justify-between mt-1">
                                    <span>Beam #{beam.beamNo}</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">{beam.noOfTakas} takas</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {records.takas.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                              <Package className="h-4 w-4" />
                              Fabric Stock
                            </h4>
                            <div className="space-y-2">
                              {records.takas.map((taka: any) => (
                                <div key={taka.id} className="dashboard-record-item text-sm bg-gradient-to-r from-muted/50 to-transparent border p-3 rounded-lg flex justify-between">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Produced: <strong>{taka.available}</strong>
                                  </span>
                                  <span>Folded: <strong>{taka.folded}</strong></span>
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">Rem: {taka.remaining}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {records.sales.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                              <ShoppingCart className="h-4 w-4" />
                              Sales
                            </h4>
                            <div className="space-y-2">
                              {records.sales.map((sale: any) => (
                                <div key={sale.id} className="dashboard-record-item text-sm bg-gradient-to-r from-muted/50 to-transparent border p-3 rounded-lg flex justify-between items-center">
                                  <div>
                                    <div className="font-medium">{sale.party}</div>
                                    <div className="text-xs text-muted-foreground">{sale.takas} takas</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-600 dark:text-green-400">₹{sale.total.toLocaleString()}</div>
                                    <Badge variant={sale.status === 'paid' ? 'default' : 'outline'} className="text-[10px] h-5">
                                      {sale.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {records.purchases.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                              <DollarSign className="h-4 w-4" />
                              Purchases
                            </h4>
                            <div className="space-y-2">
                              {records.purchases.map((purchase: any) => (
                                <div key={purchase.id} className="dashboard-record-item text-sm bg-gradient-to-r from-muted/50 to-transparent border p-3 rounded-lg">
                                  <div className="flex justify-between font-medium">
                                    <span>{purchase.supplier}</span>
                                    <span className="text-orange-600 dark:text-orange-400">₹{purchase.total.toLocaleString()}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {purchase.yarnType} • {purchase.tons} tons
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {records.transactions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <TrendingUp className="h-4 w-4" />
                              Transactions
                            </h4>
                            <div className="space-y-2">
                              {records.transactions.map((transaction: any) => (
                                <div key={transaction.id} className="dashboard-record-item text-sm bg-gradient-to-r from-muted/50 to-transparent border p-3 rounded-lg flex justify-between">
                                  <span>{transaction.firm} ({transaction.type})</span>
                                  <span className="font-medium">₹{transaction.amount.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {records.stock.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                              <Package className="h-4 w-4" />
                              Yarn Stock Check
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {records.stock.map((stockItem: any) => (
                                <div key={stockItem.id} className="dashboard-record-item text-sm bg-gradient-to-br from-yellow-50 to-transparent dark:from-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-3 rounded-lg text-center">
                                  <div className="font-bold text-2xl text-yellow-600 dark:text-yellow-400">{stockItem.boxesAvailable}</div>
                                  <div className="text-xs text-muted-foreground">Boxes ({stockItem.yarnCount})</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Footer System Status */}
      <div className="pt-8 border-t dashboard-status-section">
        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Operations & Status
        </h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DatabaseStatus />
          <ManualBackupRestore />
          <CloudBackup />
        </div>
      </div>

    </div >
  );
};

export default Index;
