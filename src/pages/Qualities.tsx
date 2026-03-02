import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQualities } from "@/hooks/useAsyncStorage";
import type { Quality } from "@/lib/types";
import { Plus, Pencil, Trash2, ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

export default function Qualities() {
  const { data: qualities, loading, add, update, delete: deleteRecord } = useQualities();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ratePerMeter: 0,
    tars: 0,
    beamRate: 0,
    beamPasarRate: 0,
    epi: 0,
    ppi: 0,
    danier: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const quality: Quality = {
        id: editingId || Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        await update(editingId, quality);
        toast({ title: "Quality updated successfully" });
      } else {
        await add(quality);
        toast({ title: "Quality added successfully" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save quality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (quality: Quality) => {
    setFormData({
      name: quality.name,
      ratePerMeter: quality.ratePerMeter,
      tars: quality.tars || 0,
      beamRate: quality.beamRate || 0,
      beamPasarRate: quality.beamPasarRate || 0,
      epi: quality.epi || 0,
      ppi: quality.ppi || 0,
      danier: quality.danier || "",
    });
    setEditingId(quality.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this quality?")) {
      try {
        setSubmitting(true);
        await deleteRecord(id);
        toast({ title: "Quality deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quality.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      ratePerMeter: 0,
      tars: 0,
      beamRate: 0,
      beamPasarRate: 0,
      epi: 0,
      ppi: 0,
      danier: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const columns = useMemo<ColumnDef<Quality>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Quality Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: "ratePerMeter",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Rate (₹)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => `₹${row.original.ratePerMeter.toFixed(2)}`,
      },
      {
        accessorKey: "epi",
        header: "EPI",
        cell: ({ row }) => row.original.epi || "-",
      },
      {
        accessorKey: "ppi",
        header: "PPI",
        cell: ({ row }) => row.original.ppi || "-",
      },
      {
        accessorKey: "danier",
        header: "Denier",
        cell: ({ row }) => row.original.danier || "-",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const quality = row.original;
          return (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(quality)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(quality.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Quality Master</h2>
          <p className="text-muted-foreground">Define and manage fabric qualities</p>
        </div>
        <div className="page-actions">
          <Button onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }} className="btn-animated">
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Cancel" : "Add Quality"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-lg font-bold">{editingId ? "Edit Quality" : "Add New Quality"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Quality Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium, Standard"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rate">Rate per Meter (₹) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.ratePerMeter}
                    onChange={(e) => setFormData({ ...formData, ratePerMeter: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tars">Tars *</Label>
                  <Input
                    id="tars"
                    type="number"
                    value={formData.tars}
                    onChange={(e) => setFormData({ ...formData, tars: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="beamRate">Beam Rate (₹) *</Label>
                  <Input
                    id="beamRate"
                    type="number"
                    step="0.01"
                    value={formData.beamRate}
                    onChange={(e) => setFormData({ ...formData, beamRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="beamPasarRate">Beam Pasar Rate (₹) *</Label>
                  <Input
                    id="beamPasarRate"
                    type="number"
                    step="0.01"
                    value={formData.beamPasarRate}
                    onChange={(e) => setFormData({ ...formData, beamPasarRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="epi">EPI (Optional)</Label>
                  <Input
                    id="epi"
                    type="number"
                    value={formData.epi || ''}
                    onChange={(e) => setFormData({ ...formData, epi: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ppi">PPI (Optional)</Label>
                  <Input
                    id="ppi"
                    type="number"
                    value={formData.ppi || ''}
                    onChange={(e) => setFormData({ ...formData, ppi: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="danier">Denier (Optional)</Label>
                  <Input
                    id="danier"
                    value={formData.danier}
                    onChange={(e) => setFormData({ ...formData, danier: e.target.value })}
                    placeholder="e.g. 150/2"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Quality</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Discard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold">Qualities List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={qualities} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
