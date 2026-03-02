import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useWorkerProfiles } from "@/hooks/useAsyncStorage";
import type { WorkerProfile } from "@/lib/types";
import { Plus, Pencil, Trash2, UserPlus, ArrowUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorkerProfiles() {
  const { data: workers = [], loading, add, update, delete: deleteWorker } = useWorkerProfiles();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    emergencyContact: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const worker: WorkerProfile = {
      id: editingId || Date.now().toString(),
      ...formData,
    };

    try {
      if (editingId) {
        await update(editingId, worker);
        toast({ title: "Worker updated successfully" });
      } else {
        await add(worker);
        toast({ title: "Worker added successfully" });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save worker profile",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (worker: WorkerProfile) => {
    setFormData({
      name: worker.name,
      phoneNumber: worker.phoneNumber,
      emergencyContact: worker.emergencyContact,
    });
    setEditingId(worker.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this worker?")) {
      try {
        await deleteWorker(id);
        toast({ title: "Worker deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete worker profile",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      emergencyContact: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const columns = useMemo<ColumnDef<WorkerProfile>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Worker Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    { accessorKey: "phoneNumber", header: "Phone Number" },
    { accessorKey: "emergencyContact", header: "Emergency Contact" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Worker Profiles</h2>
          <p className="text-muted-foreground">Manage worker contact information</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {isAdding ? "Cancel" : "Add Worker"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{workers.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Worker" : "Add New Worker"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Worker Name</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter worker name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    required
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Emergency Contact</label>
                  <Input
                    required
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Emergency contact number"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Update" : "Add"} Worker</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Worker Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={workers} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}

