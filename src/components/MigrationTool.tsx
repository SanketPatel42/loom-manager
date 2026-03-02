import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  Upload,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { migrateFromLocalStorage, hasLocalStorageData, type MigrationResult } from '@/utils/migration';
import { useToast } from '@/hooks/use-toast';

export default function MigrationTool() {
  const [migrating, setMigrating] = useState(false);
  const { toast } = useToast();

  const hasData = hasLocalStorageData();

  const handleMigration = async () => {
    setMigrating(true);

    try {
      const result = await migrateFromLocalStorage();

      if (result.success) {
        toast({
          title: '✓ Migration Successful',
          description: result.message,
        });
      } else {
        toast({
          title: '✗ Migration Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '✗ Migration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setMigrating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4" />
          Data Migration
        </CardTitle>
        <CardDescription className="text-xs">
          Migrate from localStorage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">LocalStorage</span>
          {hasData ? (
            <Badge variant="default" className="gap-1 h-5 text-xs">
              <CheckCircle className="h-3 w-3" />
              Has Data
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 h-5 text-xs">
              <AlertTriangle className="h-3 w-3" />
              No Data
            </Badge>
          )}
        </div>

        <Separator />

        <Button
          onClick={handleMigration}
          disabled={!hasData || migrating}
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
        >
          {migrating ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Upload className="mr-1 h-3 w-3" />
              Migrate Data
            </>
          )}
        </Button>

        {!hasData && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            <p>No localStorage data found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}