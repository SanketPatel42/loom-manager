import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { asyncStorage } from '@/lib/storage';

export default function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus('checking');
    setError(null);

    try {
      const connected = await asyncStorage.testConnection();
      if (connected) {
        setStatus('connected');
      } else {
        setStatus('error');
        setError('Browser storage is not available');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="h-full border shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Database className="h-4 w-4 text-primary" />
          Database Status
        </CardTitle>
        <CardDescription className="text-xs">
          Enhanced browser storage system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            <span>Core Connectivity</span>
          </div>
          {status === 'connected' && (
            <Badge variant="default" className="gap-1 h-5 text-[10px] bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3" />
              Connected
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="destructive" className="gap-1 h-5 text-[10px]">
              <AlertCircle className="h-3 w-3" />
              Error
            </Badge>
          )}
          {status === 'checking' && (
            <Badge variant="secondary" className="gap-1 h-5 text-[10px] animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Checking...
            </Badge>
          )}
        </div>

        {error && (
          <div className="text-[10px] text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <Separator className="bg-muted-foreground/10" />

        <Button
          onClick={testConnection}
          disabled={testing}
          variant="outline"
          size="sm"
          className="w-full h-9 text-xs justify-start px-3 border-muted-foreground/20 hover:bg-primary/5"
        >
          {testing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin shrink-0" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4 shrink-0 text-primary" />
              Test Connection
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}