import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Download, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";


export function UpdateManager() {
    const { toast } = useToast();
    const [status, setStatus] = useState<string>("idle");
    const [updateInfo, setUpdateInfo] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (!window.electronAPI) return;

        const removeStatusListener = window.electronAPI.onUpdateStatus((newStatus: string, info: any) => {
            console.log("[Update Manager] Status change:", newStatus, info);
            setStatus(newStatus);
            if (newStatus === "available") {
                setUpdateInfo(info);
            } else if (newStatus === "downloaded") {
                setUpdateInfo(info);
            } else if (newStatus === "error") {
                setError(info);
            }
            if (newStatus !== "checking") {
                setChecking(false);
            }
        });

        const removeProgressListener = window.electronAPI.onUpdateDownloadProgress((newProgress: any) => {
            setProgress(newProgress);
        });

        return () => {
            removeStatusListener();
            removeProgressListener();
        };
    }, []);

    const checkForUpdates = async () => {
        if (!window.electronAPI) return;
        setChecking(true);
        setError(null);
        try {
            await window.electronAPI.checkForUpdates();
        } catch (err: any) {
            setError(err.message);
            setChecking(false);
        }
    };

    const startDownload = async () => {
        if (!window.electronAPI) return;
        setStatus("downloading");
        try {
            await window.electronAPI.startDownloadUpdate();
        } catch (err: any) {
            setError(err.message);
            setStatus("error");
        }
    };

    const quitAndInstall = () => {
        if (!window.electronAPI) return;
        window.electronAPI.quitAndInstall();
    };

    if (!window.electronAPI) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">In-App Updates</CardTitle>
                    <CardDescription>Updates are only available in the desktop application.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className={`h-5 w-5 ${checking ? 'animate-spin text-primary' : ''}`} />
                            Software Updates
                        </CardTitle>
                        <CardDescription>Check for and install the latest version</CardDescription>
                    </div>
                    {status === "idle" && (
                        <Button size="sm" onClick={checkForUpdates} disabled={checking}>
                            {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Check for Updates
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === "checking" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking for updates...
                    </div>
                )}

                {status === "not-available" && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            You're using the latest version.
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
                            Check Again
                        </Button>
                    </div>
                )}

                {status === "available" && updateInfo && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-sm">Update Available: v{updateInfo.version}</h4>
                                <p className="text-xs text-muted-foreground">Released on {new Date(updateInfo.releaseDate).toLocaleDateString()}</p>
                            </div>
                            <Badge variant="default" className="bg-primary hover:bg-primary">New</Badge>
                        </div>
                        <Button className="w-full" onClick={startDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Update
                        </Button>
                    </div>
                )}

                {status === "downloading" && progress && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span>Downloading update...</span>
                            <span>{Math.round(progress.percent)}%</span>
                        </div>
                        <Progress value={progress.percent} />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{(progress.transferred / 1024 / 1024).toFixed(2)} MB / {(progress.total / 1024 / 1024).toFixed(2)} MB</span>
                            <span>{(progress.bytesPerSecond / 1024).toFixed(2)} KB/s</span>
                        </div>
                    </div>
                )}

                {status === "downloaded" && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <h4 className="font-semibold text-sm">Update ready to install!</h4>
                        </div>
                        <p className="text-xs opacity-80 italic">The application will restart to complete the installation. All your data will remain safe.</p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={quitAndInstall}>
                            Restart & Install Now
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <h4 className="font-semibold text-sm">Update Failed</h4>
                        </div>
                        <p className="text-xs opacity-80">{error || "Something went wrong while updating."}</p>
                        <Button variant="outline" className="w-full" onClick={() => setStatus("idle")}>
                            Try Again
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
