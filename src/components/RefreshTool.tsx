import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RefreshToolProps {
    onRefresh: () => Promise<void>;
}

export default function RefreshTool({ onRefresh }: RefreshToolProps) {
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const handleRefresh = async () => {
        setRefreshing(true);

        try {
            await onRefresh();
            toast({
                title: '✓ Data Refreshed',
                description: 'Dashboard data has been updated successfully',
            });
        } catch (error) {
            toast({
                title: '✗ Refresh Failed',
                description: error instanceof Error ? error.message : 'Unknown error',
                variant: 'destructive',
            });
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <RefreshCw className="h-4 w-4" />
                    Data Refresh
                </CardTitle>
                <CardDescription className="text-xs">
                    Fetch latest data from database
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Auto-sync enabled</span>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">Active</span>
                    </div>
                </div>

                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                >
                    {refreshing ? (
                        <>
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Refresh Now
                        </>
                    )}
                </Button>

                <div className="text-xs text-muted-foreground pt-1 border-t">
                    <p>Data updates automatically on CRUD operations</p>
                </div>
            </CardContent>
        </Card>
    );
}
