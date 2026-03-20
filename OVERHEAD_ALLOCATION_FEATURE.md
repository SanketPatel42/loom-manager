# Overhead Cost Allocation Feature

## Quick Overview
The Overhead Cost Allocation feature automatically distributes monthly overhead expenses (electricity, rent, maintenance, etc.) across all fabric qualities based on their production volumes. This provides accurate per-meter overhead costs for comprehensive pricing decisions.

## Key Components

### 1. Monthly Overhead Inputs Panel
**Purpose**: Enter all overhead expenses for a specific month

**Features**:
- Add unlimited overhead line items
- Each entry: Name (text) + Amount (₹)
- Month/Year selector for historical tracking
- Auto-calculated Total Overhead
- Add/Delete entries dynamically

**Example Entries**:
- Electricity Bill: ₹50,000
- Factory Rent: ₹1,00,000
- Maintenance: ₹30,000
- Staff Salaries: ₹2,00,000

### 2. Production Input Section
**Purpose**: Record production volumes per quality

**Features**:
- One input row per quality
- Enter meters produced for selected month
- Auto-calculated Total Production
- Data persists per month

**Example**:
- ASW: 30,000 meters
- Wetless: 20,000 meters
- Total: 50,000 meters

### 3. Overhead Allocation Table
**Purpose**: Show automatic cost distribution

**Displays**:
- Quality Name
- Meters Produced
- Share (%) = Production share of total
- Allocated Overhead (₹) = Share × Total Overhead
- Overhead/Meter (₹) = Final per-meter cost

**Calculation Logic**:
```
Share % = (Quality Meters ÷ Total Meters) × 100
Allocated Overhead = (Share% / 100) × Total Overhead
Overhead per Meter = Allocated Overhead ÷ Quality Meters
```

### 4. Grand Total Summary
**Purpose**: Complete cost breakdown per quality

**Shows per meter**:
- Warp Yarn Cost
- Weft Yarn Cost
- Extra Costs (processing, dyeing, etc.)
- Overhead Cost
- **Grand Total** (highlighted)

## Data Storage

### Database Tables
1. **overhead_entries**
   - Stores overhead line items
   - Keyed by month (YYYY-MM)
   - Fields: id, month, name, amount

2. **monthly_production**
   - Stores production volumes
   - Keyed by month + quality_id
   - Fields: id, month, quality_id, meters_produced

### Historical Data
- All data preserved per month
- Browse past months using month selector
- Compare costs across different periods

## Usage Flow

1. **Select Month**: Choose current or historical month
2. **Enter Overhead**: Add all overhead expenses
3. **Input Production**: Enter meters produced per quality
4. **Review Allocation**: Check automatic distribution
5. **View Grand Total**: See complete cost per meter

## Benefits

### Accurate Costing
- Overhead distributed based on actual production
- No arbitrary allocation percentages
- Transparent cost breakdown

### Better Pricing
- Know true cost including overhead
- Set prices with confidence
- Maintain healthy profit margins

### Historical Analysis
- Track overhead trends over time
- Compare production efficiency
- Identify cost-saving opportunities

### Fair Distribution
- Each quality bears proportional overhead
- High-volume qualities don't subsidize low-volume
- Reflects actual resource consumption

## Example Calculation

**Scenario**: March 2026

**Overhead Entries**:
- Electricity: ₹50,000
- Rent: ₹1,00,000
- Maintenance: ₹30,000
- **Total: ₹1,80,000**

**Production**:
- ASW: 30,000m (60%)
- Wetless: 20,000m (40%)
- **Total: 50,000m**

**Allocation**:
- ASW: 60% × ₹1,80,000 = ₹1,08,000 → ₹3.60/meter
- Wetless: 40% × ₹1,80,000 = ₹72,000 → ₹3.60/meter

**Grand Total for ASW**:
- Warp: ₹2.50/m
- Weft: ₹3.20/m
- Extra: ₹1.00/m
- Overhead: ₹3.60/m
- **Total: ₹10.30/m**

## UI Design

### Color Scheme
- Orange: Overhead inputs section
- Blue: Production data section
- Purple: Allocation table
- Emerald: Grand total summary

### User Experience
- Real-time calculations
- Inline editing
- Clear visual hierarchy
- Responsive tables
- Month navigation

## Technical Notes

### Components
- `OverheadCostAllocation.tsx`: Main overhead management
- `GrandTotalSummary.tsx`: Final cost summary
- Integration with `QualityCostingTable.tsx`

### State Management
- React useState for local state
- Callbacks to parent for data sharing
- useMemo for calculated values
- Real-time updates on input changes

### Data Flow
1. User enters overhead and production data
2. Component calculates allocations
3. Passes allocations to parent (Costing page)
4. GrandTotalSummary combines with yarn costs
5. Displays complete cost breakdown

## Best Practices

### Data Entry
- Enter all overhead expenses monthly
- Update production data as soon as available
- Review allocations for accuracy
- Keep historical data for reference

### Cost Analysis
- Compare overhead/meter across months
- Identify seasonal variations
- Track efficiency improvements
- Use for budget planning

### Pricing Strategy
- Add desired profit margin to grand total
- Consider market rates
- Adjust for quality differences
- Review regularly based on cost changes
