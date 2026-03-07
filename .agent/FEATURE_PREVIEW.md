# Monthly Production Metrics - Feature Preview

## Dashboard Location
The Monthly Production Metrics card appears on the main dashboard (Index page), positioned above the "Production & Inventory" section.

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Monthly Production Metrics              [March 1-6]          │
│ Total meters produced from start of month, grouped by quality   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📈 Total Meters Produced                      12,450      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ ☀️ Day Shift │  │ 🌙 Night Shift│  │ 📊 Qualities │         │
│  │    6,800     │  │     5,650     │  │      3       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Production Breakdown by Quality                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Premium Cotton [Quality]                                  │  │
│  │ ☀️ Day: 3,200m  🌙 Night: 2,800m                 6,000   │  │
│  │                                                   meters  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Standard Cotton [Quality]                                 │  │
│  │ ☀️ Day: 3,500m  🌙 Night: 2,950m                 6,450   │  │
│  │                                                   meters  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Summary Cards
- **Total Meters**: Primary color (blue) with light background
- **Day Shift**: Amber/yellow theme with sun icon
- **Night Shift**: Indigo/purple theme with moon icon
- **Qualities Count**: Green theme with activity icon

### Quality Items
- White/card background with border
- Hover effect: Light accent background
- Quality badge: Secondary variant
- Icons: Colored sun (amber) and moon (indigo)

## Data Display

### Top Section
1. **Header**: Title with Activity icon + Date range badge
2. **Description**: Explains data source (Workers sheet)
3. **Total Summary**: Large, prominent display of total meters
4. **Quick Stats**: Three cards showing day/night/quality counts

### Quality Breakdown
Each quality shows:
- Quality name (bold)
- Badge indicating if it's a defined quality or unassigned
- Day shift meters with sun icon
- Night shift meters with moon icon
- Total meters (large, right-aligned)

## Responsive Design
- Full width card (`col-span-full`)
- Grid layout adapts to screen size
- Mobile: Stacked layout
- Desktop: 3-column grid for summary cards

## Empty State
When no production data exists:
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Monthly Production Metrics              [March 1-6]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                 No production data available                     │
│                      for this month                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Interactive Features
- Hover effects on quality items
- Smooth transitions
- Responsive to data changes
- Auto-updates with worker sheet modifications

## Integration Points
- Reads from: Workers sheet (all 12 sheets)
- Uses: Color-quality mappings from sheet assignments
- Updates: Real-time via React Query hooks
- Displays: On main dashboard below urgent alerts
