import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage as appStorage } from "@/lib/storage";
import type { BeamPasar, Quality } from "@/lib/types";
import { Plus, Pencil, Trash2, Trash, ArrowUpDown, Loader2, Calculator, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useBeamPasar, useQualities } from "@/hooks/useAsyncStorage";
import { calculateBeamPasarSalaries } from "@/utils/comprehensiveSalaryUtils";

export default function BeamPasarPage() {
  const { data: beamPasars, loading: bpLoading, add, update, delete: deleteRecord, refresh } = useBeamPasar();
  const { data: qualities, loading: qLoading } = useQualities();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeCycle, setActiveCycle] = useState<'1-15' | '16-30'>('1-15');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    beamNo: "",
    tars: 0,
    ratePerBeam: 0,
    qualityId: "",
  });
  const { toast } = useToast();

  const loading = bpLoading || qLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const beamPasar: BeamPasar = {
        id: editingId || Date.now().toString(),
        ...formData,
      };

      if (editingId) {
        await update(editingId, beamPasar);
        toast({ title: "Beam Pasar updated successfully" });
      } else {
        await add(beamPasar);
        toast({ title: "Beam Pasar added successfully" });
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

  const handleEdit = (beamPasar: BeamPasar) => {
    setFormData({
      date: beamPasar.date,
      beamNo: beamPasar.beamNo,
      tars: beamPasar.tars,
      ratePerBeam: beamPasar.ratePerBeam || 0,
      qualityId: beamPasar.qualityId || "",
    });
    setEditingId(beamPasar.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this beam pasar record?")) {
      try {
        await deleteRecord(id);
        toast({ title: "Beam Pasar deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete record.",
          variant: "destructive"
        });
      }
    }
  };

  const handleClearData = async () => {
    if (confirm("Are you sure you want to delete ALL beam pasar records? This action cannot be undone.")) {
      try {
        setSubmitting(true);
        await appStorage.async.clearBeamPasars();
        await refresh();
        toast({ title: "All beam pasar data cleared successfully" });
      } catch (error) {
        console.error("Failed to clear data:", error);
        toast({
          title: "Error",
          description: "Failed to clear data.",
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
      beamNo: "",
      tars: 0,
      ratePerBeam: 0,
      qualityId: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleQualityChange = (qualityId: string) => {
    const selectedQuality = qualities.find(q => q.id === qualityId);
    if (selectedQuality) {
      setFormData({
        ...formData,
        qualityId,
        tars: selectedQuality.tars,
        ratePerBeam: selectedQuality.beamPasarRate,
      });
    } else {
      setFormData({ ...formData, qualityId });
    }
  };


  const sortedBeamPasars = useMemo(() => {
    return [...beamPasars].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [beamPasars]);

  // Calculate salary summary for the selected cycle and month
  const salaryData = useMemo(() => {
    const salaries = calculateBeamPasarSalaries(beamPasars, activeCycle, selectedMonth);
    
    // Group by rate to show summary
    const rateGroups: Record<number, { count: number; totalAmount: number; entries: any[] }> = {};
    salaries.forEach(salary => {
      const rate = salary.ratePerBeam || 0;
      if (!rateGroups[rate]) {
        rateGroups[rate] = { count: 0, totalAmount: 0, entries: [] };
      }
      rateGroups[rate].entries.push(salary);
    });

    // Calculate count and total for each rate
    Object.keys(rateGroups).forEach(rateKey => {
      const rate = Number(rateKey);
      const group = rateGroups[rate];
      group.count = group.entries.length;
      group.totalAmount = group.count * rate;
    });

    const totalAmount = Object.values(rateGroups).reduce((sum, group) => sum + group.totalAmount, 0);
    
    return { rateGroups, totalAmount, salaries };
  }, [beamPasars, activeCycle, selectedMonth]);

  const columns = useMemo<ColumnDef<BeamPasar>[]>(
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
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
      },
      {
        accessorKey: "beamNo",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Beam No.
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: "quality",
        header: "Quality",
        cell: ({ row }) => {
          const qId = row.original.qualityId;
          const quality = qualities.find(q => q.id === qId);
          return quality?.name || 'N/A';
        }
      },
      {
        accessorKey: "ratePerBeam",
        header: "Rate",
        cell: ({ row }) => `₹${row.original.ratePerBeam || 0}`
      },
      {
        id: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const rate = row.original.ratePerBeam || 0;
          console.log("rates====",rate)
          // Find how many beams have the same rate in the current filtered data
          let sameRateBeams = sortedBeamPasars.filter(bp => 
            bp.ratePerBeam == rate).length;
            console.log("sameRateBeams",sameRateBeams)
          let amount = sameRateBeams * rate;
          console.log("Amount",amount)
          return `₹${amount.toFixed(2)} (${sameRateBeams} × ₹${rate})`;
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const bp = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(bp)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(bp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [qualities]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Beam Pasar Record</h1>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleClearData} disabled={submitting}>
            <Trash className="h-4 w-4 mr-2" />
            Clear Data
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)} disabled={submitting}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Cancel" : "Add Record"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Beam Pasar" : "Add New Beam Pasar"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beamNo">Beam No. *</Label>
                  <Input
                    id="beamNo"
                    value={formData.beamNo}
                    onChange={(e) => setFormData({ ...formData, beamNo: e.target.value })}
                    placeholder="e.g., B001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality *</Label>
                  <Select value={formData.qualityId} onValueChange={handleQualityChange} required>
                    <SelectTrigger id="quality">
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualities.map((quality) => (
                        <SelectItem key={quality.id} value={quality.id}>
                          {quality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tars">Tars *</Label>
                  <Input
                    id="tars"
                    type="number"
                    value={formData.tars}
                    onChange={(e) => setFormData({ ...formData, tars: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    disabled
                    required
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratePerBeam">Rate per Beam *</Label>
                  <Input
                    id="ratePerBeam"
                    type="number"
                    value={formData.ratePerBeam}
                    onChange={(e) => setFormData({ ...formData, ratePerBeam: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update" : "Add"} Record
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Salary Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Beam Pasar Salary Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Cycle and Month Selection */}
            <div className="flex gap-4 items-center">
              <div className="space-y-2">
                <Label>Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label>Cycle</Label>
                <Select value={activeCycle} onValueChange={(value: '1-15' | '16-30') => setActiveCycle(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-15">1-15</SelectItem>
                    <SelectItem value="16-30">16-30</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(salaryData.rateGroups).map(([rate, group]) => (
                <Card key={rate} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Rate: ₹{rate}</div>
                      <div className="text-lg font-semibold">{group.count} beams</div>
                      <div className="text-xl font-bold text-primary">₹{group.totalAmount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {group.count} × ₹{rate} = ₹{group.totalAmount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Total Summary */}
            {salaryData.totalAmount > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Salary for {activeCycle} cycle</div>
                      <div className="text-2xl font-bold text-primary">₹{salaryData.totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{Object.values(salaryData.rateGroups).reduce((sum, group) => sum + group.count, 0)} total beams</div>
                      <div>Month: {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {salaryData.totalAmount === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No beam pasar records found for the selected month and cycle.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Records</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={sortedBeamPasars}
              searchKey="beamNo"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
