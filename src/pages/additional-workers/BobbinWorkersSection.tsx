import { useState, useMemo } from "react";
import type { BobbinWorker, BobbinAttendance } from "@/lib/types";
import { useBobbinWorkers, useBobbinAttendance } from "@/hooks/useAsyncStorage";
import { asyncStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, Calendar, ArrowUpDown } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface BobbinWorkersSectionProps {
    workers: BobbinWorker[];
    attendance: BobbinAttendance[];
}

interface BulkAttendanceWorker {
    workerId: string;
    selected: boolean;
    type: 'full' | 'half';
}

const INITIAL_FORM = {
    id: '',
    name: '',
    phoneNumber: '',
    fullDaySalary: 0,
    joinDate: new Date().toISOString().split('T')[0],
};

export function BobbinWorkersSection({ workers, attendance }: BobbinWorkersSectionProps) {
    const { add: addWorker, update: updateWorker, delete: removeWorker, isAdding: iaw, isUpdating: iuw, isDeleting: idw } = useBobbinWorkers();
    const { add: addAttendance, delete: removeAttendance, isAdding: iaa, isDeleting: ida, refresh: refreshAttendance } = useBobbinAttendance();
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [bulkAttendanceForm, setBulkAttendanceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        cycle: (new Date().getDate() <= 15 ? '1-15' : '16-30') as '1-15' | '16-30',
        workers: [] as BulkAttendanceWorker[],
    });

    const submitting = iaw || iuw || iaa;

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const worker: BobbinWorker = {
            ...form,
            id: form.id || Date.now().toString(),
        };

        try {
            if (form.id) {
                await updateWorker(form.id, worker);
                toast({ title: "Bobbin worker updated successfully" });
            } else {
                await addWorker(worker);
                toast({ title: "Bobbin worker added successfully" });
            }
            resetForm();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save Bobbin worker.",
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

    // Attendance handlers
    const initializeBulkAttendanceForm = () => {
        const workersList: BulkAttendanceWorker[] = workers.map(worker => ({
            workerId: worker.id,
            selected: true,
            type: 'full' as 'full' | 'half',
        }));
        setBulkAttendanceForm({
            date: new Date().toISOString().split('T')[0],
            cycle: (new Date().getDate() <= 15 ? '1-15' : '16-30') as '1-15' | '16-30',
            workers: workersList,
        });
    };

    const handleBulkAttendanceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedWorkers = bulkAttendanceForm.workers.filter(w => w.selected);

        if (selectedWorkers.length === 0) {
            toast({ title: "No workers selected", description: "Please select at least one worker", variant: "destructive" });
            return;
        }

        try {
            const promises = selectedWorkers.map(worker => {
                const att: BobbinAttendance = {
                    id: Date.now().toString() + '_' + worker.workerId,
                    workerId: worker.workerId,
                    date: bulkAttendanceForm.date,
                    type: worker.type,
                    cycle: bulkAttendanceForm.cycle,
                };
                return addAttendance(att);
            });

            await Promise.all(promises);
            toast({ title: "Attendance marked successfully", description: `Marked attendance for ${selectedWorkers.length} worker(s)` });
            setShowAttendanceForm(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark attendance.",
                variant: "destructive"
            });
        }
    };

    const toggleWorkerSelection = (workerId: string) => {
        setBulkAttendanceForm(prev => ({
            ...prev,
            workers: prev.workers.map(w => w.workerId === workerId ? { ...w, selected: !w.selected } : w),
        }));
    };

    const updateWorkerType = (workerId: string, type: 'full' | 'half') => {
        setBulkAttendanceForm(prev => ({
            ...prev,
            workers: prev.workers.map(w => w.workerId === workerId ? { ...w, type } : w),
        }));
    };

    const toggleAllWorkers = (selected: boolean) => {
        setBulkAttendanceForm(prev => ({
            ...prev,
            workers: prev.workers.map(w => ({ ...w, selected })),
        }));
    };

    const deleteAttendance = async (id: string) => {
        if (confirm("Are you sure you want to delete this attendance record?")) {
            try {
                await removeAttendance(id);
                toast({ title: "Attendance deleted successfully" });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete attendance.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleClearAttendance = async () => {
        if (confirm("Are you sure you want to delete ALL Bobbin attendance records?")) {
            try {
                await asyncStorage.clearBobbinAttendance();
                await refreshAttendance();
                toast({ title: "Bobbin attendance cleared" });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to clear attendance.",
                    variant: "destructive"
                });
            }
        }
    };

    // Columns
    const workerColumns = useMemo<ColumnDef<BobbinWorker>[]>(() => [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "fullDaySalary",
            header: "Rate/Day",
            cell: ({ row }) => `₹${row.original.fullDaySalary.toFixed(2)}`
        },
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

    const attendanceColumns = useMemo<ColumnDef<BobbinAttendance>[]>(() => [
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
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="secondary" className={`font-normal ${row.original.type === 'full' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                    {row.original.type === 'full' ? 'Full Day' : 'Half Day'}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={async () => {
                        if (confirm("Are you sure you want to edit this attendance record?")) {
                            try {
                                await removeAttendance(row.original.id);
                                toast({ title: "Attendance record removed. Please mark again." });
                            } catch (error) {
                                toast({
                                    title: "Error",
                                    description: "Failed to remove attendance record.",
                                    variant: "destructive"
                                });
                            }
                        }
                    }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAttendance(row.original.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ], [workers]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Bobbin Workers (Attendance Based)</h2>
                <div className="flex gap-2">
                    <Button onClick={handleClearAttendance} variant="destructive" title="Clear all attendance records">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear Data
                    </Button>
                    <Button
                        onClick={() => {
                            if (!showAttendanceForm) initializeBulkAttendanceForm();
                            setShowAttendanceForm(!showAttendanceForm);
                        }}
                        variant="secondary"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {showAttendanceForm ? "Cancel" : "Mark Attendance"}
                    </Button>
                    {!showAttendanceForm && (
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            {showForm ? "Cancel" : "Add Worker"}
                        </Button>
                    )}
                </div>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{form.id ? "Edit Worker" : "Add New Bobbin Worker"}</CardTitle>
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
                                <Label>Full Day Salary (₹)</Label>
                                <Input type="number" value={form.fullDaySalary} onChange={(e) => setForm({ ...form, fullDaySalary: parseFloat(e.target.value) })} required />
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

            {showAttendanceForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mark Attendance - Bulk Selection</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select workers and mark their attendance type for the day
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBulkAttendanceSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 pb-4 border-b">
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" value={bulkAttendanceForm.date} onChange={(e) => setBulkAttendanceForm({ ...bulkAttendanceForm, date: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Cycle</Label>
                                    <Select value={bulkAttendanceForm.cycle} onValueChange={(value: '1-15' | '16-30') => setBulkAttendanceForm({ ...bulkAttendanceForm, cycle: value })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-15">Days 1-15</SelectItem>
                                            <SelectItem value="16-30">Days 16-30</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <Label className="text-base font-semibold">Select Workers</Label>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => toggleAllWorkers(true)}>Select All</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => toggleAllWorkers(false)}>Deselect All</Button>
                                    </div>
                                </div>

                                {workers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No Bobbin workers available. Please add workers first.
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                                        {bulkAttendanceForm.workers.map((workerData) => {
                                            const worker = workers.find(w => w.id === workerData.workerId);
                                            if (!worker) return null;
                                            return (
                                                <div key={worker.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${workerData.selected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <input type="checkbox" checked={workerData.selected} onChange={() => toggleWorkerSelection(worker.id)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{worker.name}</div>
                                                            <div className="text-sm text-gray-500">₹{worker.fullDaySalary.toFixed(2)}/day</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name={`bobbin-type-${worker.id}`} value="full" checked={workerData.type === 'full'} onChange={() => updateWorkerType(worker.id, 'full')} disabled={!workerData.selected} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                            <span className={`text-sm ${!workerData.selected ? 'text-gray-400' : 'text-gray-700'}`}>Full Day</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="radio" name={`bobbin-type-${worker.id}`} value="half" checked={workerData.type === 'half'} onChange={() => updateWorkerType(worker.id, 'half')} disabled={!workerData.selected} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                                            <span className={`text-sm ${!workerData.selected ? 'text-gray-400' : 'text-gray-700'}`}>Half Day</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {bulkAttendanceForm.workers.filter(w => w.selected).length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-900">
                                        <strong>{bulkAttendanceForm.workers.filter(w => w.selected).length}</strong> worker(s) selected
                                        {' • '}
                                        <strong>{bulkAttendanceForm.workers.filter(w => w.selected && w.type === 'full').length}</strong> full day
                                        {' • '}
                                        <strong>{bulkAttendanceForm.workers.filter(w => w.selected && w.type === 'half').length}</strong> half day
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t">
                                <Button type="submit" disabled={workers.length === 0}>Mark Attendance</Button>
                                <Button type="button" variant="outline" onClick={() => setShowAttendanceForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bobbin Workers List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={workerColumns} data={workers} searchKey="name" />
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700">Attendance History</h3>
                    <DataTable
                        columns={attendanceColumns}
                        data={[...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                    />
                </div>
            </div>
        </div>
    );
}
