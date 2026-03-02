
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileJson, Loader2, CloudUpload, CloudDownload, Disc, Database, Shield, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { generateBackupFile, importBackupFile } from '@/lib/backupUtils';
import { useToast } from '@/hooks/use-toast';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { browserDb } from '@/lib/browserDb';
import { createSqliteBackup, parseSqliteBackup, sqliteBytesToBlob, blobToSqliteBytes } from '@/lib/sqliteBackup';

const ManualBackupRestore = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { toast } = useToast();

    // Google Drive Hook
    const {
        isAuthenticated,
        isReady,
        isLoading: isGoogleLoading,
        handleAuthClick,
        uploadFile,
        downloadFile,
        downloadFileAsBlob,
        listFiles
    } = useGoogleDrive();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await generateBackupFile();
            if (result.success) {
                toast({
                    title: "Backup Downloaded",
                    description: `File saved: ${result.fileName}`,
                });
            } else {
                toast({
                    title: "Export Failed",
                    description: "Could not generate backup file.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "An unexpected error occurred during export.",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        document.getElementById('backup-file-input')?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            // Check if it's a .db file (SQLite) or .json file
            if (file.name.endsWith('.db')) {
                // SQLite restore
                const bytes = await blobToSqliteBytes(file);
                const { data } = await parseSqliteBackup(bytes);

                if (!data.beams && !data.takas) {
                    throw new Error("Invalid database backup: Missing core tables");
                }

                await browserDb.importData(data);
                toast({
                    title: "Database Restored",
                    description: "Data has been successfully restored from SQLite backup.",
                });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                // Legacy JSON restore
                const result = await importBackupFile(file);
                if (result.success) {
                    toast({
                        title: "Restore Successful",
                        description: "Data has been successfully enriched from the backup.",
                    });
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    toast({
                        title: "Restore Failed",
                        description: result.message,
                        variant: "destructive",
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to read backup file.",
                variant: "destructive",
            });
        } finally {
            setIsImporting(false);
            event.target.value = '';
        }
    };

    // --- Google Drive Handlers ---

    const handleGoogleUpload = async () => {
        if (!isAuthenticated) {
            handleAuthClick();
            return;
        }

        setIsExporting(true);
        try {
            // 1. Export all data from browser database
            const data = await browserDb.exportData();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

            // 2. Create SQLite database file
            toast({
                title: "Creating Database...",
                description: "Building SQLite backup file...",
            });

            const dbBytes = await createSqliteBackup(data);
            const dbBlob = sqliteBytesToBlob(dbBytes);
            const fileName = `loom_manager_backup_${timestamp}.db`;

            // 3. Upload as .db file to Google Drive
            toast({
                title: "Uploading...",
                description: "Uploading database to Google Drive...",
            });

            const file = await uploadFile(fileName, dbBlob, 'application/x-sqlite3');

            if (file && file.id) {
                // 4. Store reference
                localStorage.setItem('google_drive_backup_id', file.id);
                localStorage.setItem('google_drive_backup_date', new Date().toLocaleString());
                localStorage.setItem('google_drive_backup_format', 'sqlite');

                // Calculate file size for display
                const fileSizeKB = (dbBytes.length / 1024).toFixed(1);

                toast({
                    title: "✅ Database Uploaded",
                    description: `Backup saved as "${fileName}" (${fileSizeKB} KB)`,
                });
            } else {
                throw new Error("Upload failed or no ID returned");
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "Upload Failed",
                description: "Failed to upload database to Google Drive.",
                variant: "destructive"
            });
        } finally {
            setIsExporting(false);
        }
    };

    const handleGoogleRestore = async () => {
        if (!isAuthenticated) {
            handleAuthClick();
            return;
        }

        setIsImporting(true);
        const fileId = localStorage.getItem('google_drive_backup_id');
        const backupFormat = localStorage.getItem('google_drive_backup_format');

        try {
            let restored = false;

            // Strategy 1: Try the locally stored ID first
            if (fileId) {
                try {
                    if (backupFormat === 'sqlite') {
                        // New SQLite format
                        const blob = await downloadFileAsBlob(fileId);
                        if (blob) {
                            const bytes = await blobToSqliteBytes(blob);
                            const { data, metadata } = await parseSqliteBackup(bytes);
                            await browserDb.importData(data);

                            toast({
                                title: "✅ Database Restored",
                                description: `Restored from backup (v${metadata.version || '?'}, ${metadata.timestamp || 'unknown date'})`,
                            });
                            setTimeout(() => window.location.reload(), 1500);
                            restored = true;
                        }
                    } else {
                        // Legacy JSON format
                        const data = await downloadFile(fileId);
                        if (data) {
                            await browserDb.importData(data);
                            toast({
                                title: "Restore Successful",
                                description: "Data restored from linked backup.",
                            });
                            setTimeout(() => window.location.reload(), 1500);
                            restored = true;
                        }
                    }
                } catch (e) {
                    console.warn("Linked file download failed, trying discovery...", e);
                }
            }

            if (restored) return;

            // Strategy 2: Find latest backup in Drive
            const files = await listFiles();

            // Prefer .db files, fallback to .json
            const dbFiles = files.filter(f => f.name.startsWith('loom_manager_backup_') && f.name.endsWith('.db'));
            const jsonFiles = files.filter(f => f.name.startsWith('loom_manager_backup_') && f.name.endsWith('.json'));

            if (dbFiles.length > 0) {
                // Restore from SQLite .db file
                const fileToRestore = dbFiles[0];
                console.log("Found latest SQLite backup:", fileToRestore.name);

                const blob = await downloadFileAsBlob(fileToRestore.id);
                if (blob) {
                    const bytes = await blobToSqliteBytes(blob);
                    const { data, metadata } = await parseSqliteBackup(bytes);
                    await browserDb.importData(data);

                    localStorage.setItem('google_drive_backup_id', fileToRestore.id);
                    localStorage.setItem('google_drive_backup_date', new Date(fileToRestore.createdTime || Date.now()).toLocaleString());
                    localStorage.setItem('google_drive_backup_format', 'sqlite');

                    toast({
                        title: "✅ Database Restored",
                        description: `Restored from: ${fileToRestore.name}`,
                    });
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    throw new Error("Download failed");
                }
            } else if (jsonFiles.length > 0) {
                // Legacy JSON fallback
                const fileToRestore = jsonFiles[0];
                console.log("Found latest JSON backup:", fileToRestore.name);

                const data = await downloadFile(fileToRestore.id);
                if (data) {
                    await browserDb.importData(data);

                    localStorage.setItem('google_drive_backup_id', fileToRestore.id);
                    localStorage.setItem('google_drive_backup_date', new Date(fileToRestore.createdTime || Date.now()).toLocaleString());
                    localStorage.setItem('google_drive_backup_format', 'json');

                    toast({
                        title: "Restore Successful",
                        description: `Restored from: ${fileToRestore.name}`,
                    });
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    throw new Error("Download failed");
                }
            } else {
                toast({
                    title: "No Backup Found",
                    description: "No backup files found in Drive.",
                    variant: "destructive"
                });
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "Restore Failed",
                description: "Failed to download or parse backup from Drive.",
                variant: "destructive"
            });
        } finally {
            setIsImporting(false);
        }
    };

    const lastBackupDate = localStorage.getItem('google_drive_backup_date');
    const backupFormat = localStorage.getItem('google_drive_backup_format');

    return (
        <Card className="h-full border shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Database className="h-4 w-4 text-primary" />
                    Manual & Drive Backup
                </CardTitle>
                <CardDescription className="text-xs">
                    Managing your data locally or safely in Google Drive.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 flex-1">
                {/* Local Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        <Disc className="h-3.5 w-3.5" />
                        <span>Local File Storage</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={isExporting || isImporting}
                            className="h-9 px-3 text-xs justify-start hover:bg-primary/5 border-muted-foreground/20"
                        >
                            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" /> : <Download className="mr-2 h-4 w-4 shrink-0 text-primary" />}
                            <span className="truncate">Download Local Backup</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleImportClick}
                            disabled={isExporting || isImporting}
                            className="h-9 px-3 text-xs justify-start hover:bg-orange-500/5 border-muted-foreground/20"
                        >
                            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" /> : <Upload className="mr-2 h-4 w-4 shrink-0 text-orange-500" />}
                            <span className="truncate">Restore from File</span>
                        </Button>
                        <input
                            type="file"
                            id="backup-file-input"
                            className="hidden"
                            accept=".json,.db"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                            <CloudUpload className="h-3.5 w-3.5" />
                            <span>Google Drive Sync</span>
                        </div>
                        {/* Format Badge */}
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] h-4 font-normal">
                            <Shield className="h-2.5 w-2.5 mr-1" />
                            SQLite Format
                        </Badge>
                    </div>

                    {!isReady ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-md animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Initializing Google Services...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                variant={isAuthenticated ? "default" : "secondary"}
                                size="sm"
                                onClick={handleGoogleUpload}
                                disabled={isExporting || isImporting || isGoogleLoading}
                                className={`h-9 px-3 text-xs justify-start w-full transition-all ${isAuthenticated ? "shadow-sm shadow-primary/20" : ""}`}
                            >
                                {isGoogleLoading && isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" /> : <CloudUpload className="mr-2 h-4 w-4 shrink-0" />}
                                <span className="truncate">{isAuthenticated ? "Push to Drive" : "Connect & Sync"}</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGoogleRestore}
                                disabled={isExporting || isImporting || isGoogleLoading || !isAuthenticated}
                                className="h-9 px-3 text-xs justify-start w-full border-muted-foreground/20"
                            >
                                {isGoogleLoading && isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" /> : <CloudDownload className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />}
                                <span className="truncate">Pull from Drive</span>
                            </Button>
                        </div>
                    )}

                    {isAuthenticated && lastBackupDate && (
                        <div className="bg-muted/30 p-2.5 rounded-lg border border-muted-foreground/10 space-y-1">
                            <p className="text-[10px] text-muted-foreground flex items-center justify-between">
                                <span>Last Sync Date:</span>
                                <span className="text-foreground font-medium">{lastBackupDate}</span>
                            </p>
                            {backupFormat && (
                                <p className="text-[10px] text-muted-foreground flex items-center justify-between">
                                    <span>Database Format:</span>
                                    <span className={`font-semibold ${backupFormat === 'sqlite' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                        {backupFormat === 'sqlite' ? 'SQLite (.db)' : 'JSON (.json)'}
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <div className="flex items-center gap-1.5 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded text-[10px] text-red-600 dark:text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            <span>Authentication disabled: Client ID missing in system environment.</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

    );
};

export default ManualBackupRestore;
