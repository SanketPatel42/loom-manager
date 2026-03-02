import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { asyncStorage } from "@/lib/storage";
import { browserEncryption } from "@/lib/browserEncryption";
import { getActiveFactoryPrefix } from "@/lib/factoryContext";
import {
    Trash2, Moon, Sun, AlertTriangle, Shield, ShieldCheck, ShieldOff,
    Lock, Unlock, RefreshCw, Key, Database, Eye, EyeOff, Loader2
} from "lucide-react";
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useTheme } from "@/components/theme-provider";
import { UpdateManager } from "@/components/UpdateManager";


// Check if running in Electron
const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

interface EncryptionStatus {
    enabled: boolean;
    algorithm: string;
    keyStorage: string;
    sensitiveFields: Record<string, string[]>;
    createdAt?: string;
}

export default function Settings() {
    const { toast } = useToast();
    const [resetting, setResetting] = useState(false);
    const { theme, setTheme } = useTheme();

    // Encryption state
    const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus | null>(null);
    const [encryptionLoading, setEncryptionLoading] = useState(false);
    const [reencrypting, setReencrypting] = useState(false);
    const [showSensitiveFields, setShowSensitiveFields] = useState(false);

    // Load encryption status
    const loadEncryptionStatus = useCallback(async () => {
        try {
            if (isElectron && window.electronAPI?.encryptionGetStatus) {
                const status = await window.electronAPI.encryptionGetStatus();
                setEncryptionStatus(status);
            } else {
                // Browser mode
                const status = browserEncryption.getStatus();
                setEncryptionStatus(status);
            }
        } catch (e) {
            console.error('Failed to load encryption status:', e);
        }
    }, []);

    useEffect(() => {
        loadEncryptionStatus();
    }, [loadEncryptionStatus]);

    const handleThemeToggle = (checked: boolean) => {
        const newTheme = checked ? "dark" : "light";
        setTheme(newTheme);
        toast({
            title: "Theme updated",
            description: `Switched to ${newTheme} mode`,
        });
    };

    const handleEnableEncryption = async () => {
        setEncryptionLoading(true);
        try {
            let result: { success: boolean; message: string };

            if (isElectron && window.electronAPI?.encryptionEnable) {
                result = await window.electronAPI.encryptionEnable();
            } else {
                result = await browserEncryption.enable();
            }

            if (result.success) {
                toast({
                    title: "🔒 Encryption Enabled",
                    description: result.message,
                });

                // Re-encrypt existing data
                await handleReencryptData(true);
            } else {
                toast({
                    title: "Failed to enable encryption",
                    description: result.message,
                    variant: "destructive",
                });
            }

            await loadEncryptionStatus();
        } catch (e: any) {
            toast({
                title: "Error",
                description: e.message,
                variant: "destructive",
            });
        } finally {
            setEncryptionLoading(false);
        }
    };

    const handleDisableEncryption = async () => {
        setEncryptionLoading(true);
        try {
            // First decrypt all data
            if (isElectron && window.electronAPI?.encryptionDecryptAllData) {
                const factory = getActiveFactoryPrefix();
                await window.electronAPI.encryptionDecryptAllData(factory);
            }

            let result: { success: boolean; message: string };

            if (isElectron && window.electronAPI?.encryptionDisable) {
                result = await window.electronAPI.encryptionDisable();
            } else {
                result = await browserEncryption.disable();
            }

            if (result.success) {
                toast({
                    title: "🔓 Encryption Disabled",
                    description: "Data has been decrypted and encryption is now off.",
                });
            } else {
                toast({
                    title: "Failed to disable encryption",
                    description: result.message,
                    variant: "destructive",
                });
            }

            await loadEncryptionStatus();
        } catch (e: any) {
            toast({
                title: "Error",
                description: e.message,
                variant: "destructive",
            });
        } finally {
            setEncryptionLoading(false);
        }
    };

    const handleReencryptData = async (silent = false) => {
        setReencrypting(true);
        try {
            if (isElectron && window.electronAPI?.encryptionReencryptData) {
                const factory = getActiveFactoryPrefix();
                const result = await window.electronAPI.encryptionReencryptData(factory);

                if (!silent) {
                    toast({
                        title: result.success ? "✅ Data Re-encrypted" : "Error",
                        description: result.message,
                        variant: result.success ? "default" : "destructive",
                    });
                }
            } else if (!silent) {
                toast({
                    title: "Info",
                    description: "Browser encryption automatically encrypts data on next save.",
                });
            }
        } catch (e: any) {
            if (!silent) {
                toast({
                    title: "Error",
                    description: e.message,
                    variant: "destructive",
                });
            }
        } finally {
            setReencrypting(false);
        }
    };

    const handleResetData = async () => {
        setResetting(true);
        try {
            await asyncStorage.clearAll();
            toast({
                title: "Data reset successful",
                description: "All data has been cleared from the database",
            });

            if (window.electronAPI && window.electronAPI.reloadApp) {
                await window.electronAPI.reloadApp();
            } else {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            toast({
                title: "Error resetting data",
                description: error instanceof Error ? error.message : "Failed to reset data",
                variant: "destructive",
            });
        } finally {
            setResetting(false);
        }
    };

    // Format table name for display
    const formatTableName = (name: string): string => {
        return name
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^\w/, c => c.toUpperCase())
            .trim();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your application preferences</p>
            </div>

            {/* Appearance Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                        Appearance
                    </CardTitle>
                    <CardDescription>
                        Customize the look and feel of the application
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode" className="text-base">
                                Dark Mode
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Enable dark theme for better viewing in low light
                            </p>
                        </div>
                        <Switch
                            id="dark-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={handleThemeToggle}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Encryption & Security */}
            <Card className="border-primary/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Data Encryption & Security
                    </CardTitle>
                    <CardDescription>
                        Protect sensitive data with AES-256 encryption. Sensitive fields like phone numbers,
                        salaries, GST numbers, and financial data are encrypted at rest.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Status Banner */}
                    {encryptionStatus && (
                        <div className={`flex items-center gap-3 p-4 rounded-lg border ${encryptionStatus.enabled
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                            }`}>
                            {encryptionStatus.enabled ? (
                                <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                            ) : (
                                <ShieldOff className="h-6 w-6 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-sm">
                                    {encryptionStatus.enabled ? 'Encryption is Active' : 'Encryption is Disabled'}
                                </p>
                                <p className="text-xs opacity-80">
                                    {encryptionStatus.enabled
                                        ? `Using ${encryptionStatus.algorithm} • Key stored in ${encryptionStatus.keyStorage}`
                                        : 'Sensitive data is stored in plain text. Enable encryption for better security.'
                                    }
                                </p>
                            </div>
                            <Badge variant={encryptionStatus.enabled ? "default" : "secondary"} className={
                                encryptionStatus.enabled
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : ""
                            }>
                                {encryptionStatus.enabled ? 'ON' : 'OFF'}
                            </Badge>
                        </div>
                    )}

                    <Separator />

                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Enable Encryption
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Encrypt sensitive fields in the database using AES-256-GCM
                            </p>
                        </div>
                        {encryptionStatus?.enabled ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={encryptionLoading}
                                        className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                                    >
                                        {encryptionLoading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Unlock className="mr-2 h-4 w-4" />
                                        )}
                                        Disable
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <ShieldOff className="h-5 w-5 text-amber-500" />
                                            Disable Encryption?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will decrypt all currently encrypted data and store it in plain text.
                                            Your data will no longer be protected at rest. You can re-enable encryption at any time.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDisableEncryption}
                                            className="bg-amber-600 text-white hover:bg-amber-700"
                                        >
                                            <Unlock className="mr-2 h-4 w-4" />
                                            Disable Encryption
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleEnableEncryption}
                                disabled={encryptionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {encryptionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Lock className="mr-2 h-4 w-4" />
                                )}
                                Enable Encryption
                            </Button>
                        )}
                    </div>

                    {/* Re-encrypt button (only visible when encryption is on) */}
                    {encryptionStatus?.enabled && isElectron && (
                        <>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4" />
                                        Re-encrypt Existing Data
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Encrypt any existing plain-text records in the database
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReencryptData(false)}
                                    disabled={reencrypting}
                                >
                                    {reencrypting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    {reencrypting ? "Re-encrypting..." : "Re-encrypt Now"}
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Protected Fields Accordion */}
                    {encryptionStatus?.sensitiveFields && (
                        <>
                            <Separator />
                            <Accordion type="single" collapsible>
                                <AccordionItem value="fields" className="border-none">
                                    <AccordionTrigger className="py-2 hover:no-underline">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Key className="h-4 w-4" />
                                            Protected Fields
                                            <Badge variant="secondary" className="ml-1">
                                                {Object.values(encryptionStatus.sensitiveFields)
                                                    .reduce((sum, fields) => sum + fields.length, 0)} fields
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pt-2">
                                            {Object.entries(encryptionStatus.sensitiveFields).map(([table, fields]) => (
                                                <div key={table} className="flex items-start gap-3 text-sm">
                                                    <div className="flex items-center gap-1.5 min-w-[140px]">
                                                        <Database className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="font-medium">{formatTableName(table)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {fields.map(field => (
                                                            <Badge
                                                                key={field}
                                                                variant="outline"
                                                                className="text-xs font-mono"
                                                            >
                                                                {encryptionStatus.enabled && (
                                                                    <Lock className="mr-1 h-2.5 w-2.5 text-emerald-500" />
                                                                )}
                                                                {field}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </>
                    )}

                    {/* Encryption Info */}
                    {encryptionStatus?.enabled && encryptionStatus.createdAt && (
                        <>
                            <Separator />
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Algorithm</span>
                                    <p className="font-mono font-medium">{encryptionStatus.algorithm}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Key Storage</span>
                                    <p className="font-medium">{encryptionStatus.keyStorage}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Enabled Since</span>
                                    <p className="font-medium">
                                        {new Date(encryptionStatus.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Mode</span>
                                    <p className="font-medium">{isElectron ? 'Electron (Native)' : 'Browser (Web Crypto)'}</p>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible actions that affect your data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />

                    <div className="space-y-3">
                        <div>
                            <h4 className="text-sm font-medium">Reset All Data</h4>
                            <p className="text-sm text-muted-foreground">
                                This will permanently delete all records including beams, takas, sales, purchases, and all other data.
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={resetting}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {resetting ? "Resetting..." : "Reset All Data"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-2">
                                        <p>
                                            This action cannot be undone. This will permanently delete:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            <li>All beam records</li>
                                            <li>All taka stock records</li>
                                            <li>All sales and purchases</li>
                                            <li>All worker profiles and salary data</li>
                                            <li>All transactions and stock records</li>
                                            <li>All other data in the system</li>
                                        </ul>
                                        <p className="font-semibold text-destructive mt-3">
                                            Make sure you have a backup before proceeding!
                                        </p>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleResetData}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Yes, Reset All Data
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            {/* In-App Updates (Electron Only) */}
            {isElectron && <UpdateManager />}

            {/* App Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Application Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">0.0.0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Storage Type</span>
                        <span className="font-medium">
                            {typeof window !== 'undefined' && window.electronAPI ? 'Electron File System' : 'Browser Database'}
                        </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Encryption</span>
                        <span className="font-medium flex items-center gap-1.5">
                            {encryptionStatus?.enabled ? (
                                <>
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                                </>
                            ) : (
                                <>
                                    <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Inactive</span>
                                </>
                            )}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
