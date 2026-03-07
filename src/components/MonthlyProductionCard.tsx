import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Sun, Moon } from "lucide-react";
import { calculateMonthlyProductionByQuality, calculateTotalMetersProduced } from "@/utils/productionMetrics";
import type { WorkerSheetData, Quality } from "@/lib/types";

interface MonthlyProductionCardProps {
  workerSheetData: WorkerSheetData | null;
  qualities: Quality[];
}

export default function MonthlyProductionCard({ workerSheetData, qualities }: MonthlyProductionCardProps) {
  const productionByQuality = calculateMonthlyProductionByQuality(workerSheetData, qualities);
  const totalMeters = calculateTotalMetersProduced(productionByQuality);

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const currentDay = now.getDate();

  // Calculate total day and night meters
  const totalDayMeters = productionByQuality.reduce((sum, item) => sum + item.dayMeters, 0);
  const totalNightMeters = productionByQuality.reduce((sum, item) => sum + item.nightMeters, 0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Monthly Production Metrics</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {monthName} 1-{currentDay}
          </Badge>
        </div>
        <CardDescription>
          Total meters produced from start of month, grouped by quality (from Workers sheet data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Summary */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20 md:col-span-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Meters Produced</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {totalMeters.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium">Day Shift</span>
              </div>
              <span className="text-lg font-bold text-amber-600">
                {totalDayMeters.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium">Night Shift</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {totalNightMeters.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Qualities</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {productionByQuality.length}
              </span>
            </div>
          </div>

          {/* Production by Quality */}
          {productionByQuality.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No production data available for this month
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="text-sm font-medium text-muted-foreground px-1">
                Production Breakdown by Quality
              </div>
              {productionByQuality.map((item) => (
                <div
                  key={item.qualityId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.qualityName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.qualityId === 'unassigned' ? 'No Quality' : 'Quality'}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Sun className="h-3 w-3 text-amber-500" />
                        Day: {item.dayMeters.toLocaleString()}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Moon className="h-3 w-3 text-indigo-500" />
                        Night: {item.nightMeters.toLocaleString()}m
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {item.totalMeters.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">meters</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
