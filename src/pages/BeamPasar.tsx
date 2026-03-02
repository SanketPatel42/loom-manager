import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage as appStorage } from "@/lib/storage";
import type { BeamPasar, Quality } from "@/lib/types";
import { Plus, Pencil, Trash2, Trash, ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useBeamPasar, useQualities } from "@/hooks/useAsyncStorage";

export default function BeamPasarPage() {
  const { data: beamPasars, loading: bpLoading, add, update, delete: deleteRecord, refresh } = useBeamPasar();
  const { data: qualities, loading: qLoading } = useQualities();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
        cell: ({ row }) => `₹${(row.original.ratePerBeam || 0).toFixed(2)}`
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
