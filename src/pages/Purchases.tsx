import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePurchases, usePurchaseDeliveries, useQualities } from "@/hooks/useAsyncStorage";
import type { Purchase, PurchaseDelivery } from "@/lib/types";
import { Plus, Pencil, Trash2, ArrowUpDown, ShoppingBag, Scale, Coins, Package, Loader2, Truck, History, Ruler, Layers, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PurchaseWithDelivery extends Purchase {
  deliveredKg: number;
  remainingKg: number;
}

export default function Purchases() {
  const { data: rawPurchases, loading: loadingPurchases, add, update, delete: deleteRecord } = usePurchases();
  const { data: rawDeliveries, loading: loadingDeliveries, add: addDelivery, delete: deleteDelivery } = usePurchaseDeliveries();

  const { data: rawQualities } = useQualities();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithDelivery | null>(null);

  const [newDelivery, setNewDelivery] = useState({
    date: new Date().toISOString().split('T')[0],
    kg: 0,
    numberOfBeams: 0,
    beamNo: "",
    weight: 0,
    meters: 0,
    notes: ""
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: "",
    type: "yarn" as "yarn" | "beam",
    // Yarn specific
    danier: "",
    kg: 0,
    ratePerKilo: 0,
    // Beam specific
    numberOfBeams: 0,
    ratePerBeam: 0,
    qualityId: "",
    tars: 0,
    meters: 0,
  });
  const { toast } = useToast();

  const loading = loadingPurchases || loadingDeliveries;

  const purchases = useMemo(() => {
    // Map deliveries to purchases
    const purchasesWithDelivery = rawPurchases.map(p => {
      const pDeliveries = rawDeliveries.filter(d => d.purchaseId === p.id);

      if (p.type === 'beam') {
        const deliveredBeams = pDeliveries.reduce((sum, d) => sum + (d.numberOfBeams || 1), 0);
        return {
          ...p,
          deliveredKg: deliveredBeams,
          remainingKg: (p.numberOfBeams || 0) - deliveredBeams
        };
      } else {
        const deliveredKg = pDeliveries.reduce((sum, d) => sum + (d.kg || 0), 0);
        const totalKg = (p.tons || 0) * 1000;
        return {
          ...p,
          deliveredKg,
          remainingKg: totalKg - deliveredKg
        };
      }
    });

    // Sort: Beams first, then Yarn by Danier
    return purchasesWithDelivery.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'beam' ? -1 : 1;

      if (a.type === 'yarn' && b.type === 'yarn') {
        const getDanierValue = (danier: string) => {
          const match = danier?.match(/\d+/);
          return match ? parseInt(match[0]) : 0;
        };
        return getDanierValue(a.danier || "") - getDanierValue(b.danier || "");
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [rawPurchases, rawDeliveries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let purchase: Purchase;

      if (formData.type === 'yarn') {
        const amountBeforeGST = formData.kg * formData.ratePerKilo;
        const total = amountBeforeGST * 1.05;
        const tons = formData.kg / 1000;
        purchase = {
          id: editingId || Date.now().toString(),
          date: formData.date,
          supplier: formData.supplier,
          type: 'yarn',
          danier: formData.danier,
          tons: tons,
          yarnType: formData.danier,
          ratePerTon: formData.ratePerKilo,
          total,
        };
      } else {
        const total = formData.numberOfBeams * formData.ratePerBeam;
        purchase = {
          id: editingId || Date.now().toString(),
          date: formData.date,
          supplier: formData.supplier,
          type: 'beam',
          numberOfBeams: formData.numberOfBeams,
          ratePerBeam: formData.ratePerBeam,
          qualityId: formData.qualityId,
          tars: formData.tars,
          meters: formData.meters,
          total,
        };
      }

      if (editingId) {
        await update(editingId, purchase);
        toast({ title: "Purchase updated successfully" });
      } else {
        await add(purchase);
        toast({ title: "Purchase added successfully" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save purchase record.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchase) return;

    setSubmitting(true);
    try {
      const delivery: PurchaseDelivery = {
        id: Date.now().toString(),
        purchaseId: selectedPurchase.id,
        date: newDelivery.date,
        kg: selectedPurchase.type === 'yarn' ? newDelivery.kg : undefined,
        numberOfBeams: selectedPurchase.type === 'beam' ? (newDelivery.numberOfBeams || 1) : undefined,
        beamNo: selectedPurchase.type === 'beam' ? newDelivery.beamNo : undefined,
        weight: selectedPurchase.type === 'beam' ? newDelivery.weight : undefined,
        meters: selectedPurchase.type === 'beam' ? newDelivery.meters : undefined,
        notes: newDelivery.notes
      };

      await addDelivery(delivery);
      toast({ title: "Delivery recorded successfully" });
      setNewDelivery({
        date: new Date().toISOString().split('T')[0],
        kg: 0,
        numberOfBeams: 0,
        beamNo: "",
        weight: 0,
        meters: 0,
        notes: ""
      });
      // Update selected purchase to reflect new delivery
      const updatedDelivered = selectedPurchase.deliveredKg + (selectedPurchase.type === 'beam' ? (delivery.numberOfBeams || 1) : delivery.kg || 0);
      const totalToDeliver = selectedPurchase.type === 'beam' ? (selectedPurchase.numberOfBeams || 0) : ((selectedPurchase.tons || 0) * 1000);

      setSelectedPurchase({
        ...selectedPurchase,
        deliveredKg: updatedDelivered,
        remainingKg: totalToDeliver - updatedDelivered
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record delivery.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    if (confirm("Are you sure you want to delete this delivery record?")) {
      try {
        await deleteDelivery(deliveryId);
        toast({ title: "Delivery record deleted" });

        // Refresh selected purchase
        if (selectedPurchase) {
          const removedDelivery = rawDeliveries.find(d => d.id === deliveryId);
          if (removedDelivery) {
            const decrement = selectedPurchase.type === 'beam' ? (removedDelivery.numberOfBeams || 1) : (removedDelivery.kg || 0);
            const updatedDelivered = selectedPurchase.deliveredKg - decrement;
            const totalToDeliver = selectedPurchase.type === 'beam' ? (selectedPurchase.numberOfBeams || 0) : ((selectedPurchase.tons || 0) * 1000);

            setSelectedPurchase({
              ...selectedPurchase,
              deliveredKg: updatedDelivered,
              remainingKg: totalToDeliver - updatedDelivered
            });
          }
        }
      } catch (error) {
        toast({ title: "Error deleting delivery", variant: "destructive" });
      }
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setFormData({
      date: purchase.date,
      supplier: purchase.supplier,
      type: purchase.type || 'yarn',
      danier: purchase.danier || "",
      kg: (purchase.tons || 0) * 1000,
      ratePerKilo: purchase.ratePerTon || 0,
      numberOfBeams: purchase.numberOfBeams || 0,
      ratePerBeam: purchase.ratePerBeam || 0,
      qualityId: purchase.qualityId || "",
      tars: purchase.tars || 0,
      meters: purchase.meters || 0,
    });
    setEditingId(purchase.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this purchase? All associated deliveries will also be lost.")) {
      try {
        setSubmitting(true);
        // Delete associated deliveries first
        const associatedDeliveries = rawDeliveries.filter(d => d.purchaseId === id);
        for (const d of associatedDeliveries) {
          await deleteDelivery(d.id);
        }
        await deleteRecord(id);
        toast({ title: "Purchase deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete purchase.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      supplier: "",
      type: "yarn",
      danier: "",
      kg: 0,
      ratePerKilo: 0,
      numberOfBeams: 0,
      ratePerBeam: 0,
      qualityId: "",
      tars: 0,
      meters: 0,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const yarnPurchases = purchases.filter(p => !p.type || p.type === 'yarn');
  const beamPurchases = purchases.filter(p => p.type === 'beam');

  const totalYarnKg = yarnPurchases.reduce((sum, p) => sum + (p.tons || 0) * 1000, 0);
  const totalYarnDeliveredKg = yarnPurchases.reduce((sum, p) => sum + p.deliveredKg, 0);

  const totalBeams = beamPurchases.reduce((sum, p) => sum + (p.numberOfBeams || 0), 0);
  const totalBeamsDelivered = beamPurchases.reduce((sum, p) => sum + p.deliveredKg, 0);

  const totalAmount = purchases.reduce((sum, p) => sum + p.total, 0);

  // Group yarn purchases by danier and rate (only show active ones)
  const danierTotals = yarnPurchases.reduce((acc, p) => {
    const key = `${p.danier}|${p.ratePerTon}`;
    if (!acc[key]) {
      acc[key] = { danier: p.danier || "", rate: p.ratePerTon || 0, kg: 0, deliveredKg: 0 };
    }
    acc[key].kg += (p.tons || 0) * 1000;
    acc[key].deliveredKg += p.deliveredKg;
    return acc;
  }, {} as Record<string, { danier: string; rate: number; kg: number; deliveredKg: number }>);

  // Filter out fully delivered items automatically
  const activeDanierTotals = Object.values(danierTotals).filter(t => t.deliveredKg < t.kg);

  const columns = useMemo<ColumnDef<PurchaseWithDelivery>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="font-semibold text-xs"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <span className="font-medium text-base">{row.original.date}</span>
      },
      {
        accessorKey: "supplier",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="font-semibold text-xs"
            >
              Supplier
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <span className="font-semibold">{row.original.supplier}</span>
      },
      {
        header: "Item/Type",
        accessorFn: (row) => row.type === 'beam' ? 'Beam' : row.danier,
        cell: ({ row }) => {
          const p = row.original;
          if (p.type === 'beam') {
            const quality = rawQualities.find(q => q.id === p.qualityId);
            return (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-base flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Layers className="h-4 w-4" /> Beam
                </span>
                <span className="text-xs font-medium text-muted-foreground">{quality?.name || 'Sizing Beam'}</span>
              </div>
            )
          }
          return (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-base flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Package className="h-4 w-4" /> Yarn
              </span>
              <span className="text-xs font-medium text-muted-foreground">{p.danier}</span>
            </div>
          )
        }
      },
      {
        header: "Ordered",
        accessorKey: "tons",
        cell: ({ row }) => {
          const p = row.original;
          if (p.type === 'beam') return <span className="font-bold text-sm">{p.numberOfBeams} beams</span>;
          return <span className="font-bold text-sm">{(p.tons || 0) * 1000} kg</span>;
        }
      },
      {
        header: "Delivered",
        accessorKey: "deliveredKg",
        cell: ({ row }) => {
          const p = row.original;
          const total = p.type === 'beam' ? (p.numberOfBeams || 0) : ((p.tons || 0) * 1000);
          const unit = p.type === 'beam' ? 'beams' : 'kg';
          const percentage = Math.min(100, (p.deliveredKg / total) * 100);
          return (
            <div className="flex flex-col gap-2 w-[160px]">
              <div className="flex justify-between items-center px-0.5">
                <span className="font-bold text-sm">{p.deliveredKg} <span className="text-[10px] text-muted-foreground font-normal">{unit}</span></span>
                <span className="text-[10px] font-bold bg-muted px-1.5 rounded-sm">{Math.round(percentage)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-muted/20">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${percentage >= 100 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        }
      },
      {
        header: "Rate",
        accessorKey: "ratePerTon",
        cell: ({ row }) => {
          const p = row.original;
          if (p.type === 'beam') return <span className="font-semibold text-sm">₹{(p.ratePerBeam || 0).toFixed(2)}/beam</span>;
          return <span className="font-semibold text-sm">₹{(p.ratePerTon || 0).toFixed(2)}/kg</span>;
        }
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => <span className="font-bold text-lg text-primary">₹{Math.round(row.original.total).toLocaleString()}</span>
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const purchase = row.original;
          return (
            <div className="flex gap-1.5">
              <Button size="icon" variant="secondary" className="h-8 w-8" title="Manage Deliveries" onClick={() => {
                setSelectedPurchase(purchase);
                setDeliveryDialogOpen(true);
              }}>
                <Truck className="h-4 w-4 text-blue-600" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8" title="Edit" onClick={() => handleEdit(purchase)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 border-destructive/20 hover:bg-destructive/10" title="Delete" onClick={() => handleDelete(purchase.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rawDeliveries]
  );

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Purchase Record</h2>
          <p className="text-muted-foreground">Track yarn and sizing beam procurement</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }} className="btn-animated">
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Cancel" : "New Purchase"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 card-grid">
        <Card className="animated-card stat-card stat-card-blue border-none shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-blue-600/70">Total Ordered</CardTitle>
            <div className="icon-container icon-blue">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{(totalYarnKg / 1000).toFixed(3)} <span className="text-xs font-medium text-muted-foreground">tons</span></p>
              {totalBeams > 0 && <p className="text-sm font-semibold text-blue-500/80">{totalBeams} Beams</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="animated-card stat-card stat-card-purple border-none shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-purple-600/70">Total Delivered</CardTitle>
            <div className="icon-container icon-purple">
              <Truck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{(totalYarnDeliveredKg / 1000).toFixed(3)} <span className="text-xs font-medium text-muted-foreground">tons</span></p>
              {totalBeams > 0 && <p className="text-sm font-semibold text-purple-500/80">{totalBeamsDelivered} Beams</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="animated-card stat-card stat-card-green border-none shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-green-600/70">Total Amount</CardTitle>
            <div className="icon-container icon-green">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">₹{Math.round(totalAmount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{purchases.length} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Denier & Rate wise breakdown (Active only) */}
      {activeDanierTotals.length > 0 && (
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="pb-4 bg-muted/30">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Active Orders Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeDanierTotals
                .sort((a, b) => {
                  const getDanierValue = (danier: string) => {
                    const match = danier.match(/\d+/);
                    return match ? parseInt(match[0]) : 0;
                  };
                  return getDanierValue(a.danier) - getDanierValue(b.danier) || a.rate - b.rate;
                })
                .map((totals) => (
                  <div key={`${totals.danier}-${totals.rate}`} className="p-4 border rounded-xl bg-card hover:border-primary/30 transition-all shadow-sm hover:shadow-md cursor-default">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm">{totals.danier}</p>
                        <p className="text-sm font-semibold text-primary mt-0.5">₹{totals.rate.toFixed(2)} / kg</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        ACTIVE
                      </Badge>
                    </div>

                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">Ordered</p>
                        <p className="text-lg font-bold">{totals.kg.toFixed(0)} <span className="text-xs font-medium text-muted-foreground">kg</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1">Delivered</p>
                        <p className="text-lg font-bold text-purple-600">{totals.deliveredKg.toFixed(0)} <span className="text-xs font-medium text-muted-foreground">kg</span></p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(100, (totals.deliveredKg / totals.kg) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {Math.max(0, totals.kg - totals.deliveredKg).toFixed(0)} kg pending
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {Math.round((totals.deliveredKg / totals.kg) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isAdding && (
        <Card className="border border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-lg font-bold">{editingId ? "Edit Purchase Record" : "Create New Purchase"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Purchase Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'yarn' | 'beam') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yarn">Yarn Purchase</SelectItem>
                      <SelectItem value="beam">Sizing Beam Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Supplier Name</label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g., Reliance Industries"
                    required
                  />
                </div>

                {formData.type === 'yarn' ? (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Denier</label>
                    <Input
                      value={formData.danier}
                      onChange={(e) => setFormData({ ...formData, danier: e.target.value })}
                      placeholder="e.g., 50/48 SD"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Quality</label>
                    <Select
                      value={formData.qualityId}
                      onValueChange={(value) => setFormData({ ...formData, qualityId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawQualities.map(q => (
                          <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {formData.type === 'yarn' ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Order Quantity (kg)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.kg}
                      onChange={(e) => setFormData({ ...formData, kg: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Rate per Kilo (₹)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.ratePerKilo}
                      onChange={(e) => setFormData({ ...formData, ratePerKilo: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">No. of Beams</label>
                      <Input
                        type="number"
                        value={formData.numberOfBeams}
                        onChange={(e) => setFormData({ ...formData, numberOfBeams: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Rate per Beam (₹)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.ratePerBeam}
                        onChange={(e) => setFormData({ ...formData, ratePerBeam: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Tars (Ends)</label>
                      <Input
                        type="number"
                        value={formData.tars}
                        onChange={(e) => setFormData({ ...formData, tars: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Approx Meters/Beam</label>
                      <Input
                        type="number"
                        value={formData.meters}
                        onChange={(e) => setFormData({ ...formData, meters: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs font-medium text-primary/60 mb-1">Total Estimated Amount {formData.type === 'yarn' ? '(incl. 5% GST)' : ''}</p>
                <p className="text-2xl font-bold text-primary">
                  ₹{Math.round(
                    formData.type === 'yarn'
                      ? (formData.kg * formData.ratePerKilo) * 1.05
                      : (formData.numberOfBeams * formData.ratePerBeam)
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Record" : "Confirm Purchase"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Discard</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold">Active & Past Purchases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={purchases}
            searchKey="supplier"
            rowClassName={() => "hover:bg-primary/5 transition-colors cursor-default border-b-2 border-muted/30"}
          />
        </CardContent>
      </Card>


      {/* Delivery Management Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Deliveries</DialogTitle>
            <DialogDescription>
              Supplier: {selectedPurchase?.supplier} | Item: {selectedPurchase?.danier}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Summary Row */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Ordered</p>
                <p className="text-lg font-bold">
                  {selectedPurchase?.type === 'beam'
                    ? `${selectedPurchase?.numberOfBeams} beams`
                    : `${(selectedPurchase?.tons || 0) * 1000} kg`}
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-purple-600">Delivered</p>
                <p className="text-lg font-bold text-purple-600">
                  {selectedPurchase?.deliveredKg} {selectedPurchase?.type === 'beam' ? 'beams' : 'kg'}
                </p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-orange-600">Remaining</p>
                <p className="text-lg font-bold text-orange-600">
                  {selectedPurchase?.remainingKg} {selectedPurchase?.type === 'beam' ? 'beams' : 'kg'}
                </p>
              </div>
            </div>

            {/* Add New Delivery Form */}
            <form onSubmit={handleAddDelivery} className="p-4 border rounded-lg bg-card space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Record New Delivery
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={newDelivery.date}
                    onChange={e => setNewDelivery({ ...newDelivery, date: e.target.value })}
                    required
                  />
                </div>

                {selectedPurchase?.type === 'yarn' ? (
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Quantity (kg)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newDelivery.kg}
                      onChange={e => setNewDelivery({ ...newDelivery, kg: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">No. of Beams</label>
                      <Input
                        type="number"
                        min="1"
                        value={newDelivery.numberOfBeams || 1}
                        onChange={e => setNewDelivery({ ...newDelivery, numberOfBeams: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Beam No (Optional)</label>
                      <Input
                        value={newDelivery.beamNo}
                        onChange={e => setNewDelivery({ ...newDelivery, beamNo: e.target.value })}
                        placeholder="B-123"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Total Weight (kg)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newDelivery.weight}
                        onChange={e => setNewDelivery({ ...newDelivery, weight: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Total Meters</label>
                      <Input
                        type="number"
                        value={newDelivery.meters}
                        onChange={e => setNewDelivery({ ...newDelivery, meters: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
                  <Input
                    value={newDelivery.notes}
                    onChange={e => setNewDelivery({ ...newDelivery, notes: e.target.value })}
                    placeholder="Challan No, etc."
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Delivery
              </Button>
            </form>

            {/* Delivery History */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" /> Delivery History
              </h4>
              <div className="max-h-[200px] overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawDeliveries
                      .filter(d => d.purchaseId === selectedPurchase?.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(delivery => (
                        <TableRow key={delivery.id}>
                          <TableCell className="py-2">{delivery.date}</TableCell>
                          <TableCell className="py-2 font-bold text-xs uppercase">
                            {selectedPurchase?.type === 'beam'
                              ? `${delivery.numberOfBeams || 1} Beams ${delivery.beamNo ? `(BN: ${delivery.beamNo})` : ''} | ${delivery.weight}kg | ${delivery.meters}m`
                              : `${delivery.kg} kg`}
                          </TableCell>
                          <TableCell className="py-2 text-muted-foreground text-xs">{delivery.notes}</TableCell>
                          <TableCell className="py-2 text-right">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDeleteDelivery(delivery.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {rawDeliveries.filter(d => d.purchaseId === selectedPurchase?.id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-sm italic">
                          No deliveries recorded yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeliveryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
