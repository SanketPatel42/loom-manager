import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTakas, useQualities } from "@/hooks/useAsyncStorage";
import type { Taka, Quality } from "@/lib/types";
import { Plus, Pencil, Trash2, ArrowUpDown, Package, Layers, TrendingUp, Mail, MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useFactory } from "@/lib/factoryContext";

export default function Takas() {
  const { data: takas, loading: tLoading, add, update, delete: deleteRecord } = useTakas();
  const { data: qualities, loading: qLoading } = useQualities();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    available: 0,
    folded: 0,
    qualityId: '',
  });
  const { toast } = useToast();
  const { activeFactory } = useFactory();

  const loading = tLoading || qLoading;

  // Calculate quality-wise totals
  const getQualityWiseTotals = () => {
    const totals: { [qualityId: string]: number } = {};

    // Group takas by quality and get the latest entry for each quality
    const qualityGroups: { [qualityId: string]: Taka[] } = {};

    takas.forEach(taka => {
      const qId = taka.qualityId || 'unassigned';
      if (!qualityGroups[qId]) {
        qualityGroups[qId] = [];
      }
      qualityGroups[qId].push(taka);
    });

    // For each quality, get the latest entry's remaining value
    Object.keys(qualityGroups).forEach(qId => {
      const sortedTakas = qualityGroups[qId].sort((a, b) => b.date.localeCompare(a.date));
      totals[qId] = sortedTakas[0].remaining;
    });

    return totals;
  };

  const qualityWiseTotals = getQualityWiseTotals();

  // Get previous day's total for the same quality
  const getPreviousDayTotal = (currentDate: string, qualityId: string): number => {
    if (!qualityId) return 0;

    // Filter takas with the same quality and date before current date
    const previousTakas = takas
      .filter(t => t.qualityId === qualityId && t.date < currentDate)
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

    // Return the most recent previous day's total (remaining)
    return previousTakas.length > 0 ? previousTakas[0].remaining : 0;
  };

  // Auto-populate available when quality changes
  useEffect(() => {
    if (formData.qualityId && !editingId) {
      const previousTotal = getPreviousDayTotal(formData.date, formData.qualityId);
      setFormData(prev => ({ ...prev, available: previousTotal }));
    }
  }, [formData.qualityId, formData.date, editingId, takas]);

  const generateReport = () => {
    const reportDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const factoryName = activeFactory?.name || 'Factory';
    const factoryLocation = activeFactory?.location ? ` (${activeFactory.location})` : '';
    let report = `*Taka Stock Report - ${factoryName}${factoryLocation}*\n*${reportDate}*\n\n`;
    let grandTotal = 0;

    const sortedQualities = Object.keys(qualityWiseTotals).sort((a, b) => {
      const nameA = a === 'unassigned' ? 'Unassigned' : (qualities.find(q => q.id === a)?.name || 'Unknown');
      const nameB = b === 'unassigned' ? 'Unassigned' : (qualities.find(q => q.id === b)?.name || 'Unknown');
      return nameA.localeCompare(nameB);
    });

    sortedQualities.forEach(qualityId => {
      const total = qualityWiseTotals[qualityId];
      if (total > 0) {
        const quality = qualities.find(q => q.id === qualityId);
        const qualityName = qualityId === 'unassigned' ? 'Unassigned' : (quality?.name || 'Unknown');
        const lots = (total / 12).toFixed(2);
        report += `*${qualityName}*: ${total} takas (${lots} lots)\n`;
        grandTotal += total;
      }
    });

    report += `\n*Total Available:* ${grandTotal} takas`;
    return encodeURIComponent(report);
  };

  const handleGmailShare = () => {
    const factoryName = activeFactory?.name || 'Factory';
    const reportDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const subject = encodeURIComponent(`Taka Stock Report - ${factoryName} - ${reportDate}`);
    const body = generateReport();
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsappShare = () => {
    const text = generateReport();
    window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const total = formData.available + formData.folded;
      const taka: Taka = {
        id: editingId || Date.now().toString(),
        date: formData.date,
        available: formData.available,
        folded: formData.folded,
        remaining: total,
        qualityId: formData.qualityId || undefined,
      };

      if (editingId) {
        await update(editingId, taka);
        toast({ title: "Taka record updated successfully" });
      } else {
        await add(taka);
        toast({ title: "Taka record added successfully" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (taka: Taka) => {
    setFormData({
      date: taka.date,
      available: taka.available,
      folded: taka.folded,
      qualityId: taka.qualityId || '',
    });
    setEditingId(taka.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        setSubmitting(true);
        await deleteRecord(id);
        toast({ title: "Taka record deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete record.",
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
      available: 0,
      folded: 0,
      qualityId: '',
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const sortedTakas = useMemo(() => {
    return [...takas].sort((a, b) => b.date.localeCompare(a.date));
  }, [takas]);

  const columns = useMemo<ColumnDef<Taka>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: "qualityName",
        accessorFn: (row) => {
          const q = qualities.find(q => q.id === row.qualityId);
          return q ? q.name : "Unassigned";
        },
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Quality
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const qualityName = row.getValue("qualityName") as string;
          return qualityName !== "Unassigned" ? (
            <Badge variant="secondary">{qualityName}</Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          );
        }
      },
      {
        accessorKey: "available",
        header: "Available",
      },
      {
        accessorKey: "folded",
        header: "Folded",
      },
      {
        accessorKey: "remaining", // Total
        header: "Total",
        cell: ({ row }) => <span className="font-medium">{row.original.remaining}</span>
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const taka = row.original;
          return (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => handleEdit(taka)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(taka.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [qualities]
  );

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Taka Stock & Folding Record</h2>
          <p className="text-muted-foreground">Track taka inventory and folding operations</p>
        </div>
        <div className="page-actions flex gap-2">
          <Button variant="outline" onClick={handleGmailShare} className="gap-2">
            <Mail className="h-4 w-4" />
            Gmail
          </Button>
          <Button variant="outline" onClick={handleWhatsappShare} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }} className="btn-animated">
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Cancel" : "Add Record"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-lg font-bold">{editingId ? "Edit Record" : "Add New Record"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Total Takas Available</label>
                  <Input
                    type="number"
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: parseFloat(e.target.value) })}
                    required
                  />
                  {formData.qualityId && !editingId && (
                    <p className="text-xs text-muted-foreground">
                      Auto-populated from previous day's total
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Takas Folded</label>
                  <Input
                    type="number"
                    value={formData.folded}
                    onChange={(e) => setFormData({ ...formData, folded: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Quality (Optional)</label>
                  <Select
                    value={formData.qualityId || undefined}
                    onValueChange={(value) => setFormData({ ...formData, qualityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualities.map((quality) => (
                        <SelectItem key={quality.id} value={quality.id}>
                          {quality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.qualityId && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, qualityId: '' })}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex flex-col justify-center">
                  <p className="text-xs font-medium text-primary/60 mb-1">Total</p>
                  <p className="text-2xl font-bold text-primary">{formData.available + formData.folded}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Record</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Discard</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Current Stock Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 card-grid">
            {Object.keys(qualityWiseTotals).length === 0 ? (
              <div className="col-span-full empty-state">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 empty-state-icon" />
                <p className="text-sm text-muted-foreground mt-2">No stock records available</p>
              </div>
            ) : (
              Object.entries(qualityWiseTotals).map(([qualityId, total]) => {
                const quality = qualities.find(q => q.id === qualityId);
                const qualityName = qualityId === 'unassigned' ? 'Unassigned' : (quality?.name || 'Unknown');
                const lots = (total / 12).toFixed(2);

                return (
                  <div key={qualityId} className="animated-card p-4 border rounded-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={qualityId === 'unassigned' ? 'outline' : 'secondary'} className="badge-animated">
                        {qualityName}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Stock</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 number-highlight">{total}</p>
                        <p className="text-sm text-muted-foreground">takas</p>
                      </div>
                      <p className="text-xl text-muted-foreground mt-1">= {lots} lots</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold">Taka Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={sortedTakas}
            searchKey="date"
          />
        </CardContent>
      </Card>
    </div>
  );
}
