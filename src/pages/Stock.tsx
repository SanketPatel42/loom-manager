import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStock } from "@/hooks/useAsyncStorage";
import type { Stock } from "@/lib/types";
import { Plus, Pencil, Trash2, Boxes, Mail, MessageCircle, Loader2, Calendar, Hash, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFactory } from "@/lib/factoryContext";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export default function Stock() {
  const { data: stock, loading, add, update, delete: deleteRecord } = useStock();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    yarnCount: "",
    boxesAvailable: 0,
  });
  const { toast } = useToast();
  const { activeFactory } = useFactory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const stockItem: Stock = {
        id: editingId || Date.now().toString(),
        ...formData,
      };

      if (editingId) {
        await update(editingId, stockItem);
        toast({ title: "Stock updated successfully" });
      } else {
        await add(stockItem);
        toast({ title: "Stock added successfully" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save stock record.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (stock: Stock) => {
    setFormData({
      date: stock.date,
      yarnCount: stock.yarnCount,
      boxesAvailable: stock.boxesAvailable,
    });
    setEditingId(stock.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock record?")) {
      try {
        setSubmitting(true);
        await deleteRecord(id);
        toast({ title: "Stock record deleted successfully" });
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
      yarnCount: "",
      boxesAvailable: 0,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const totalBoxes = stock.reduce((sum, s) => sum + s.boxesAvailable, 0);

  const totalsByYarnCount = stock.reduce((acc, s) => {
    const count = s.yarnCount || "Unknown";
    acc[count] = (acc[count] || 0) + s.boxesAvailable;
    return acc;
  }, {} as Record<string, number>);

  const columns: ColumnDef<Stock>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="hover:bg-transparent -ml-4 font-bold">
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium">{row.original.date}</span>
        </div>
      ),
    },
    {
      accessorKey: "yarnCount",
      header: "Yarn Count (Denier)",
      cell: ({ row }) => <Badge variant="secondary" className="font-semibold">{row.original.yarnCount}</Badge>,
    },
    {
      accessorKey: "boxesAvailable",
      header: "Boxes Available",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground/60" />
          <span className="font-bold">{row.original.boxesAvailable}</span>
          <span className="text-xs text-muted-foreground">boxes</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)} className="h-8 w-8 p-0">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(row.original.id)} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const generateReport = () => {
    const reportDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const factoryName = activeFactory?.name || 'Factory';
    const factoryLocation = activeFactory?.location ? ` (${activeFactory.location})` : '';
    let report = `*Yarn Stock Report - ${factoryName}${factoryLocation}*\n*${reportDate}*\n\n`;
    let grandTotal = 0;

    const sortedCounts = Object.keys(totalsByYarnCount).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    sortedCounts.forEach(count => {
      const total = totalsByYarnCount[count];
      report += `*${count}*: ${total} boxes\n`;
      grandTotal += total;
    });

    report += `\n*Total Available:* ${grandTotal} boxes`;
    return encodeURIComponent(report);
  };

  const handleGmailShare = () => {
    const factoryName = activeFactory?.name || 'Factory';
    const reportDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const subject = encodeURIComponent(`Yarn Stock Report - ${factoryName} - ${reportDate}`);
    const body = generateReport();
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  const handleWhatsappShare = () => {
    const text = generateReport();
    window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Stock Summary</h2>
          <p className="text-muted-foreground">Track yarn inventory by count (denier)</p>
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
            {isAdding ? "Cancel" : "Add Stock"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 card-grid">
        {Object.entries(totalsByYarnCount).map(([count, total]) => (
          <Card key={count} className="animated-card stat-card bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-none shadow-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-purple-600/70">{count}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{total}</p>
                <p className="text-xs text-muted-foreground">boxes</p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="animated-card stat-card bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-none shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-green-600/70">Total All</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalBoxes}</p>
              <p className="text-xs text-muted-foreground">boxes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdding && (
        <Card className="border border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-lg font-bold">{editingId ? "Edit Stock" : "Add New Stock Record"}</CardTitle>
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
                  <label className="text-sm font-semibold">Yarn Count (Denier)</label>
                  <Input
                    value={formData.yarnCount}
                    onChange={(e) => setFormData({ ...formData, yarnCount: e.target.value })}
                    placeholder="e.g., 150D, 300D"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Boxes Available</label>
                  <Input
                    type="number"
                    value={formData.boxesAvailable}
                    onChange={(e) => setFormData({ ...formData, boxesAvailable: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Stock" : "Add Stock"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>Discard</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold">Stock Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={stock}
            searchKey="yarnCount"
          />
        </CardContent>
      </Card>
    </div>
  );
}
