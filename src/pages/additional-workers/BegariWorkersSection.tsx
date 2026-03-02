import { useState, useMemo } from "react";
import type { BegariWorker } from "@/lib/types";
import { useBegariWorkers } from "@/hooks/useAsyncStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";

interface BegariWorkersSectionProps {
    workers: BegariWorker[];
}

const INITIAL_FORM = {
    id: '',
    name: '',
    phoneNumber: '',
    monthlySalary: 0,
    joinDate: new Date().toISOString().split('T')[0],
};

export function BegariWorkersSection({ workers }: BegariWorkersSectionProps) {
    const { add, update, delete: remove, isAdding, isUpdating, isDeleting } = useBegariWorkers();
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    const submitting = isAdding || isUpdating;

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const worker: BegariWorker = {
            ...form,
            id: form.id || Date.now().toString(),
        };

        try {
            if (form.id) {
                await update(form.id, worker);
                toast({ title: "Begari worker updated successfully" });
            } else {
                await add(worker);
                toast({ title: "Begari worker added successfully" });
            }
            resetForm();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save begari worker.",
                variant: "destructive"
            });
        }
    };

    const deleteWorker = async (id: string) => {
        if (confirm("Are you sure you want to delete this worker?")) {
            try {
                await remove(id);
                toast({ title: "Worker deleted successfully" });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete worker.",
                    variant: "destructive"
                });
            }
        }
    };

    const columns = useMemo<ColumnDef<BegariWorker>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        { accessorKey: "phoneNumber", header: "Phone" },
        {
            accessorKey: "monthlySalary",
            header: "Monthly Salary",
            cell: ({ row }) => `₹${row.original.monthlySalary.toFixed(2)}`
        },
        { accessorKey: "joinDate", header: "Join Date" },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setForm(row.original); setShowForm(true); }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteWorker(row.original.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Begari Workers (Fixed Monthly Salary)</h2>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {showForm ? "Cancel" : "Add Worker"}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{form.id ? "Edit Worker" : "Add New Worker"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Name</Label>
                                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Monthly Salary (₹)</Label>
                                <Input type="number" value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: parseFloat(e.target.value) })} required />
                            </div>
                            <div>
                                <Label>Join Date</Label>
                                <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} required />
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <Button type="submit">{form.id ? "Update" : "Add"} Worker</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Begari Worker List</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={workers} searchKey="name" />
                </CardContent>
            </Card>
        </div>
    );
}
