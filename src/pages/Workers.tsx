import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AgGridReact } from '@ag-grid-community/react';
import { ColDef, ColGroupDef, GridReadyEvent, CellEditingStoppedEvent, CellStyle, CellClickedEvent } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/localStorage";
import { useWorkerProfiles, useQualities, useWorkerSheetData } from "@/hooks/useAsyncStorage";
import type { WorkerProfile, Quality, WorkerSheetData, CellColorType, CellData, ColorQualityMapping, MachineSheetData, SheetAssignment, WorkerSplit } from "@/lib/types";
import { Save, Download, Undo, Redo, Copy, Palette, PaintBucket, Maximize2, Minimize2, Trash2, Plus, X, Calendar as CalendarIcon, Split, Info, BarChart3, ZoomIn, ZoomOut, Eye, EyeOff, TrendingUp, Activity, Loader2, Settings2, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


const MACHINES_PER_SHEET = 12;
const TOTAL_SHEETS = 12;

// Available colors for cell coloring
const AVAILABLE_COLORS: { name: string; value: CellColorType; bg: string; text: string }[] = [
  { name: 'White / No Color', value: null, bg: 'transparent', text: '#000000' },
  { name: 'Red', value: 'red', bg: '#ef4444', text: '#ffffff' },
  { name: 'Green', value: 'green', bg: '#22c55e', text: '#ffffff' },
  { name: 'Blue', value: 'blue', bg: '#3b82f6', text: '#ffffff' },
  { name: 'Yellow', value: 'yellow', bg: '#eab308', text: '#000000' },
  { name: 'Orange', value: 'orange', bg: '#f97316', text: '#ffffff' },
  { name: 'Purple', value: 'purple', bg: '#a855f7', text: '#ffffff' },
  { name: 'Grey', value: 'grey', bg: '#6b7280', text: '#ffffff' },
];


// Get days in current month
const getDaysInCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};

const SplitManagerDialog = ({
  title,
  splits = [],
  workers,
  onSave,
  cycle
}: {
  title: string,
  splits: WorkerSplit[] | undefined,
  workers: WorkerProfile[],
  onSave: (splits: WorkerSplit[]) => void,
  cycle: '1-15' | '16-30'
}) => {
  const [open, setOpen] = useState(false);
  const [localSplits, setLocalSplits] = useState<WorkerSplit[]>(splits || []);
  const [workerId, setWorkerId] = useState<string>('');
  const [startDay, setStartDay] = useState<number>(cycle === '1-15' ? 1 : 16);
  const [endDay, setEndDay] = useState<number>(cycle === '1-15' ? 15 : 30);

  useEffect(() => {
    setLocalSplits(splits || []);
  }, [splits, open]);

  const handleAddSplit = () => {
    if (!workerId) return;
    if (startDay > endDay) return;

    // Simple validation
    const newSplit: WorkerSplit = {
      workerId,
      startDay,
      endDay
    };

    const updated = [...localSplits, newSplit].sort((a, b) => a.startDay - b.startDay);
    setLocalSplits(updated);
    // Reset form
    setWorkerId('');
  };

  const handleRemoveSplit = (index: number) => {
    const updated = localSplits.filter((_, i) => i !== index);
    setLocalSplits(updated);
  };

  const handleSave = () => {
    onSave(localSplits);
    setOpen(false);
  };

  const minDay = cycle === '1-15' ? 1 : 16;
  const maxDay = cycle === '1-15' ? 15 : 31;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 text-xs gap-1" title="Manage Date Splits">
          <Split className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Splits</span>
          {splits && splits.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1 text-[10px]">{splits.length}</Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Assign different workers for specific date ranges within the current cycle ({cycle}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Split */}
          <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
            <h4 className="text-sm font-medium">Add New Assignment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Worker</Label>
                <Select value={workerId} onValueChange={setWorkerId}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select Worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">From Day</Label>
                  <Input
                    type="number"
                    min={minDay}
                    max={maxDay}
                    value={startDay}
                    onChange={e => setStartDay(parseInt(e.target.value) || minDay)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">To Day</Label>
                  <Input
                    type="number"
                    min={minDay}
                    max={maxDay}
                    value={endDay}
                    onChange={e => setEndDay(parseInt(e.target.value) || maxDay)}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
            <Button size="sm" onClick={handleAddSplit} disabled={!workerId} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Assignment
            </Button>
          </div>

          <Separator />

          {/* List Splits */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Assignments</h4>
            {localSplits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">No specific date assignments (using default).</p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {localSplits.map((split, idx) => {
                  const worker = workers.find(w => w.id === split.workerId);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded border bg-card text-card-foreground shadow-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-normal">
                          Day {split.startDay} - {split.endDay}
                        </Badge>
                        <span className="text-sm font-medium">{worker?.name || 'Unknown'}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveSplit(idx)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Workers() {
  const [activeSheet, setActiveSheet] = useState("1");
  const { data: workers = [], loading: wLoading } = useWorkerProfiles();
  const { data: qualities = [], loading: qLoading } = useQualities();
  const { data: workerSheetData, loading: sLoading, save: saveSheetData } = useWorkerSheetData();

  const [sheetAssignments, setSheetAssignments] = useState<Record<string, SheetAssignment>>({});
  const [gridData, setGridData] = useState<Record<string, MachineSheetData[]>>({});
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [activePaintColor, setActivePaintColor] = useState<CellColorType | undefined>(undefined);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI Enhancement states
  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [fontSize, setFontSize] = useState(13);
  const [showStats, setShowStats] = useState(true);
  const [showColorLegend, setShowColorLegend] = useState(true);

  const { toast } = useToast();
  const gridRef = useRef<AgGridReact>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const loading = wLoading || qLoading || sLoading;

  useEffect(() => {
    if (workerSheetData) {
      // Migrate old data format to new format
      const migratedGridData: Record<string, MachineSheetData[]> = {};
      Object.keys(workerSheetData.gridData).forEach(sheetKey => {
        const sheetData = workerSheetData.gridData[sheetKey];
        migratedGridData[sheetKey] = sheetData.map(row => {
          const newRow: MachineSheetData = { day: row.day };
          Object.keys(row).forEach(key => {
            if (key !== 'day') {
              const value = row[key];
              newRow[key] = getCellData(value);
            }
          });
          return newRow;
        });
      });

      // Migrate assignments
      const migratedAssignments: Record<string, SheetAssignment> = {};
      Object.keys(workerSheetData.assignments).forEach(sheetKey => {
        const assignment = workerSheetData.assignments[sheetKey];
        migratedAssignments[sheetKey] = {
          ...assignment,
          colorQualityMap: assignment.colorQualityMap || { 'null': '' },
        };
      });

      setSheetAssignments(migratedAssignments);
      setGridData(migratedGridData);
    } else if (!sLoading) {
      initializeGridData();
      initializeAssignments();
    }
  }, [workerSheetData, sLoading]);

  const initializeGridData = () => {
    const data: Record<string, MachineSheetData[]> = {};
    const daysInMonth = getDaysInCurrentMonth();

    for (let sheet = 1; sheet <= TOTAL_SHEETS; sheet++) {
      const sheetData: MachineSheetData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const row: MachineSheetData = {
          day,
        };

        // Initialize all machine columns with CellData objects
        for (let m = 1; m <= MACHINES_PER_SHEET; m++) {
          row[`machine${m}_day`] = { value: 0, color: null };
          row[`machine${m}_night`] = { value: 0, color: null };
        }

        sheetData.push(row);
      }

      data[sheet.toString()] = sheetData;
    }

    setGridData(data);
  };

  const initializeAssignments = () => {
    const assignments: Record<string, SheetAssignment> = {};
    for (let i = 1; i <= TOTAL_SHEETS; i++) {
      assignments[i.toString()] = {
        dayWorker: '',
        nightWorker: '',
        colorQualityMap: { 'null': '' }, // Default mapping for no color
        cycle: '1-15',
      };
    }
    setSheetAssignments(assignments);
  };

  const updateAssignment = (sheet: string, field: keyof SheetAssignment, value: string) => {
    setSheetAssignments(prev => {
      const updated = {
        ...prev,
        [sheet]: { ...prev[sheet], [field]: value },
      };
      saveToStorage(updated, gridData);
      return updated;
    });
  };

  const updateSplits = (sheet: string, field: 'dayWorkerSplits' | 'nightWorkerSplits', splits: WorkerSplit[]) => {
    setSheetAssignments(prev => {
      const updated = {
        ...prev,
        [sheet]: { ...prev[sheet], [field]: splits },
      };
      saveToStorage(updated, gridData);
      return updated;
    });
  };

  const saveToStorage = async (assignments: Record<string, SheetAssignment>, data: Record<string, MachineSheetData[]>) => {
    const sheetData: WorkerSheetData = {
      assignments,
      gridData: data,
      lastUpdated: new Date().toISOString(),
    };
    try {
      await saveSheetData(sheetData);
    } catch (error) {
      console.error("Failed to auto-save worker sheet data:", error);
    }
  };

  const copyAssignmentToAllSheets = () => {
    const current = sheetAssignments[activeSheet];
    const newAssignments: Record<string, SheetAssignment> = {};
    for (let i = 1; i <= TOTAL_SHEETS; i++) {
      newAssignments[i.toString()] = {
        ...current,
        colorQualityMap: { ...current.colorQualityMap }
      };
    }
    setSheetAssignments(newAssignments);
    saveToStorage(newAssignments, gridData);
    toast({ title: "Assignments copied to all sheets" });
  };

  // Helper function to get/create CellData from cell value
  const getCellData = (cellValue: any): CellData => {
    if (typeof cellValue === 'object' && cellValue !== null && 'value' in cellValue) {
      return cellValue as CellData;
    }
    // Legacy: if it's a number, convert to CellData
    return { value: typeof cellValue === 'number' ? cellValue : 0, color: null };
  };

  // Update color-quality mapping
  const updateColorQualityMapping = (color: string, qualityId: string) => {
    setSheetAssignments(prev => {
      const updated = {
        ...prev,
        [activeSheet]: {
          ...prev[activeSheet],
          colorQualityMap: {
            ...prev[activeSheet].colorQualityMap,
            [color]: qualityId,
          },
        },
      };
      saveToStorage(updated, gridData);
      return updated;
    });
  };

  // Toggle paint mode or apply to selection
  const handleColorButtonClick = (color: CellColorType) => {
    // If clicking the same color, toggle it off
    if (activePaintColor === color) {
      setActivePaintColor(undefined);
      return;
    }

    // Set as active paint color
    setActivePaintColor(color);

    // Also apply to currently selected cells if any
    const api = gridRef.current?.api;
    if (api) {
      const selectedRanges = api.getCellRanges();
      if (selectedRanges && selectedRanges.length > 0) {
        applyColorToSelectedCells(color);
      }
    }
  };

  // Apply color to selected cells
  const applyColorToSelectedCells = (color: CellColorType) => {
    const api = gridRef.current?.api;
    if (!api) return;

    const selectedRanges = api.getCellRanges();
    if (!selectedRanges || selectedRanges.length === 0) return;

    const updatedData = [...gridData[activeSheet]];
    let cellsUpdated = 0;

    selectedRanges.forEach(range => {
      if (!range.startRow || !range.endRow) return;

      const startRow = Math.min(range.startRow.rowIndex, range.endRow.rowIndex);
      const endRow = Math.max(range.startRow.rowIndex, range.endRow.rowIndex);

      range.columns.forEach(col => {
        const field = col.getColId();
        if (field === 'day') return;

        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
          const row = updatedData[rowIndex];
          if (row) {
            const cellData = getCellData(row[field]);
            // Only update if color is different
            if (cellData.color !== color) {
              row[field] = { ...cellData, color };
              cellsUpdated++;
            }
          }
        }
      });
    });

    if (cellsUpdated > 0) {
      setGridData(prev => ({ ...prev, [activeSheet]: updatedData }));
      saveToStorage(sheetAssignments, { ...gridData, [activeSheet]: updatedData });
      api.refreshCells({ force: true });

      const colorName = AVAILABLE_COLORS.find(c => c.value === color)?.name || 'color';
      toast({
        title: `✓ Color applied`,
        description: `${colorName} applied to ${cellsUpdated} cell(s)`
      });
    }
  };

  // Handle cell click for paint mode
  const onCellClicked = useCallback((params: CellClickedEvent) => {
    // Check if paint mode is active (activePaintColor is not undefined)
    if (activePaintColor === undefined) return;

    const field = params.colDef.field;
    if (!field || field === 'day') return;

    const rowIndex = params.rowIndex;
    if (rowIndex === null || rowIndex === undefined) return;

    const currentData = gridData[activeSheet];
    const row = currentData[rowIndex];
    const cellData = getCellData(row[field]);

    // If color is already the same, do nothing
    if (cellData.color === activePaintColor) return;

    // Apply color
    const updatedData = [...currentData];
    updatedData[rowIndex] = {
      ...row,
      [field]: { ...cellData, color: activePaintColor }
    };

    setGridData(prev => ({ ...prev, [activeSheet]: updatedData }));
    saveToStorage(sheetAssignments, { ...gridData, [activeSheet]: updatedData });

    // Force refresh the specific cell
    params.api.refreshCells({ rowNodes: [params.node], columns: [field], force: true });

  }, [activePaintColor, activeSheet, gridData, sheetAssignments]);

  const columnDefs = useMemo<(ColDef | ColGroupDef)[]>(() => {
    const sheetNum = parseInt(activeSheet);
    const startMachine = (sheetNum - 1) * MACHINES_PER_SHEET + 1;

    const cols: (ColDef | ColGroupDef)[] = [
      {
        field: 'day',
        headerName: 'Day',
        pinned: 'left',
        lockPosition: true,
        width: viewDensity === 'compact' ? 60 : viewDensity === 'comfortable' ? 80 : 90,
        editable: false,
        cellStyle: (params) => {
          return {
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: `${fontSize}px`,
            padding: viewDensity === 'compact' ? '4px' : viewDensity === 'comfortable' ? '8px' : '12px',
          };
        },
      },
    ];

    // Add machine columns with grouped headers (Machine number on top, Day/Night below)
    for (let m = 1; m <= MACHINES_PER_SHEET; m++) {
      const actualMachineNum = startMachine + m - 1;

      const createCellConfig = (field: string, headerName: string): ColDef => ({
        field,
        headerName,
        width: viewDensity === 'compact' ? 80 : viewDensity === 'comfortable' ? 90 : 100,
        editable: true,
        type: 'numericColumn',
        cellEditor: 'agTextCellEditor',
        cellEditorParams: {
          maxLength: 10,
        },
        // Display the value from CellData with formatting
        valueGetter: (params) => {
          const cellValue = params.data?.[field];
          const cellData = getCellData(cellValue);
          return cellData.value;
        },
        valueFormatter: (params) => {
          const value = params.value;
          if (value === 0 || value === null || value === undefined) return '-';
          // Format with 2 decimal places and thousands separator
          return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          }).format(value);
        },
        // Update the value while preserving color OR using active paint color
        valueSetter: (params) => {
          const cellValue = params.data[field];
          const cellData = getCellData(cellValue);
          const newValue = params.newValue;

          let numValue = 0;
          if (newValue !== '' && newValue !== null && newValue !== undefined) {
            const num = parseFloat(newValue);
            numValue = isNaN(num) ? 0 : Math.round(num * 100) / 100;
          }

          // Use activePaintColor if set, otherwise keep existing color
          const colorToUse = activePaintColor !== undefined ? activePaintColor : cellData.color;

          params.data[field] = { value: numValue, color: colorToUse };
          return true;
        },
        // Apply background color based on cell color with improved styling
        cellStyle: (params): CellStyle => {
          const cellValue = params.data?.[field];
          const cellData = getCellData(cellValue);
          const colorObj = AVAILABLE_COLORS.find(c => c.value === cellData.color);

          // Only apply custom background/text when a color is explicitly set
          const style: CellStyle = {
            fontSize: `${fontSize}px`,
            fontWeight: cellData.value > 0 ? '500' : '400',
            textAlign: 'center',
            padding: viewDensity === 'compact' ? '4px' : viewDensity === 'comfortable' ? '8px' : '12px',
          };

          if (colorObj && colorObj.value !== null) {
            style.backgroundColor = colorObj.bg;
            style.color = colorObj.text;
          }

          return style;
        },
        cellClass: 'hover:ring-1 hover:ring-primary/20 transition-all',
      });

      const groupDef: ColGroupDef = {
        headerName: `M${actualMachineNum}`,
        headerClass: 'ag-header-center',
        children: [
          createCellConfig(`machine${m}_day`, 'Day'),
          createCellConfig(`machine${m}_night`, 'Night'),
        ],
      };
      cols.push(groupDef);
    }

    return cols;
  }, [activeSheet, activePaintColor, viewDensity, fontSize]); // Re-create cols when view settings change

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: false,
    filter: false,
    suppressMenu: true,
  }), []);

  const onCellEditingStopped = useCallback((event: CellEditingStoppedEvent) => {
    if (event.valueChanged) {
      // Save state for undo
      const oldData = [...gridData[activeSheet]];
      setUndoStack(prev => [...prev.slice(-9), oldData]);
      setRedoStack([]);

      // Save to localStorage
      saveToStorage(sheetAssignments, gridData);

      // Auto-save with debounce
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        toast({ title: "Auto-saved", duration: 1000 });
      }, 1000);
    }
  }, [activeSheet, gridData, sheetAssignments, toast]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Grid is ready
  }, []);

  const navigateToNextCell = useCallback((params: any) => {
    const previousCell = params.previousCellPosition;
    const suggestedNextCell = params.nextCellPosition;
    const key = params.key;

    let nextRowIndex = previousCell.rowIndex;
    let nextColumn = previousCell.column;

    switch (key) {
      case 'Enter':
        // Enter moves down, Shift+Enter moves up
        if (params.event?.shiftKey) {
          nextRowIndex = Math.max(0, previousCell.rowIndex - 1);
        } else {
          nextRowIndex = Math.min((gridData[activeSheet]?.length || 0) - 1, previousCell.rowIndex + 1);
        }
        return {
          rowIndex: nextRowIndex,
          column: nextColumn,
        };
      case 'Tab':
        // Tab moves right, Shift+Tab moves left (use default behavior)
        return suggestedNextCell;
      default:
        // For arrow keys and other keys, use default behavior but don't navigate while editing
        if (params.editing) {
          return null; // Prevent navigation while editing
        }
        return suggestedNextCell;
    }
  }, [activeSheet, gridData]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, gridData[activeSheet]]);
    setGridData(prev => ({ ...prev, [activeSheet]: prevState }));
    setUndoStack(prev => prev.slice(0, -1));
    toast({ title: "Undo", duration: 1000 });
  }, [undoStack, gridData, activeSheet, toast]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, gridData[activeSheet]]);
    setGridData(prev => ({ ...prev, [activeSheet]: nextState }));
    setRedoStack(prev => prev.slice(0, -1));
    toast({ title: "Redo", duration: 1000 });
  }, [redoStack, gridData, activeSheet, toast]);

  const handleExport = useCallback(async () => {
    if (gridRef.current?.api) {
      const fileName = `sheet-${activeSheet}-${new Date().toISOString().split('T')[0]}.csv`;

      // Check if running in Electron
      if (window.electronAPI?.saveCsvFile) {
        try {
          // Manually construct CSV from grid data
          const columnDefs = gridRef.current.api.getColumnDefs();
          const rowData: any[] = [];
          gridRef.current.api.forEachNodeAfterFilterAndSort((node) => {
            rowData.push(node.data);
          });

          console.log('Column defs:', columnDefs?.length);
          console.log('Row data:', rowData.length);

          if (!columnDefs || !rowData || rowData.length === 0) {
            toast({
              title: "Export failed",
              description: "No data to export",
              variant: "destructive",
            });
            return;
          }

          // Build CSV header
          const headers: string[] = [];
          const processColumnDef = (cols: any[]) => {
            cols.forEach((col: any) => {
              if (col.children) {
                // Group column, process children
                processColumnDef(col.children);
              } else if (col.field) {
                headers.push(col.headerName || col.field);
              }
            });
          };
          processColumnDef(columnDefs);

          // Build CSV rows
          const csvRows: string[] = [headers.join(',')];

          rowData.forEach(row => {
            const values: string[] = [];
            const processRow = (cols: any[]) => {
              cols.forEach((col: any) => {
                if (col.children) {
                  processRow(col.children);
                } else if (col.field) {
                  let cellValue = row[col.field];
                  // Handle CellData objects
                  if (cellValue && typeof cellValue === 'object' && 'value' in cellValue) {
                    cellValue = cellValue.value;
                  }
                  values.push(cellValue !== undefined && cellValue !== null ? String(cellValue) : '');
                }
              });
            };
            processRow(columnDefs);
            csvRows.push(values.join(','));
          });

          const csvContent = csvRows.join('\n');

          console.log('CSV Content length:', csvContent.length);
          console.log('CSV preview:', csvContent.substring(0, 200));

          // Save using Electron API
          const result = await window.electronAPI.saveCsvFile(fileName, csvContent);

          if (result.success && result.filePath) {
            toast({
              title: "✓ Exported to CSV",
              description: `File saved to: ${result.filePath}`,
              duration: 5000,
            });
          } else {
            toast({
              title: "Export failed",
              description: result.error || "Unknown error",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Export error:', error);
          toast({
            title: "Export failed",
            description: String(error),
            variant: "destructive",
          });
        }
      } else {
        // Fallback to browser download if not in Electron
        gridRef.current.api.exportDataAsCsv({
          fileName: fileName,
        });
        toast({ title: "Exported to CSV" });
      }
    }
  }, [activeSheet, toast]);

  const duplicateYesterdayRow = useCallback(() => {
    const currentData = gridData[activeSheet];
    if (!currentData || currentData.length < 2) {
      toast({ title: "Not enough data to duplicate", variant: "destructive" });
      return;
    }

    const lastRow = currentData[currentData.length - 1];
    const secondLastRow = currentData[currentData.length - 2];

    const newRow = { ...lastRow };
    for (let m = 1; m <= MACHINES_PER_SHEET; m++) {
      // Copy CellData objects including colors
      const dayData = getCellData(secondLastRow[`machine${m}_day`]);
      const nightData = getCellData(secondLastRow[`machine${m}_night`]);
      newRow[`machine${m}_day`] = { ...dayData };
      newRow[`machine${m}_night`] = { ...nightData };
    }

    const newData = [...currentData.slice(0, -1), newRow];
    setGridData(prev => ({ ...prev, [activeSheet]: newData }));
    toast({ title: "Yesterday's data duplicated" });
  }, [activeSheet, gridData, toast]);

  const { clear: clearSheetData } = useWorkerSheetData();

  const handleClearData = useCallback(async () => {
    if (confirm("Are you sure you want to clear ALL worker sheet data? This action cannot be undone.")) {
      try {
        setIsSubmitting(true);
        await clearSheetData();
        initializeGridData();
        initializeAssignments();
        toast({ title: "Worker sheet data cleared" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear worker sheet data.",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [clearSheetData, toast]);

  const currentAssignment = sheetAssignments[activeSheet] || {
    dayWorker: '',
    nightWorker: '',
    colorQualityMap: { 'null': '' },
    cycle: '1-15'
  };
  const currentGridData = gridData[activeSheet] || [];

  // Calculate statistics for current sheet
  const stats = useMemo(() => {
    const data = currentGridData;
    if (!data || data.length === 0) {
      return {
        totalProduction: 0,
        avgPerDay: 0,
        avgPerMachine: 0,
        activeDays: 0,
        activeMachines: 0,
        maxDaily: 0,
        minDaily: 0,
      };
    }

    let totalProduction = 0;
    let activeDays = 0;
    let maxDaily = 0;
    let minDaily = Infinity;
    const machineProduction: number[] = new Array(MACHINES_PER_SHEET).fill(0);

    data.forEach(row => {
      let dailyTotal = 0;

      for (let m = 1; m <= MACHINES_PER_SHEET; m++) {
        const dayValue = getCellData(row[`machine${m}_day`]).value;
        const nightValue = getCellData(row[`machine${m}_night`]).value;
        const machineTotal = dayValue + nightValue;

        totalProduction += machineTotal;
        dailyTotal += machineTotal;
        machineProduction[m - 1] += machineTotal;
      }

      if (dailyTotal > 0) {
        activeDays++;
        maxDaily = Math.max(maxDaily, dailyTotal);
        minDaily = Math.min(minDaily, dailyTotal);
      }
    });

    const activeMachines = machineProduction.filter(p => p > 0).length;

    return {
      totalProduction,
      avgPerDay: activeDays > 0 ? totalProduction / activeDays : 0,
      avgPerMachine: activeMachines > 0 ? totalProduction / activeMachines : 0,
      activeDays,
      activeMachines,
      maxDaily: maxDaily === 0 ? 0 : maxDaily,
      minDaily: minDaily === Infinity ? 0 : minDaily,
    };
  }, [currentGridData]);

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading worker sheet data...</p>
          </div>
        </div>
      )}
      {/* Top toolbar */}
      <header className="flex justify-between items-center px-6 py-3 bg-card border-b border-border shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Maximize2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Worker & Machine Sheet</h1>
            <p className="text-xs text-muted-foreground font-medium">Manage daily production and assignments</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("h-8 text-xs font-medium", isExpanded && "bg-background shadow-sm text-primary")}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5 mr-1.5" /> : <Maximize2 className="h-3.5 w-3.5 mr-1.5" />}
              {isExpanded ? "Focus View" : "Split View"}
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            <Select value={viewDensity} onValueChange={(v: any) => setViewDensity(v)}>
              <SelectTrigger className="h-8 text-xs border-none bg-transparent hover:bg-background w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="h-8 w-8 p-0"
              title="Decrease font size"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground min-w-[28px] text-center">{fontSize}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(Math.min(20, fontSize + 1))}
              className="h-8 w-8 p-0"
              title="Increase font size"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Toggle Stats & Legend */}
          <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className={cn("h-8 text-xs px-2", showStats && "bg-background shadow-sm")}
              title="Toggle statistics panel"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorLegend(!showColorLegend)}
              className={cn("h-8 text-xs px-2", showColorLegend && "bg-background shadow-sm")}
              title="Toggle color legend"
            >
              <Palette className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8 mx-1" />

          <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length === 0} className="h-9 px-3">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0} className="h-9 px-3">
            <Redo className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-8 mx-1" />

          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearData} className="h-9 gap-2">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear Sheet</span>
          </Button>
          <Button size="sm" onClick={() => toast({ title: "Data is auto-saved" })} className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </header>

      <Tabs value={activeSheet} onValueChange={setActiveSheet} className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-card border-b border-border px-4 pt-1">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-2 mb-[-1px]">
            {/* Scrollable container for tabs if needed */}
            <div className="flex overflow-x-auto no-scrollbar w-full gap-1 pb-1">
              {Array.from({ length: TOTAL_SHEETS }, (_, i) => (
                <TabsTrigger
                  key={i + 1}
                  value={(i + 1).toString()}
                  className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:border-b-card border border-transparent rounded-t-lg px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-primary transition-all relative top-[1px]"
                >
                  Sheet {i + 1}
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
        </div>

        {Array.from({ length: TOTAL_SHEETS }, (_, i) => {
          const sheetNum = (i + 1).toString();
          const assignment = sheetAssignments[sheetNum] || {
            dayWorker: '',
            nightWorker: '',
            colorQualityMap: { 'null': '' },
            cycle: '1-15'
          };

          return (
            <TabsContent
              key={sheetNum}
              value={sheetNum}
              className="flex-1 flex flex-col m-0 overflow-hidden data-[state=inactive]:hidden bg-background"
            >
              {/* Controls Area - Compact and focused */}
              {!isExpanded && (
                <div className="px-6 py-2.5 border-b bg-card space-y-3 flex-shrink-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Worker Assignments Context */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Machine Group {sheetNum}</span>
                          <h2 className="text-sm font-bold text-foreground">
                            M{(parseInt(sheetNum) - 1) * MACHINES_PER_SHEET + 1} – {parseInt(sheetNum) * MACHINES_PER_SHEET}
                          </h2>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-muted-foreground">Day:</label>
                          <div className="flex items-center gap-1">
                            <Select
                              value={assignment.dayWorker}
                              onValueChange={(val) => updateAssignment(sheetNum, 'dayWorker', val)}
                            >
                              <SelectTrigger className="h-8 w-[130px] text-xs bg-background">
                                <SelectValue placeholder="Worker" />
                              </SelectTrigger>
                              <SelectContent>
                                {workers.map(w => (
                                  <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <SplitManagerDialog
                              title="Day Worker Splits"
                              splits={assignment.dayWorkerSplits}
                              workers={workers}
                              onSave={(splits) => updateSplits(sheetNum, 'dayWorkerSplits', splits)}
                              cycle={assignment.cycle}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-muted-foreground">Night:</label>
                          <div className="flex items-center gap-1">
                            <Select
                              value={assignment.nightWorker}
                              onValueChange={(val) => updateAssignment(sheetNum, 'nightWorker', val)}
                            >
                              <SelectTrigger className="h-8 w-[130px] text-xs bg-background">
                                <SelectValue placeholder="Worker" />
                              </SelectTrigger>
                              <SelectContent>
                                {workers.map(w => (
                                  <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <SplitManagerDialog
                              title="Night Worker Splits"
                              splits={assignment.nightWorkerSplits}
                              workers={workers}
                              onSave={(splits) => updateSplits(sheetNum, 'nightWorkerSplits', splits)}
                              cycle={assignment.cycle}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-muted-foreground">Cycle:</label>
                          <Select
                            value={assignment.cycle}
                            onValueChange={(val) => updateAssignment(sheetNum, 'cycle', val as '1-15' | '16-30')}
                          >
                            <SelectTrigger className="h-8 w-[110px] text-xs bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-15" className="text-xs">Days 1–15</SelectItem>
                              <SelectItem value="16-30" className="text-xs">Days 16–30</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-muted/30 p-1 rounded-full border border-border pr-2">
                        <div className="flex items-center gap-1 px-1">
                          {AVAILABLE_COLORS.map((colorOption) => (
                            <button
                              key={colorOption.name}
                              type="button"
                              onClick={() => handleColorButtonClick(colorOption.value)}
                              className={cn(
                                "w-6 h-6 rounded-full border border-white/20 transition-all hover:scale-110",
                                activePaintColor === colorOption.value && "ring-2 ring-primary ring-offset-1 z-10 scale-110 shadow-md"
                              )}
                              style={{ backgroundColor: colorOption.bg }}
                              title={colorOption.name}
                            />
                          ))}
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-1 rounded-full hover:bg-background">
                              <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Paint & Quality Mapping</DialogTitle>
                              <DialogDescription>Map colors to qualities.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              {AVAILABLE_COLORS.map((colorOption) => {
                                const colorKey = colorOption.value === null ? 'null' : colorOption.value;
                                return (
                                  <div key={colorKey} className="flex flex-col gap-1.5 p-3 rounded-lg border bg-muted/20">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: colorOption.bg }} />
                                      <span className="text-xs font-medium">{colorOption.name}</span>
                                    </div>
                                    <Select
                                      value={assignment.colorQualityMap?.[colorKey] || ''}
                                      onValueChange={(val) => updateColorQualityMapping(colorKey, val)}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Map quality..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none" className="text-xs">Unmapped</SelectItem>
                                        {qualities.map(q => <SelectItem key={q.id} value={q.id} className="text-xs">{q.name}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                );
                              })}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={(e: any) => e.target.closest('[role="dialog"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>Close</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={copyAssignmentToAllSheets} title="Copy to All" className="h-8 px-2">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={duplicateYesterdayRow} className="h-8 px-2 text-[10px] font-semibold">
                          Dup Prev
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}{/* Spreadsheet grid */}
              <div className="flex-1 overflow-hidden bg-card relative">
                {/* Floating toolbar when expanded - positioned at top of grid */}
                {isExpanded && (
                  <div className="absolute top-2 left-2 right-2 z-40 flex items-center justify-between bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        Sheet {sheetNum}
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          (M{(parseInt(sheetNum) - 1) * MACHINES_PER_SHEET + 1}-{parseInt(sheetNum) * MACHINES_PER_SHEET})
                        </span>
                      </span>
                      <div className="w-px h-5 bg-border" />
                      <div className="flex items-center gap-1.5">
                        <PaintBucket className="w-3.5 h-3.5 text-muted-foreground" />
                        {AVAILABLE_COLORS.map((colorOption) => (
                          <button
                            key={colorOption.name}
                            type="button"
                            onClick={() => handleColorButtonClick(colorOption.value)}
                            className={cn(
                              "w-5 h-5 rounded-full border border-border shadow-sm transition-transform hover:scale-110",
                              activePaintColor === colorOption.value && "ring-2 ring-primary ring-offset-1 scale-110"
                            )}
                            style={{ backgroundColor: colorOption.bg }}
                            title={colorOption.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {(assignment.dayWorker || assignment.nightWorker) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {workers.find(w => w.id === assignment.dayWorker)?.name || '-'}
                          </Badge>
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            {workers.find(w => w.id === assignment.nightWorker)?.name || '-'}
                          </Badge>
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={duplicateYesterdayRow} className="h-6 text-[10px] px-2">
                        Dup. Prev
                      </Button>
                    </div>
                  </div>
                )}

                <div className={cn("ag-theme-alpine h-full sheets-grid dark:sheets-grid-dark", isExpanded && "pt-12")}>
                  <AgGridReact
                    ref={gridRef}
                    rowData={activeSheet === sheetNum ? currentGridData : []}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    modules={[ClientSideRowModelModule]}
                    onGridReady={onGridReady}
                    onCellEditingStopped={onCellEditingStopped}
                    onCellClicked={onCellClicked}
                    navigateToNextCell={navigateToNextCell}
                    suppressRowClickSelection={true}
                    enableCellTextSelection={true}
                    ensureDomOrder={true}
                    suppressHorizontalScroll={false}
                    suppressMenuHide={true}
                    rowSelection="multiple"
                    enterNavigatesVertically={true}
                    enterNavigatesVerticallyAfterEdit={true}
                    suppressMovableColumns={true}
                    enableRangeSelection={true}
                    enableFillHandle={true}
                    undoRedoCellEditing={true}
                    undoRedoCellEditingLimit={10}
                    stopEditingWhenCellsLoseFocus={true}
                    singleClickEdit={true}
                  />
                </div>

                {/* Floating Stats Panel */}
                {showStats && (
                  <Card className="absolute top-4 right-4 w-72 shadow-lg border-2 bg-card/95 backdrop-blur-sm z-40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Sheet Statistics
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowStats(false)}
                          className="ml-auto h-6 w-6 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold">Total Production</p>
                          <p className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(stats.totalProduction)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold">Active Days</p>
                          <p className="text-xl font-bold text-blue-600">{stats.activeDays}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold">Avg/Day</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(stats.avgPerDay)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase text-gray-500 font-semibold">Avg/Machine</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(stats.avgPerMachine)}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Active Machines:</span>
                          <Badge variant="secondary" className="font-semibold">
                            {stats.activeMachines}/{MACHINES_PER_SHEET}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Peak Daily:</span>
                          <span className="font-semibold text-green-600">
                            {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(stats.maxDaily)}
                          </span>
                        </div>
                        {stats.minDaily > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Low Daily:</span>
                            <span className="font-semibold text-orange-600">
                              {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(stats.minDaily)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Floating Color Legend */}
                {showColorLegend && (
                  <Card className="absolute bottom-4 right-4 w-64 shadow-lg border-2 bg-card/95 backdrop-blur-sm z-40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Palette className="h-4 w-4 text-orange-500" />
                        Color Legend
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowColorLegend(false)}
                          className="ml-auto h-6 w-6 p-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {AVAILABLE_COLORS.map((colorOption) => {
                        const colorKey = colorOption.value === null ? 'null' : colorOption.value;
                        const qualityId = assignment.colorQualityMap?.[colorKey] || '';
                        const quality = qualities.find(q => q.id === qualityId);

                        return (
                          <div key={colorKey} className="flex items-center gap-2 text-xs">
                            <div
                              className="w-4 h-4 rounded shadow-sm flex-shrink-0 border border-border"
                              style={{ backgroundColor: colorOption.bg }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-medium truncate">{colorOption.name}</p>
                              {quality && (
                                <p className="text-[10px] text-muted-foreground truncate">→ {quality.name}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
