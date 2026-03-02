import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSales, useQualities, useTakas, useSaleDeliveries } from "@/hooks/useAsyncStorage";
import type { Sale, Quality, Taka, SaleDelivery } from "@/lib/types";
import { Plus, Pencil, Trash2, ArrowUpDown, ShoppingBag, Scale, Coins, Package, Loader2, Truck, History, Ruler, Layers, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils"; // Assuming cn utility is available

interface SaleWithDelivery extends Sale {
  deliveredTakas: number;
  deliveredMeters: number;
  remainingTakas: number;
  remainingMeters: number;
}

export default function Sales() {
  const { data: sales, loading: sLoading, add, update, delete: deleteRecord } = useSales();
  const { data: deliveries, loading: dLoading, add: addDelivery, delete: deleteDelivery } = useSaleDeliveries();
  const { data: rawQualities, loading: qLoading } = useQualities();
  const { data: takas, loading: tLoading, update: updateTaka } = useTakas();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    party: "",
    takas: 0,
    meters: 0,
    ratePerMeter: 0,
    paymentTerms: 45,
    qualityId: "",
    type: 'spot' as 'spot' | 'advance_meters' | 'advance_lots',
    unitMeters: 0,
    expectedPaymentDate: new Date().toISOString().split('T')[0], // Added for new form structure
  });

  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleWithDelivery | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    paymentMethod: 'RTGS' as 'RTGS' | 'Cheque' | 'Cash' | 'Other',
    paidAmount: 0,
    billNumbers: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentNotes: ""
  });
  const [newDelivery, setNewDelivery] = useState({
    date: new Date().toISOString().split('T')[0],
    takas: 0,
    meters: 0,
    notes: ""
  });
  const { toast } = useToast();

  const loading = sLoading || qLoading || tLoading || dLoading;

  const calculateSale = (meters: number, rate: number) => {
    const amount = meters * rate;
    const tax = amount * 0.05;
    return { amount, tax, total: amount + tax };
  };

  const calculateExpectedDate = (date: string, terms: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + terms);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // For fixed-lot advance deals, initial meters/amount is 0. 
      // Total will grow as deliveries are added.
      const metersToStore = formData.type === 'advance_lots' ? 0 : formData.meters;
      const { amount, tax, total } = calculateSale(metersToStore, formData.ratePerMeter);
      // const expectedPaymentDate = calculateExpectedDate(formData.date, formData.paymentTerms); // Removed, now directly from form

      const sale: Sale = {
        id: editingId || Date.now().toString(),
        date: formData.date,
        party: formData.party,
        takas: formData.takas,
        meters: metersToStore,
        ratePerMeter: formData.ratePerMeter,
        paymentTerms: formData.paymentTerms,
        amount,
        tax,
        total,
        expectedPaymentDate: formData.expectedPaymentDate, // Use form value
        status: 'pending',
        type: formData.type,
        qualityId: formData.qualityId || undefined,
      };

      if (editingId) {
        // When editing, we need to restore the old quantity first if quality was set
        const oldSale = sales.find(s => s.id === editingId);
        if (oldSale?.qualityId) {
          await updateTakaStock(oldSale.qualityId, oldSale.takas, 'add');
        }
        await update(editingId, sale);

        // Deduct takas from stock if quality is specified
        if (formData.qualityId) {
          await updateTakaStock(formData.qualityId, formData.takas, 'subtract');
          const quality = rawQualities.find(q => q.id === formData.qualityId);
          toast({
            title: "Sale updated successfully",
            description: `${formData.takas} takas of ${quality?.name || 'selected quality'} deducted from stock`
          });
        } else {
          toast({ title: "Sale updated successfully" });
        }
      } else {
        await add(sale);

        // Deduct takas from stock if quality is specified
        if (formData.qualityId) {
          await updateTakaStock(formData.qualityId, formData.takas, 'subtract');
          const quality = rawQualities.find(q => q.id === formData.qualityId);
          toast({
            title: "Sale added successfully",
            description: `${formData.takas} takas of ${quality?.name || 'selected quality'} deducted from stock`
          });
        } else {
          toast({ title: "Sale added successfully" });
        }
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sale record.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    setSubmitting(true);
    try {
      const delivery: SaleDelivery = {
        id: Date.now().toString(),
        saleId: selectedSale.id,
        date: newDelivery.date,
        takas: newDelivery.takas,
        meters: newDelivery.meters,
        notes: newDelivery.notes
      };

      await addDelivery(delivery);
      toast({ title: "Delivery recorded successfully" });
      setNewDelivery({
        date: new Date().toISOString().split('T')[0],
        takas: 0,
        meters: 0,
        notes: ""
      });

      // Update selected sale view
      const updatedDeliveredTakas = selectedSale.deliveredTakas + delivery.takas;
      const updatedDeliveredMeters = selectedSale.deliveredMeters + delivery.meters;
      setSelectedSale({
        ...selectedSale,
        deliveredTakas: updatedDeliveredTakas,
        deliveredMeters: updatedDeliveredMeters,
        remainingTakas: selectedSale.takas - updatedDeliveredTakas,
        remainingMeters: selectedSale.meters - updatedDeliveredMeters
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

        // Refresh selected sale view
        if (selectedSale) {
          const removedDelivery = deliveries.find(d => d.id === deliveryId);
          if (removedDelivery) {
            const updatedDeliveredTakas = selectedSale.deliveredTakas - removedDelivery.takas;
            const updatedDeliveredMeters = selectedSale.deliveredMeters - removedDelivery.meters;
            setSelectedSale({
              ...selectedSale,
              deliveredTakas: updatedDeliveredTakas,
              deliveredMeters: updatedDeliveredMeters,
              remainingTakas: selectedSale.takas - updatedDeliveredTakas,
              remainingMeters: selectedSale.meters - updatedDeliveredMeters
            });
          }
        }
      } catch (error) {
        toast({ title: "Error deleting delivery", variant: "destructive" });
      }
    }
  };

  // Helper function to update taka stock
  const updateTakaStock = async (qualityId: string, quantity: number, operation: 'add' | 'subtract') => {
    // Find the most recent taka record for this quality
    const takaRecords = takas
      .filter(t => t.qualityId === qualityId)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (takaRecords.length > 0) {
      const latestTaka = takaRecords[0];
      const adjustment = operation === 'subtract' ? -quantity : quantity;
      const updatedTaka = {
        ...latestTaka,
        remaining: latestTaka.remaining + adjustment,
      };
      await updateTaka(latestTaka.id, updatedTaka);
    }
  };

  const handleEdit = (sale: Sale) => {
    setFormData({
      date: sale.date,
      party: sale.party,
      takas: sale.takas,
      meters: sale.meters,
      ratePerMeter: sale.ratePerMeter,
      paymentTerms: sale.paymentTerms,
      qualityId: sale.qualityId || "",
      type: (sale.type as any) === 'advance' ? 'advance_meters' : (sale.type || 'spot'),
      unitMeters: sale.takas > 0 ? sale.meters / sale.takas : 0,
      expectedPaymentDate: sale.expectedPaymentDate, // Set for editing
    });
    setEditingId(sale.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      setSubmitting(true);
      try {
        const sale = sales.find(s => s.id === id);

        // Restore takas to stock if quality was specified
        if (sale?.qualityId) {
          await updateTakaStock(sale.qualityId, sale.takas, 'add');
        }

        // Delete associated deliveries
        const associatedDeliveries = deliveries.filter(d => d.saleId === id);
        for (const d of associatedDeliveries) {
          await deleteDelivery(d.id);
        }

        await deleteRecord(id);

        if (sale?.qualityId) {
          const quality = rawQualities.find(q => q.id === sale.qualityId);
          toast({
            title: "Sale deleted successfully",
            description: `${sale.takas} takas of ${quality?.name || 'selected quality'} restored to stock`
          });
        } else {
          toast({ title: "Sale deleted successfully" });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete sale.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const openPaymentDialog = (sale: SaleWithDelivery) => {
    setSelectedSale(sale);
    setPaymentFormData({
      paymentMethod: sale.paymentMethod || 'RTGS',
      paidAmount: sale.paidAmount || sale.total,
      billNumbers: sale.billNumbers || "",
      paymentDate: sale.paymentDate || new Date().toISOString().split('T')[0],
      paymentNotes: sale.paymentNotes || ""
    });
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSale) return;

    setSubmitting(true);
    try {
      const updatedSale: Sale = {
        ...selectedSale,
        status: 'paid',
        paymentMethod: paymentFormData.paymentMethod,
        paidAmount: paymentFormData.paidAmount,
        billNumbers: paymentFormData.billNumbers,
        paymentDate: paymentFormData.paymentDate,
        paymentNotes: paymentFormData.paymentNotes
      };

      await update(selectedSale.id, updatedSale);
      toast({ title: "Payment details saved successfully" });
      setPaymentDialogOpen(false);
    } catch (error) {
      toast({ title: "Error saving payment details", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePaymentStatus = async (sale: Sale) => {
    if (sale.status === 'pending') {
      // Find the sale with delivery info
      const saleWithDel = salesWithDelivery.find(s => s.id === sale.id);
      if (saleWithDel) openPaymentDialog(saleWithDel);
      return;
    }

    if (confirm("Mark payment as pending again? This will clear payment details.")) {
      setSubmitting(true);
      try {
        const updatedSale: Sale = {
          ...sale,
          status: 'pending',
          paymentMethod: undefined,
          paidAmount: 0,
          billNumbers: "",
          paymentDate: "",
          paymentNotes: ""
        };
        await update(sale.id, updatedSale);
        toast({ title: `Payment status reset to pending` });
      } catch (error) {
        toast({ title: "Error updating status", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      party: "",
      takas: 0,
      meters: 0,
      ratePerMeter: 0,
      paymentTerms: 45,
      qualityId: "",
      type: 'spot',
      unitMeters: 0,
      expectedPaymentDate: new Date().toISOString().split('T')[0], // Reset expected payment date
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const getDaysRemaining = (expectedDate: string): number => {
    const today = new Date();
    const paymentDate = new Date(expectedDate);
    return Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Sort sales for initial view (urgent first)
  const sortedSales = useMemo(() => {
    const today = new Date();
    return [...sales].sort((a, b) => {
      const daysRemainingA = Math.ceil((new Date(a.expectedPaymentDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemainingB = Math.ceil((new Date(b.expectedPaymentDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const isUrgentA = a.status === 'pending' && daysRemainingA <= 5;
      const isUrgentB = b.status === 'pending' && daysRemainingB <= 5;

      if (isUrgentA && !isUrgentB) return -1;
      if (!isUrgentA && isUrgentB) return 1;

      return new Date(a.expectedPaymentDate).getTime() - new Date(b.expectedPaymentDate).getTime();
    });
  }, [sales]);

  const salesWithDelivery = useMemo(() => {
    return sortedSales.map(s => {
      const sDeliveries = deliveries.filter(d => d.saleId === s.id);
      const deliveredTakas = sDeliveries.reduce((sum, d) => sum + d.takas, 0);
      const deliveredMeters = sDeliveries.reduce((sum, d) => sum + d.meters, 0);

      let amount = s.amount;
      let tax = s.tax;
      let total = s.total;

      // For advance lots, the sale amount is the sum of shipments made so far
      if (s.type === 'advance_lots') {
        amount = deliveredMeters * s.ratePerMeter;
        tax = amount * 0.05;
        total = amount + tax;
      }

      return {
        ...s,
        amount,
        tax,
        total,
        deliveredTakas,
        deliveredMeters,
        remainingTakas: s.takas - deliveredTakas,
        remainingMeters: s.meters - deliveredMeters
      };
    }) as SaleWithDelivery[];
  }, [sortedSales, deliveries]);

  const totalSalesVal = salesWithDelivery.reduce((sum, s) => sum + s.total, 0);
  const pendingSalesVal = salesWithDelivery.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.total, 0);

  const totalMetersBooked = salesWithDelivery.reduce((sum, s) => sum + (s.meters || 0), 0);
  const totalTakasBooked = salesWithDelivery.reduce((sum, s) => sum + (s.takas || 0), 0);
  const totalMetersShipped = salesWithDelivery.reduce((sum, s) => sum + (s.deliveredMeters || 0), 0);
  const totalTakasShipped = salesWithDelivery.reduce((sum, s) => sum + (s.deliveredTakas || 0), 0);

  // Group by quality for the summary section
  const qualityTotals = salesWithDelivery.reduce((acc, s) => {
    const quality = rawQualities.find(q => q.id === s.qualityId)?.name || 'Other';
    if (!acc[quality]) {
      acc[quality] = { quality, meters: 0, deliveredMeters: 0, takas: 0, deliveredTakas: 0 };
    }
    acc[quality].meters += s.meters || 0;
    acc[quality].deliveredMeters += s.deliveredMeters || 0;
    acc[quality].takas += s.takas || 0;
    acc[quality].deliveredTakas += s.deliveredTakas || 0;
    return acc;
  }, {} as Record<string, { quality: string; meters: number; deliveredMeters: number; takas: number; deliveredTakas: number }>);

  const activeQualityTotals = Object.values(qualityTotals).filter(t => t.deliveredTakas < t.takas);

  const columns = useMemo<ColumnDef<SaleWithDelivery>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-semibold text-xs"
          >
            Date
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => <span className="font-medium whitespace-nowrap">{row.original.date}</span>
      },
      {
        accessorKey: "party",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-semibold text-xs"
          >
            Party
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-base whitespace-nowrap">{row.original.party}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{rawQualities.find(q => q.id === row.original.qualityId)?.name || 'N/A'}</span>
          </div>
        )
      },
      {
        header: "Order & Delivery",
        cell: ({ row }) => {
          const s = row.original;
          const percentage = s.takas > 0 ? (s.deliveredTakas / s.takas) * 100 : 0;
          return (
            <div className="flex flex-col gap-1.5 min-w-[140px]">
              <div className="flex justify-between items-center px-0.5">
                <span className="font-bold text-[11px]">{s.deliveredTakas}/{s.takas} <span className="text-[9px] text-muted-foreground">TK</span></span>
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-1 rounded-sm">{Math.round(percentage)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden border border-muted/10">
                <div
                  className={cn("h-full transition-all duration-700 ease-out", percentage >= 100 ? 'bg-green-500' : 'bg-primary')}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground italic text-right">{s.deliveredMeters.toLocaleString()}m / {s.meters.toLocaleString()}m</span>
            </div>
          )
        }
      },
      {
        header: "Amount",
        cell: ({ row }) => {
          const s = row.original;
          const type = s.type;
          const label = type === 'advance_lots' ? 'ADV(L)' : type === 'advance_meters' ? 'ADV(M)' : 'SPOT';
          const isPending = s.type === 'advance_lots' && s.total === 0;

          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold px-1 rounded border border-primary/20 bg-primary/5">{label}</span>
                <span className="text-[10px] font-bold">₹{s.ratePerMeter}</span>
              </div>
              <span className={cn("font-bold text-base tracking-tight", isPending ? "text-muted-foreground/50 italic text-xs" : "text-primary")}>
                {isPending ? "Pending Del." : `₹${Math.round(s.total).toLocaleString()}`}
              </span>
              {s.paidAmount !== undefined && s.paidAmount !== s.total && s.status === 'paid' && (
                <span className="text-[10px] font-bold text-orange-500">Paid: ₹{s.paidAmount.toLocaleString()}</span>
              )}
            </div>
          )
        }
      },
      {
        header: "Payment",
        cell: ({ row }) => {
          if (!row.original.expectedPaymentDate) return "-";
          const date = new Date(row.original.expectedPaymentDate);
          const diff = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isPaid = row.original.status === 'paid';

          return (
            <div className="flex flex-col gap-0.5">
              <Badge className={cn("font-bold text-[9px] px-1.5 py-0 h-4 w-fit", isPaid ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600")}>
                {isPaid ? "PAID" : "PENDING"}
              </Badge>
              {!isPaid && (
                <span className={cn("text-[9px] font-bold whitespace-nowrap", diff < 0 ? "text-destructive" : diff < 7 ? "text-orange-500" : "text-green-600")}>
                  {diff < 0 ? `${Math.abs(diff)}d Overdue` : `${diff}d left`}
                </span>
              )}
              {isPaid && row.original.paymentMethod && (
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{row.original.paymentMethod} • {row.original.paymentDate}</span>
              )}
            </div>
          )
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const sale = row.original;
          return (
            <div className="flex gap-1 justify-end">
              <Button size="icon" variant="secondary" className="h-8 w-8" title="Deliveries" onClick={() => {
                setSelectedSale(sale);
                setDeliveryDialogOpen(true);
              }}>
                <Truck className="h-4 w-4 text-blue-600" />
              </Button>
              <Button size="icon" variant="outline" className={cn("h-8 w-8", sale.status === 'paid' ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200")} title={sale.status === 'paid' ? "View Payment" : "Collect Payment"} onClick={() => togglePaymentStatus(sale)}>
                <Coins className={cn("h-4 w-4", sale.status === 'paid' ? "text-green-600" : "text-orange-600")} />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8" title="Edit" onClick={() => handleEdit(sale)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 border-destructive/10" title="Delete" onClick={() => handleDelete(sale.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    [rawQualities]
  );

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Sales Ledger</h2>
          <p className="text-muted-foreground">Manage fabric contracts and delivery pipeline</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }} className="btn-animated">
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Cancel" : "New Contract"}
          </Button>
        </div>
      </div>

      {
        isAdding && (
          <Card className="border border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden mb-8">
            <CardHeader className="bg-primary/5 py-4">
              <CardTitle className="text-lg font-bold">{editingId ? "Modify Contract" : "Initiate New Contract"}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Contract Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as 'spot' | 'advance_meters' | 'advance_lots' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sale Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spot">Spot Sale (Pre-calculated)</SelectItem>
                        <SelectItem value="advance_meters">Advance Sale (by Meters)</SelectItem>
                        <SelectItem value="advance_lots">Advance Sale (by Lots)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Contract Date</label>
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
                    <label className="text-sm font-semibold">Party Name</label>
                    <Input
                      value={formData.party}
                      onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                      placeholder="Legal Entity Name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Fabric Quality</label>
                    <Select
                      value={formData.qualityId}
                      onValueChange={(value) => setFormData({ ...formData, qualityId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Quality" />
                      </SelectTrigger>
                      <SelectContent>
                        {rawQualities.map(q => (
                          <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                      {formData.type.startsWith('advance') ? "Total Lot" : "Total Takas"}
                    </label>
                    <Input
                      type="number"
                      value={formData.takas}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          takas: val,
                          meters: formData.type === 'advance_meters' ? val * formData.unitMeters : formData.meters
                        });
                      }}
                      required
                    />
                  </div>

                  {formData.type === 'advance_meters' ? (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Contract Meters (per Lot)</label>
                      <Input
                        type="number"
                        value={formData.unitMeters}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, unitMeters: val, meters: val * formData.takas });
                        }}
                        required
                      />
                    </div>
                  ) : formData.type === 'spot' ? (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Contract Meters (Total)</label>
                      <Input
                        type="number"
                        value={formData.meters}
                        onChange={(e) => setFormData({ ...formData, meters: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200">
                      <p className="text-xs font-semibold text-orange-600">Lot Mode Active</p>
                      <p className="text-sm text-orange-500">Total will be calculated during delivery.</p>
                    </div>
                  )}
                </div>

                {formData.type === 'advance_meters' && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary/60 mb-1">Contract Calculation Summary</p>
                    <p className="text-xl font-bold text-primary">
                      {formData.takas} Lots × {formData.unitMeters}m = {formData.meters.toLocaleString()} Total Meters
                    </p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Rate (₹/meter)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.ratePerMeter}
                      onChange={(e) => setFormData({ ...formData, ratePerMeter: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Payment Target</label>
                    <Input
                      type="date"
                      value={formData.expectedPaymentDate}
                      onChange={(e) => setFormData({ ...formData, expectedPaymentDate: e.target.value })}
                    />
                  </div>
                </div>

                {formData.type === 'spot' && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary/60 mb-1">Final Estimated Total (incl. 5% GST)</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{Math.round((formData.meters * formData.ratePerMeter) * 1.05).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? "Update Contract" : "Finalize Contract"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Discard</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )
      }


      <div className="grid gap-6 md:grid-cols-3 card-grid">
        <Card className="animated-card stat-card stat-card-blue border-none shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-blue-600/70">Total Booked</CardTitle>
            <div className="icon-container icon-blue">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{(totalMetersBooked / 1000).toFixed(2)}k <span className="text-xs font-medium text-muted-foreground">meters</span></p>
              <p className="text-sm font-semibold text-blue-500/80">{totalTakasBooked} Takas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animated-card stat-card stat-card-purple border-none shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-purple-600/70">Total Shipped</CardTitle>
            <div className="icon-container icon-purple">
              <Truck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0.5">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{(totalMetersShipped / 1000).toFixed(2)}k <span className="text-xs font-medium text-muted-foreground">meters</span></p>
              <p className="text-sm font-semibold text-purple-500/80">{totalTakasShipped} Takas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animated-card stat-card border-none shadow-lg bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-red-600/70">Pending Payment</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <Coins className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">₹{Math.round(pendingSalesVal).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">From active contracts</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Quality Summary (Active only) */}
      {
        activeQualityTotals.length > 0 && (
          <Card className="shadow-lg overflow-hidden border-none bg-secondary/10">
            <CardHeader className="pb-4 bg-muted/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Pending Quality Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeQualityTotals
                  .sort((a, b) => b.meters - a.meters)
                  .map((totals) => (
                    <div key={totals.quality} className="p-4 border rounded-xl bg-card hover:border-primary/30 transition-all shadow-sm group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight">{totals.quality}</p>
                          <p className="text-[10px] font-bold text-primary uppercase mt-0.5 tracking-wider opacity-70">Production Quality</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">
                          ACTIVE
                        </Badge>
                      </div>

                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Booked</p>
                          <p className="text-lg font-bold">{totals.meters.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">m</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Shipped</p>
                          <p className="text-lg font-bold text-primary">{totals.deliveredMeters.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">m</span></p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(100, (totals.deliveredMeters / totals.meters) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {(totals.meters - totals.deliveredMeters).toLocaleString()}m pending
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground">
                            {Math.round((totals.deliveredMeters / totals.meters) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )
      }


      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold">Active Contracts & History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={salesWithDelivery}
            searchKey="party"
            rowClassName={(row) => {
              const sale = row.original;
              const daysRemaining = getDaysRemaining(sale.expectedPaymentDate);
              const isUrgent = sale.status === 'pending' && daysRemaining <= 5;
              return cn(
                "hover:bg-primary/[0.03] transition-all cursor-default border-b-2 border-muted/20",
                isUrgent && "bg-orange-500/[0.03] border-l-4 border-l-orange-500"
              );
            }}
          />
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-green-600" /> Record Payment
            </DialogTitle>
            <DialogDescription>
              Enter transaction details for {selectedSale?.party}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentSubmit} className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Payment Method</label>
                <Select
                  value={paymentFormData.paymentMethod}
                  onValueChange={(value) => setPaymentFormData({ ...paymentFormData, paymentMethod: value as any })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RTGS">RTGS / Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary">Amount Paid (Adjusted/Full)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    className="pl-7 font-bold text-lg"
                    value={paymentFormData.paidAmount}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paidAmount: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Contract Total: ₹{Math.round(selectedSale?.total || 0).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Payment Date</label>
                <Input
                  type="date"
                  value={paymentFormData.paymentDate}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-primary/80">Bill Numbers</label>
                <Input
                  placeholder="e.g. INV-001, INV-002"
                  value={paymentFormData.billNumbers}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, billNumbers: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Note / Remarks</label>
                <textarea
                  className="w-full min-h-[80px] p-3 rounded-md border text-sm bg-transparent"
                  placeholder="Adjusted amount details, transaction ID, etc."
                  value={paymentFormData.paymentNotes}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentNotes: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Payment Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delivery Management Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Contract Delivery Pipeline</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Party: <span className="text-foreground font-bold uppercase">{selectedSale?.party}</span> |
              Quality: <span className="text-foreground font-bold">{rawQualities.find(q => q.id === selectedSale?.qualityId)?.name || 'N/A'}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-muted/50">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Taka Delivery Status</p>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-2xl font-bold">{selectedSale?.deliveredTakas} / {selectedSale?.takas}</p>
                  <p className="text-xs font-semibold text-orange-600">{selectedSale?.remainingTakas} left</p>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(100, ((selectedSale?.deliveredTakas || 0) / (selectedSale?.takas || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-muted/50">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {selectedSale?.type === 'advance_lots' ? 'Total Meters Shipped' : 'Meter Delivery Status'}
                </p>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-2xl font-bold tracking-tighter">
                    {selectedSale?.deliveredMeters.toLocaleString()}
                    {selectedSale?.type !== 'advance_lots' && ` / ${selectedSale?.meters.toLocaleString()}`}
                    <span className="text-xs font-bold text-muted-foreground ml-1">m</span>
                  </p>
                  {selectedSale?.type !== 'advance_lots' && (
                    <p className="text-xs font-semibold text-orange-600">{(selectedSale?.remainingMeters || 0).toLocaleString()}m left</p>
                  )}
                </div>
                {selectedSale?.type !== 'advance_lots' && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, ((selectedSale?.deliveredMeters || 0) / (selectedSale?.meters || 1)) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAddDelivery} className="p-4 border rounded-lg bg-card space-y-4">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="h-4 w-4" /> Log Shipment
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-2 lg:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={newDelivery.date}
                    onChange={e => setNewDelivery({ ...newDelivery, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Lots/Takas</label>
                  <Input
                    type="number"
                    value={newDelivery.takas}
                    onChange={e => {
                      const takas = parseFloat(e.target.value) || 0;
                      const isMeterBased = selectedSale?.type === 'advance_meters' || (selectedSale?.type as string) === 'advance';
                      const unitMeters = isMeterBased && (selectedSale?.takas || 0) > 0 ? (selectedSale?.meters || 0) / selectedSale!.takas : 0;
                      setNewDelivery({
                        ...newDelivery,
                        takas,
                        meters: unitMeters > 0 ? takas * unitMeters : newDelivery.meters
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Meters</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newDelivery.meters}
                    onChange={e => setNewDelivery({ ...newDelivery, meters: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes <span className="text-muted-foreground/50">(Optional)</span></label>
                  <Input
                    value={newDelivery.notes}
                    onChange={e => setNewDelivery({ ...newDelivery, notes: e.target.value })}
                    placeholder="Ref. No."
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Delivery
              </Button>
            </form>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Takas</TableHead>
                    <TableHead className="text-xs font-semibold">Meters</TableHead>
                    <TableHead className="text-xs font-semibold">Value</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.filter(d => d.saleId === selectedSale?.id).length > 0 ? (
                    deliveries
                      .filter(d => d.saleId === selectedSale?.id)
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(delivery => (
                        <TableRow key={delivery.id} className="hover:bg-muted/10">
                          <TableCell className="font-medium py-3">{delivery.date}</TableCell>
                          <TableCell className="font-semibold text-blue-600">{delivery.takas}</TableCell>
                          <TableCell className="font-semibold text-green-600">{delivery.meters.toLocaleString()}m</TableCell>
                          <TableCell className="font-bold text-primary italic">₹{Math.round(delivery.meters * (selectedSale?.ratePerMeter || 0) * 1.05).toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-destructive/10 group"
                              onClick={() => handleDeleteDelivery(delivery.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic font-medium">No shipments recorded yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDeliveryDialogOpen(false)} variant="secondary">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
