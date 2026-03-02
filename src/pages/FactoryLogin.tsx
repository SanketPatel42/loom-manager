import { useState } from "react";
import { useFactory, FactoryProfile } from "@/lib/factoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Factory,
    MapPin,
    Plus,
    ArrowRight,
    Clock,
    Pencil,
    Trash2,
    Building2,
    Cloud,
    CloudOff,
} from "lucide-react";

const FACTORY_COLORS = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Emerald", value: "#10b981" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Fuchsia", value: "#d946ef" },
    { name: "Teal", value: "#14b8a6" },
];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function FactoryLogin() {
    const { factories, selectFactory, addFactory, updateFactory, deleteFactory } =
        useFactory();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingFactory, setEditingFactory] = useState<FactoryProfile | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        description: "",
        color: FACTORY_COLORS[0].value,
    });

    const resetForm = () => {
        setFormData({
            name: "",
            location: "",
            description: "",
            color: FACTORY_COLORS[0].value,
        });
    };

    const handleAdd = () => {
        if (!formData.name.trim() || !formData.location.trim()) return;
        const factory = addFactory({
            name: formData.name.trim(),
            location: formData.location.trim(),
            description: formData.description.trim() || undefined,
            color: formData.color,
        });
        setShowAddDialog(false);
        resetForm();
        // Auto-select the newly created factory
        selectFactory(factory.id);
    };

    const handleEdit = () => {
        if (!editingFactory || !formData.name.trim() || !formData.location.trim())
            return;
        updateFactory(editingFactory.id, {
            name: formData.name.trim(),
            location: formData.location.trim(),
            description: formData.description.trim() || undefined,
            color: formData.color,
        });
        setEditingFactory(null);
        resetForm();
    };

    const openEditDialog = (factory: FactoryProfile, e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData({
            name: factory.name,
            location: factory.location,
            description: factory.description || "",
            color: factory.color,
        });
        setEditingFactory(factory);
    };

    const sortedFactories = [...factories].sort(
        (a, b) =>
            new Date(b.lastAccessedAt).getTime() -
            new Date(a.lastAccessedAt).getTime()
    );

    return (
        <div className="factory-login-page">
            {/* Animated background */}
            <div className="factory-login-bg">
                <div className="factory-login-bg-orb factory-login-bg-orb-1" />
                <div className="factory-login-bg-orb factory-login-bg-orb-2" />
                <div className="factory-login-bg-orb factory-login-bg-orb-3" />
            </div>

            <div className="factory-login-container">
                {/* Header section */}
                <div className="factory-login-header">
                    <div className="factory-login-logo">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <h1 className="factory-login-title">Grey Loom Manager</h1>
                    <p className="factory-login-subtitle">
                        Select a factory to continue, or create a new one
                    </p>
                </div>

                {/* Factory cards grid */}
                {sortedFactories.length > 0 && (
                    <div className="factory-login-grid">
                        {sortedFactories.map((factory, index) => (
                            <div
                                key={factory.id}
                                className="factory-card"
                                style={{
                                    "--factory-color": factory.color,
                                    animationDelay: `${index * 0.08}s`,
                                } as React.CSSProperties}
                                onClick={() => selectFactory(factory.id)}
                            >
                                <div className="factory-card-accent" />
                                <div className="factory-card-content">
                                    <div className="factory-card-top">
                                        <div
                                            className="factory-card-icon"
                                            style={{ background: factory.color }}
                                        >
                                            <Factory className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="factory-card-actions">
                                            <button
                                                className="factory-card-action-btn"
                                                onClick={(e) => openEditDialog(factory, e)}
                                                title="Edit factory"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button
                                                        className="factory-card-action-btn factory-card-action-btn-danger"
                                                        onClick={(e) => e.stopPropagation()}
                                                        title="Delete factory"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Factory?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete <strong>{factory.name}</strong> and all its data including beams, takas, workers, salary records, and everything else. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => deleteFactory(factory.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Factory & Data
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <h3 className="factory-card-name">{factory.name}</h3>

                                    <div className="factory-card-location">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{factory.location}</span>
                                    </div>

                                    {factory.description && (
                                        <p className="factory-card-desc">{factory.description}</p>
                                    )}

                                    <div className="flex items-center gap-2 mt-auto pt-2 mb-2">
                                        {factory.lastBackupAt ? (
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                                <Cloud className="h-3 w-3" />
                                                <span>Backed up {formatRelativeTime(factory.lastBackupAt)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                                                <CloudOff className="h-3 w-3" />
                                                <span>Not backed up yet</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="factory-card-footer">
                                        <div className="factory-card-time">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {formatDate(factory.lastAccessedAt)} •{" "}
                                                {formatTime(factory.lastAccessedAt)}
                                            </span>
                                        </div>
                                        <div className="factory-card-enter">
                                            <span>Enter</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {factories.length === 0 && (
                    <div className="factory-login-empty">
                        <Factory className="h-16 w-16 opacity-30" />
                        <p className="factory-login-empty-text">
                            No factories yet. Create your first factory profile to get started.
                        </p>
                    </div>
                )}

                {/* Add factory button */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <button className="factory-add-btn" onClick={resetForm}>
                            <Plus className="h-5 w-5" />
                            <span>Add New Factory</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Factory className="h-5 w-5" />
                                Add New Factory
                            </DialogTitle>
                            <DialogDescription>
                                Create a profile for a new factory location. Each factory stores its data separately.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="factory-name">Factory Name *</Label>
                                <Input
                                    id="factory-name"
                                    placeholder="e.g. Main Factory, Unit 2"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((d) => ({ ...d, name: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="factory-location">Location *</Label>
                                <Input
                                    id="factory-location"
                                    placeholder="e.g. Surat, Bhiwandi, Mumbai"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData((d) => ({ ...d, location: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="factory-desc">Description</Label>
                                <Textarea
                                    id="factory-desc"
                                    placeholder="Optional notes about this factory..."
                                    value={formData.description}
                                    rows={2}
                                    onChange={(e) =>
                                        setFormData((d) => ({ ...d, description: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color Tag</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {FACTORY_COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            className={`factory-color-swatch ${formData.color === c.value ? "factory-color-swatch-active" : ""}`}
                                            style={{ background: c.value }}
                                            onClick={() =>
                                                setFormData((d) => ({ ...d, color: c.value }))
                                            }
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdd}
                                disabled={!formData.name.trim() || !formData.location.trim()}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create & Enter
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit dialog */}
                <Dialog
                    open={!!editingFactory}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingFactory(null);
                            resetForm();
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Pencil className="h-5 w-5" />
                                Edit Factory
                            </DialogTitle>
                            <DialogDescription>
                                Update the factory profile details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="edit-factory-name">Factory Name *</Label>
                                <Input
                                    id="edit-factory-name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((d) => ({ ...d, name: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-factory-location">Location *</Label>
                                <Input
                                    id="edit-factory-location"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData((d) => ({ ...d, location: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-factory-desc">Description</Label>
                                <Textarea
                                    id="edit-factory-desc"
                                    value={formData.description}
                                    rows={2}
                                    onChange={(e) =>
                                        setFormData((d) => ({ ...d, description: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Color Tag</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {FACTORY_COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            className={`factory-color-swatch ${formData.color === c.value ? "factory-color-swatch-active" : ""}`}
                                            style={{ background: c.value }}
                                            onClick={() =>
                                                setFormData((d) => ({ ...d, color: c.value }))
                                            }
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditingFactory(null);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEdit}
                                disabled={!formData.name.trim() || !formData.location.trim()}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
