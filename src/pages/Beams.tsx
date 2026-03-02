import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBeams, useQualities } from "@/hooks/useAsyncStorage";
import type { Beam, Quality } from "@/lib/types";
import { storage as appStorage } from "@/lib/storage";
import { Plus, Pencil, Trash2, Loader2, Trash, ArrowUpDown, Wind, Calendar, Coins, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

export default function Beams() {
  const { data: beams, loading: bLoading, error, add, update, delete: deleteBeam, refresh } = useBeams();
  const { data: qualities, loading: qLoading } = useQualities();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    warper: "",
    beamNo: "",
    noOfTakas: 0,
    noOfTar: 0,
    pricePerBeam: 0,
    qualityId: "",
  });
  const { toast } = useToast();

  const loading = bLoading || qLoading;

  const filteredBeams = useMemo(() => {
    return beams
      .filter(beam => beam.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [beams, selectedMonth]);

  const firstHalfBeams = filteredBeams.filter(beam => {
    const day = parseInt(beam.date.split('-')[2]);
    return day <= 15;
  });

  const secondHalfBeams = filteredBeams.filter(beam => {
    const day = parseInt(beam.date.split('-')[2]);
    return day > 15;
  });

  const calculateTotal = (beamList: Beam[]) => {
    return beamList.reduce((total, beam) => {
      return total + (beam.noOfTakas * beam.pricePerBeam);
    }, 0);
  };

  const firstHalfTotal = calculateTotal(firstHalfBeams);
  const secondHalfTotal = calculateTotal(secondHalfBeams);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const beam: Beam = {
        id: editingId || Date.now().toString(),
        ...formData,
        total: 0, // Will be recalculated
      };

      if (editingId) {
        await update(editingId, beam);
        toast({ title: "Beam updated successfully" });
        resetForm();
      } else {
        await add(beam);
        toast({ title: "Beam added successfully" });
        prepareNextEntry();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save beam. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (beam: Beam) => {
    setFormData({
      date: beam.date,
      warper: beam.warper,
      beamNo: beam.beamNo,
      noOfTakas: beam.noOfTakas,
      noOfTar: beam.noOfTar,
      pricePerBeam: beam.pricePerBeam,
      qualityId: beam.qualityId || "",
    });
    setEditingId(beam.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this beam?")) {
      try {
        await deleteBeam(id);
        toast({ title: "Beam deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete beam. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleClearData = async () => {
    if (confirm("Are you sure you want to delete ALL beam records? This action cannot be undone.")) {
      try {
        await appStorage.async.clearBeams();
        await refresh();
        toast({ title: "All beam data cleared successfully" });
      } catch (error) {
        console.error("Failed to clear data:", error);
        toast({
          title: "Error",
          description: "Failed to clear data.",
          variant: "destructive"
        });
      }
    }
  };

  const prepareNextEntry = () => {
    setFormData(prev => ({
      ...prev,
      beamNo: "",
      noOfTakas: 0,
      noOfTar: 0,
      // Keep date, warper, pricePerBeam
    }));
    // Keep isAdding true
    setEditingId(null);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      warper: "",
      beamNo: "",
      noOfTakas: 0,
      noOfTar: 0,
      pricePerBeam: 0,
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
        noOfTar: selectedQuality.tars,
        pricePerBeam: selectedQuality.beamRate,
      });
    } else {
      setFormData({ ...formData, qualityId });
    }
  };

  const columns = useMemo<ColumnDef<Beam>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-muted/50"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "warper",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-muted/50"
            >
              Warper
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "beamNo",
        header: "Beam No.",
      },
      {
        accessorKey: "noOfTakas",
        header: "Takas",
      },
      {
        accessorKey: "noOfTar",
        header: "Tar",
      },
      {
        accessorKey: "pricePerBeam",
        header: "Price/Beam",
        cell: ({ row }) => <span className="text-blue-600 dark:text-blue-400 font-medium">₹{row.original.pricePerBeam}</span>
      },
      {
        id: "total",
        header: "Total",
        cell: ({ row }) => {
          const val = row.original.noOfTakas * row.original.pricePerBeam;
          return <span className="text-green-600 dark:text-green-400 font-bold">₹{val.toFixed(2)}</span>;
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const beam = row.original;
          return (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => handleEdit(beam)} className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(beam.id)} className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading beams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[Beams] Error state:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4 empty-state">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Wind className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium">Error loading beams: {error}</p>
          <p className="text-sm text-muted-foreground">Check the console for more details</p>
          <Button onClick={() => window.location.reload()} className="btn-animated">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Warping & Beam Record</h2>
          <p className="text-muted-foreground">Manage beam production records</p>
        </div>
        <div className="flex gap-2 page-actions">
          <Button variant="destructive" onClick={handleClearData} disabled={submitting} className="btn-animated">
            <Trash className="mr-2 h-4 w-4" />
            Clear Data
          </Button>
          <Button onClick={() => setIsAdding(!isAdding)} disabled={submitting} className="btn-animated">
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Cancel" : "Add Beam"}
          </Button>
        </div>
      </div>

      {/* Month Selection and Salary Summary */}
      <div className="grid gap-4 md:grid-cols-3 card-grid">
        <Card className="animated-card stat-card stat-card-blue">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Select Month</CardTitle>
            <div className="icon-container icon-blue">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-input-animated"
            />
          </CardContent>
        </Card>
        <Card className="animated-card stat-card stat-card-green">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">1-15 Salary</CardTitle>
            <div className="icon-container icon-green">
              <Coins className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 number-highlight">₹{firstHalfTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {firstHalfBeams.length} beams
            </p>
          </CardContent>
        </Card>
        <Card className="animated-card stat-card stat-card-purple">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">16-End Salary</CardTitle>
            <div className="icon-container icon-purple">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 number-highlight">₹{secondHalfTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {secondHalfBeams.length} beams
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdding && (
        <Card className="animated-card content-section">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-primary" />
              {editingId ? "Edit Beam" : "Add New Beam"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="form-group">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="form-input-animated"
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium">Warper Name</label>
                <Input
                  value={formData.warper}
                  onChange={(e) => setFormData({ ...formData, warper: e.target.value })}
                  required
                  className="form-input-animated"
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium">Beam Number</label>
                <Input
                  value={formData.beamNo}
                  onChange={(e) => setFormData({ ...formData, beamNo: e.target.value })}
                  required
                  className="form-input-animated"
                />
              </div>
              <div className="form-group">
                <Label className="text-sm font-medium">Quality *</Label>
                <Select value={formData.qualityId} onValueChange={handleQualityChange} required>
                  <SelectTrigger className="form-input-animated">
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
              <div className="form-group">
                <label className="text-sm font-medium">No. of Takas</label>
                <Input
                  type="number"
                  value={formData.noOfTakas}
                  onChange={(e) => setFormData({ ...formData, noOfTakas: parseFloat(e.target.value) })}
                  required
                  className="form-input-animated"
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium">No. of Tar</label>
                <Input
                  type="number"
                  value={formData.noOfTar}
                  onChange={(e) => setFormData({ ...formData, noOfTar: parseFloat(e.target.value) })}
                  disabled
                  required
                  className="bg-muted"
                />
              </div>
              <div className="form-group">
                <label className="text-sm font-medium">Price per Beam (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.pricePerBeam}
                  onChange={(e) => setFormData({ ...formData, pricePerBeam: parseFloat(e.target.value) })}
                  required
                  className="form-input-animated"
                />
              </div>
              <div className="flex items-end gap-2 md:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={submitting} className="btn-animated">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update" : "Add"} Beam
                </Button>
                {isAdding && <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>Cancel</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="animated-card content-section">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            Beam Records ({new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable
            columns={columns}
            data={filteredBeams}
            searchKey="warper"
          />
        </CardContent>
      </Card>
    </div>
  );
}
