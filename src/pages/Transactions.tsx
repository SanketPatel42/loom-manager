import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactions, useFirms } from "@/hooks/useAsyncStorage";
import type { Transaction, Firm, FirmDocument } from "@/lib/types";
import { Plus, Pencil, Trash2, Building2, Upload, Download, FileText, ArrowUpDown, Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Transactions() {
  const { data: transactions, loading: tLoading, add, update, delete: deleteRecord } = useTransactions();
  const { data: firms, loading: fLoading, add: addFirm, update: updateFirm, delete: deleteFirm } = useFirms();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFirmDialogOpen, setIsFirmDialogOpen] = useState(false);
  const [editingFirmId, setEditingFirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    date: string;
    firm: string;
    type: 'Payment' | 'Received' | 'Other';
    amount: number;
    purpose: string;
    payee: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    firm: "",
    type: "Payment",
    amount: 0,
    purpose: "",
    payee: "",
  });
  const [firmFormData, setFirmFormData] = useState<{
    name: string;
    gstNumber: string;
    address: string;
    contactPerson: string;
    phoneNumber: string;
    email: string;
  }>({
    name: "",
    gstNumber: "",
    address: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
  });
  const { toast } = useToast();

  const loading = tLoading || fLoading;

  // Set default firm if firms loaded and none selected
  useEffect(() => {
    if (firms.length > 0 && !formData.firm && !editingId) {
      setFormData(prev => ({ ...prev, firm: firms[0].name }));
    }
  }, [firms, formData.firm, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firm) {
      toast({ title: "Please select a firm", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const transaction: Transaction = {
        id: editingId || Date.now().toString(),
        ...formData,
      };

      if (editingId) {
        await update(editingId, transaction);
        toast({ title: "Transaction updated successfully" });
      } else {
        await add(transaction);
        toast({ title: "Transaction added successfully" });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transaction.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      date: transaction.date,
      firm: transaction.firm,
      type: transaction.type,
      amount: transaction.amount,
      purpose: transaction.purpose,
      payee: transaction.payee,
    });
    setEditingId(transaction.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setSubmitting(true);
      try {
        await deleteRecord(id);
        toast({ title: "Transaction deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete transaction.",
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
      firm: firms.length > 0 ? firms[0].name : "",
      type: "Payment",
      amount: 0,
      purpose: "",
      payee: "",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleFirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const firm: Firm = {
        id: editingFirmId || Date.now().toString(),
        ...firmFormData,
        documents: editingFirmId
          ? firms.find(f => f.id === editingFirmId)?.documents || []
          : [],
      };

      if (editingFirmId) {
        await updateFirm(editingFirmId, firm);
        toast({ title: "Firm updated successfully" });
      } else {
        await addFirm(firm);
        toast({ title: "Firm added successfully" });
      }

      resetFirmForm();
      setIsFirmDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save firm information.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFirm = (firm: Firm) => {
    setFirmFormData({
      name: firm.name,
      gstNumber: firm.gstNumber,
      address: firm.address,
      contactPerson: firm.contactPerson,
      phoneNumber: firm.phoneNumber,
      email: firm.email,
    });
    setEditingFirmId(firm.id);
    setIsFirmDialogOpen(true);
  };

  const handleDeleteFirm = async (id: string) => {
    const firmToDelete = firms.find(f => f.id === id);
    const hasTransactions = transactions.some(t => t.firm === firmToDelete?.name);

    if (hasTransactions) {
      toast({
        title: "Cannot delete firm",
        description: "This firm has existing transactions. Please delete them first.",
        variant: "destructive"
      });
      return;
    }

    if (confirm("Are you sure you want to delete this firm?")) {
      setSubmitting(true);
      try {
        await deleteFirm(id);
        toast({ title: "Firm deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete firm.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const resetFirmForm = () => {
    setFirmFormData({
      name: "",
      gstNumber: "",
      address: "",
      contactPerson: "",
      phoneNumber: "",
      email: "",
    });
    setEditingFirmId(null);
  };

  const handleFileUpload = async (firmId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const firm = firms.find(f => f.id === firmId);
      if (!firm) return;

      const document: FirmDocument = {
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date().toISOString(),
        size: file.size,
        type: file.type,
        data: e.target?.result as string,
      };

      const updatedFirm = {
        ...firm,
        documents: [...firm.documents, document],
      };

      try {
        setSubmitting(true);
        await updateFirm(firmId, updatedFirm);
        toast({ title: "Document uploaded successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload document.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadDocument = (doc: FirmDocument) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  };

  const handleDeleteDocument = async (firmId: string, docId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      const firm = firms.find(f => f.id === firmId);
      if (!firm) return;

      const updatedFirm = {
        ...firm,
        documents: firm.documents.filter(d => d.id !== docId),
      };

      try {
        setSubmitting(true);
        await updateFirm(firmId, updatedFirm);
        toast({ title: "Document deleted successfully" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete document.",
          variant: "destructive"
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const firmBalances = useMemo(() => {
    return firms.map(firm => {
      const firmTransactions = transactions.filter(t => t.firm === firm.name);
      const balance = firmTransactions.reduce((sum, t) => {
        return t.type === 'Received' ? sum + t.amount : sum - t.amount;
      }, 0);
      return { firm: firm.name, firmId: firm.id, balance };
    });
  }, [firms, transactions]);

  const totalBalance = useMemo(() => {
    return firmBalances.reduce((sum, f) => sum + f.balance, 0);
  }, [firmBalances]);

  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: "firm",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Firm <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={
          row.original.type === 'Received' ? 'default' :
            row.original.type === 'Payment' ? 'destructive' :
              'secondary'
        }>
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Amount <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className={row.original.type === 'Received' ? 'text-green-600' : 'text-red-600'}>
          ₹{row.original.amount.toLocaleString()}
        </span>
      ),
    },
    { accessorKey: "purpose", header: "Purpose" },
    { accessorKey: "payee", header: "Payee/Receiver" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 page-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-heading">Firm Transaction Record</h2>
          <p className="text-muted-foreground">Manage transactions and firm information</p>
        </div>
        <div className="page-actions flex gap-2">
          <Dialog open={isFirmDialogOpen} onOpenChange={(open) => {
            setIsFirmDialogOpen(open);
            if (!open) resetFirmForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Firms
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFirmId ? "Edit Firm" : "Add New Firm"}</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Firm Information</TabsTrigger>
                  <TabsTrigger value="list">All Firms</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <form onSubmit={handleFirmSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="firmName">Firm Name *</Label>
                        <Input
                          id="firmName"
                          required
                          value={firmFormData.name}
                          onChange={(e) => setFirmFormData({ ...firmFormData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gstNumber">GST Number *</Label>
                        <Input
                          id="gstNumber"
                          required
                          value={firmFormData.gstNumber}
                          onChange={(e) => setFirmFormData({ ...firmFormData, gstNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={firmFormData.contactPerson}
                          onChange={(e) => setFirmFormData({ ...firmFormData, contactPerson: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={firmFormData.phoneNumber}
                          onChange={(e) => setFirmFormData({ ...firmFormData, phoneNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={firmFormData.email}
                          onChange={(e) => setFirmFormData({ ...firmFormData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={firmFormData.address}
                        onChange={(e) => setFirmFormData({ ...firmFormData, address: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        resetFirmForm();
                        setIsFirmDialogOpen(false);
                      }} disabled={submitting}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingFirmId ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          editingFirmId ? "Update Firm" : "Add Firm"
                        )}
                      </Button>
                    </div>
                  </form>

                  {editingFirmId && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Documents</h3>
                        <Label htmlFor={`upload-${editingFirmId}`} className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                            <Upload className="h-4 w-4" />
                            Upload Document
                          </div>
                          <Input
                            id={`upload-${editingFirmId}`}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(editingFirmId, e)}
                          />
                        </Label>
                      </div>

                      <div className="space-y-2">
                        {firms.find(f => f.id === editingFirmId)?.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {(doc.size / 1024).toFixed(2)} KB • {new Date(doc.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDocument(editingFirmId, doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {firms.find(f => f.id === editingFirmId)?.documents.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="list" className="space-y-4">
                  <div className="space-y-3">
                    {firms.map((firm) => (
                      <Card key={firm.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{firm.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">GST: {firm.gstNumber}</p>
                              {firm.contactPerson && (
                                <p className="text-sm text-muted-foreground">Contact: {firm.contactPerson}</p>
                              )}
                              {firm.phoneNumber && (
                                <p className="text-sm text-muted-foreground">Phone: {firm.phoneNumber}</p>
                              )}
                              {firm.documents.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {firm.documents.length} document(s)
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditFirm(firm)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteFirm(firm.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    {firms.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No firms added yet. Add your first firm to get started.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button onClick={() => { if (isAdding) resetForm(); else setIsAdding(true); }} className="btn-animated">
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Cancel" : "Add Transaction"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 card-grid">
        {firmBalances.map(({ firm, balance }) => (
          <Card key={firm} className={`animated-card stat-card border-none shadow-lg ${balance >= 0 ? 'stat-card-green bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background' : 'stat-card-red bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{firm}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{balance.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}

        <Card className={`animated-card stat-card border-none shadow-lg ${totalBalance >= 0 ? 'stat-card-blue bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background' : 'stat-card-red bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{totalBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdding && (
        <Card className="border border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="bg-primary/5 py-4">
            <CardTitle className="text-lg font-bold">{editingId ? "Edit Transaction" : "Add New Transaction"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="firm">Firm</Label>
                  <Select
                    value={formData.firm}
                    onValueChange={(value) => setFormData({ ...formData, firm: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={firms.length === 0 ? "No firms available" : "Select firm"} />
                    </SelectTrigger>
                    <SelectContent>
                      {firms.map((firm) => (
                        <SelectItem key={firm.id} value={firm.name}>
                          {firm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as 'Payment' | 'Received' | 'Other' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payment">Payment</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    required
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payee">Payee/Receiver</Label>
                  <Input
                    id="payee"
                    required
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingId ? "Update Transaction" : "Add Transaction"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                  Discard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground italic">Fetching transactions...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={transactions} searchKey="firm" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
