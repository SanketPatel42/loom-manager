import { useState, useMemo } from "react";
import type { WiremanWorker, WiremanBill } from "@/lib/types";
import { useWiremanWorkers, useWiremanBills } from "@/hooks/useAsyncStorage";
import { asyncStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, ArrowUpDown, Pencil } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";

interface WiremanWorkersSectionProps {
    workers: WiremanWorker[];
    bills: WiremanBill[];
}

const INITIAL_WORKER_FORM = {
    id: '',
    name: '',
    phoneNumber: '',
    joinDate: new Date().toISOString().split('T')[0],
};

const INITIAL_BILL_FORM = {
    id: '',
    workerId: '',
    date: new Date().toISOString().split('T')[0],
    billAmount: 0,
    description: '',
    cycle: '1-15' as '1-15' | '16-30',
};

export function WiremanWorkersSection({ workers, bills }: WiremanWorkersSectionProps) {
    const { add: addWorker, update: updateWorker, delete: removeWorker, isAdding: iaw, isUpdating: iuw, isDeleting: idw } = useWiremanWorkers();
    const { add: addBill, update: updateBill, delete: removeBill, isAdding: iab, isUpdating: iub, isDeleting: idb, refresh: refreshBills } = useWiremanBills();
    const { toast } = useToast();
    const [showWorkerForm, setShowWorkerForm] = useState(false);
    const [showBillForm, setShowBillForm] = useState(false);
    const [workerForm, setWorkerForm] = useState(INITIAL_WORKER_FORM);
    const [billForm, setBillForm] = useState(INITIAL_BILL_FORM);

    const submitting = iaw || iuw || iab || iub;

    const resetWorkerForm = () => {
        setWorkerForm(INITIAL_WORKER_FORM);
        setShowWorkerForm(false);
    };

    const resetBillForm = () => {
        setBillForm(INITIAL_BILL_FORM);
        setShowBillForm(false);
    };

    const handleWorkerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const worker: WiremanWorker = {
            ...workerForm,
            id: workerForm.id || Date.now().toString(),
        };

        try {
            if (workerForm.id) {
                await updateWorker(workerForm.id, worker);
                toast({ title: "Wireman updated successfully" });
            } else {
                await addWorker(worker);
                toast({ title: "Wireman added successfully" });
            }
            resetWorkerForm();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save wireman.",
                variant: "destructive"
            });
        }
    };

    const deleteWorker = async (id: string) => {
        if (confirm("Are you sure you want to delete this worker?")) {
            try {
                await removeWorker(id);
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

    const handleBillSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const bill: WiremanBill = {
            ...billForm,
            id: billForm.id || Date.now().toString(),
        };

        try {
            if (billForm.id) {
                await updateBill(billForm.id, bill);
                toast({ title: "Bill updated successfully" });
            } else {
                await addBill(bill);
                toast({ title: "Bill added successfully" });
            }
            resetBillForm();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save bill.",
                variant: "destructive"
            });
        }
    };

    const deleteBill = async (id: string) => {
        if (confirm("Are you sure you want to delete this bill?")) {
            try {
                await removeBill(id);
                toast({ title: "Bill deleted successfully" });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete bill.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleClearBills = async () => {
        if (confirm("Are you sure you want to delete ALL Wireman bills?")) {
            try {
                await asyncStorage.clearWiremanBills();
                await refreshBills();
                toast({ title: "Wireman bills cleared" });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to clear bills.",
                    variant: "destructive"
                });
            }
        }
    };

    // Columns
    const workerColumns = useMemo<ColumnDef<WiremanWorker>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        { accessorKey: "phoneNumber", header: "Phone" },
        { accessorKey: "joinDate", header: "Join Date" },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setWorkerForm(row.original); setShowWorkerForm(true); }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteWorker(row.original.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], []);

    const billColumns = useMemo<ColumnDef<WiremanBill>[]>(() => [
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
        },
        {
            id: "workerName",
            accessorFn: (row) => {
                const w = workers.find(x => x.id === row.workerId);
                return w ? w.name : 'Unknown';
            },
            header: "Worker",
        },
        {
            accessorKey: "billAmount",
            header: "Amount",
            cell: ({ row }) => `₹${row.original.billAmount.toFixed(2)}`
        },
        { accessorKey: "description", header: "Description" },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => deleteBill(row.original.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], [workers]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Wireman (Bill Based)</h2>
                <div className="flex gap-2">
                    <Button onClick={handleClearBills} variant="destructive" title="Clear all bill records">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Data
                    </Button>
                    <Button onClick={() => setShowBillForm(!showBillForm)} variant="secondary">
                        <Plus className="mr-2 h-4 w-4" />
                        {showBillForm ? "Cancel" : "Add Bill"}
                    </Button>
                    <Button onClick={() => setShowWorkerForm(!showWorkerForm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {showWorkerForm ? "Cancel" : "Add Wireman"}
                    </Button>
                </div>
            </div>

            {showWorkerForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{workerForm.id ? "Edit Wireman" : "Add New Wireman"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleWorkerSubmit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Name</Label>
                                <Input value={workerForm.name} onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <Input value={workerForm.phoneNumber} onChange={(e) => setWorkerForm({ ...workerForm, phoneNumber: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Join Date</Label>
                                <Input type="date" value={workerForm.joinDate} onChange={(e) => setWorkerForm({ ...workerForm, joinDate: e.target.value })} required />
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <Button type="submit">{workerForm.id ? "Update" : "Add"} Wireman</Button>
                                <Button type="button" variant="outline" onClick={resetWorkerForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {showBillForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add Bill</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBillSubmit} className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>Wireman</Label>
                                <Select value={billForm.workerId} onValueChange={(value) => setBillForm({ ...billForm, workerId: value })}>
                                    <SelectTrigger><SelectValue placeholder="Select wireman" /></SelectTrigger>
                                    <SelectContent>
                                        {workers.map((worker) => (
                                            <SelectItem key={worker.id} value={worker.id}>{worker.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input type="date" value={billForm.date} onChange={(e) => setBillForm({ ...billForm, date: e.target.value })} required />
                            </div>
                            <div>
                                <Label>Bill Amount (₹)</Label>
                                <Input type="number" value={billForm.billAmount} onChange={(e) => setBillForm({ ...billForm, billAmount: parseFloat(e.target.value) })} required />
                            </div>
                            <div>
                                <Label>Cycle</Label>
                                <Select value={billForm.cycle} onValueChange={(value: '1-15' | '16-30') => setBillForm({ ...billForm, cycle: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1-15">Days 1-15</SelectItem>
                                        <SelectItem value="16-30">Days 16-30</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Input value={billForm.description} onChange={(e) => setBillForm({ ...billForm, description: e.target.value })} placeholder="Bill description" required />
                            </div>
                            <div className="md:col-span-2 flex gap-2">
                                <Button type="submit">Add Bill</Button>
                                <Button type="button" variant="outline" onClick={resetBillForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Wireman Workers List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={workerColumns} data={workers} searchKey="name" />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Bill History</h3>
                    <DataTable
                        columns={billColumns}
                        data={[...bills].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                        searchKey="workerName"
                    />
                </div>
            </div>
        </div>
    );
}
