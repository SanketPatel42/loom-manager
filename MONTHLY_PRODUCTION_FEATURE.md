# Monthly Production Metrics Feature

## Overview
This feature displays total meters produced from the start of the current month, grouped by quality type, based on worker shift data entered in the Workers sheet.

## How It Works

### Data Source
- The feature reads production data from the Workers sheet (12 sheets × 12 machines per sheet)
- Each machine has day and night shift entries with "avg" values (meters produced in 12-hour shift)
- Each cell can be color-coded to indicate the quality being produced

### Calculation Logic
1. **Date Range**: Calculates from day 1 of current month to current day
2. **Data Aggregation**: 
   - Iterates through all 12 sheets
   - For each sheet, processes all machines (1-12)
   - Reads day and night shift values for each machine
   - Maps cell colors to quality IDs using the sheet's color-quality mapping
3. **Quality Grouping**: Accumulates meters by quality ID
4. **Display**: Shows total meters, day meters, and night meters for each quality

### Components

#### 1. `src/utils/productionMetrics.ts`
Utility functions for calculating production metrics:
- `calculateMonthlyProductionByQuality()`: Main calculation function
- `calculateTotalMetersProduced()`: Calculates grand total across all qualities

#### 2. `src/components/MonthlyProductionCard.tsx`
Dashboard card component that displays:
- Total meters produced (all qualities combined)
- Breakdown by quality showing:
  - Quality name
  - Day shift meters
  - Night shift meters
  - Total meters
- Current month and date range

#### 3. `src/pages/Index.tsx` (Updated)
Dashboard page now includes:
- Import of `MonthlyProductionCard` component
- Loading of worker sheet data and qualities
- Display of production metrics card

## Features

### Visual Display
- Clean card layout with primary color accent
- Total meters prominently displayed at top
- Individual quality breakdowns with hover effects
- Day/night shift split for each quality
- Badge indicators for quality type
- Empty state when no data available

### Data Handling
- Handles missing or null data gracefully
- Supports "Unassigned" quality for cells without color mapping
- Only counts days that have passed (excludes future dates)
- Processes all 12 sheets automatically
- Supports both object-style cell data `{value, color}` and legacy numeric values

## Usage

The production metrics card appears automatically on the dashboard below the "Production & Inventory" section. It updates in real-time as worker shift data is entered in the Workers sheet.

### Color-Quality Mapping
Each sheet has a color-quality mapping that determines which quality each colored cell represents:
- Red → Quality A
- Blue → Quality B
- Green → Quality C
- etc.

Cells without color (or with null color) are mapped to the default quality or marked as "Unassigned".

## Example Output

```
Monthly Production Metrics
March 1-6

Total Meters Produced: 12,450

Premium Cotton (Quality)
Day: 3,200m | Night: 2,800m
Total: 6,000

Standard Cotton (Quality)
Day: 3,500m | Night: 2,950m
Total: 6,450
```

## Technical Notes

- Uses React Query hooks for data fetching (`useWorkerSheetData`, `useQualities`)
- Calculations are performed client-side for real-time updates
- No database changes required - reads existing worker sheet data
- Compatible with existing data structure
- Handles both new and legacy data formats
