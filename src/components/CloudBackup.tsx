import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Cloud,
    CloudUpload,
    CloudDownload,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { cloudBackupService } from '@/lib/cloudBackup';
import { useToast } from '@/hooks/use-toast';
import { useFactory } from '@/lib/factoryContext';

const CloudBackup = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [backupInfo, setBackupInfo] = useState<{ exists: boolean; timestamp?: string; version?: string } | null>(null);
    const { toast } = useToast();
    const { activeFactory, markBackupAsComplete } = useFactory();

    const checkBackupInfo = async () => {
        if (!activeFactory) return;
        const info = await cloudBackupService.getBackupInfo(activeFactory.id);
        setBackupInfo(info);
    };

    // Check for existing backup on component mount and when factory changes
    useEffect(() => {
        checkBackupInfo();
    }, [activeFactory]);

    const handleBackup = async () => {
        if (!activeFactory) return;

        setIsBackingUp(true);

        try {
            const result = await cloudBackupService.backupToCloud(activeFactory.id);

            if (result.success) {
                toast({
                    title: '✓ Backup Successful',
                    description: `Data for ${activeFactory.name} backed up to cloud.`,
                });
                markBackupAsComplete(activeFactory.id);
                await checkBackupInfo();
            } else {
                toast({
                    title: '✗ Backup Failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: '✗ Backup Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        if (!activeFactory) return;

        const confirmed = window.confirm(
            `Restore data for ${activeFactory.name} from cloud? This will replace all current local data for this factory.`
        );

        if (!confirmed) return;

        setIsRestoring(true);

        try {
            const result = await cloudBackupService.restoreFromCloud(activeFactory.id);

            if (result.success) {
                toast({
                    title: '✓ Restore Successful',
                    description: 'Data restored. Reloading...',
                });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast({
                    title: '✗ Restore Failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
            toast({
                title: '✗ Restore Failed',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setIsRestoring(false);
        }
    };

    const isConfigured = cloudBackupService.isConfigured();

    return (
        <Card className="h-full border shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Cloud className="h-4 w-4 text-primary" />
                    Cloud Sync
                </CardTitle>
                <CardDescription className="text-xs">
                    Backup & restore data for active factory.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 flex-1">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        <span>Service Status</span>
                    </div>
                    {isConfigured ? (
                        <Badge variant="default" className="gap-1 h-5 text-[10px] bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="gap-1 h-5 text-[10px]">
                            <XCircle className="h-3 w-3" />
                            Not Configured
                        </Badge>
                    )}
                </div>

                {/* Last Backup Info */}
                {backupInfo?.exists && (
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-muted-foreground/10 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Latest Cloud Snapshot
                            </span>
                            <span className="font-medium text-foreground">
                                {backupInfo.timestamp
                                    ? new Date(backupInfo.timestamp).toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : 'Unknown'}
                            </span>
                        </div>
                    </div>
                )}

                <Separator className="bg-muted-foreground/10" />

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                        onClick={handleBackup}
                        disabled={isBackingUp || isRestoring || !isConfigured}
                        size="sm"
                        variant="default"
                        className="h-9 px-3 text-xs justify-start shadow-sm shadow-primary/20"
                    >
                        {isBackingUp ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                                <span className="truncate">Backing up...</span>
                            </>
                        ) : (
                            <>
                                <CloudUpload className="mr-2 h-4 w-4 shrink-0" />
                                <span className="truncate">Backup to Cloud</span>
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleRestore}
                        disabled={isBackingUp || isRestoring || !isConfigured || !backupInfo?.exists}
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 text-xs justify-start border-muted-foreground/20 hover:bg-primary/5"
                    >
                        {isRestoring ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                                <span className="truncate">Restoring...</span>
                            </>
                        ) : (
                            <>
                                <CloudDownload className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                <span className="truncate">Restore from Cloud</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Configuration Warning - Only show if not configured */}
                {!isConfigured && (
                    <div className="flex items-center gap-1.5 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded text-[10px] text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>Firebase setup incomplete. Check .env.local configuration.</span>
                    </div>
                )}
            </CardContent>
        </Card>

    );
};

export default CloudBackup;
