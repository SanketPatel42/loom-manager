# Quality Costing Feature

## Overview
The Quality Costing feature provides comprehensive production cost analysis for each fabric quality. It includes yarn costing, overhead allocation, and a complete cost breakdown per meter. The feature integrates seamlessly with the existing Automatic Quality Calculations.

## Main Sections

### 1. Yarn Costing (Section 1)
Calculate direct yarn costs based on purchase rates and fabric specifications.

**Features:**
- **Warp Cost**: Automatically calculated as `Warp Weight (kg) × Warp Rate (₹/kg)`
- **Weft Cost**: Automatically calculated as `Weft Weight (kg) × Weft Rate (₹/kg)`
- **Total Yarn Cost**: Sum of warp and weft costs per 100 meters
- **Extra Costs**: Add custom cost heads (Processing, Dyeing, etc.)
- **Cost per Meter**: Yarn costs divided by 100

**Input Fields:**
- Warp Rate (₹/kg) - editable per quality
- Weft Rate (₹/kg) - editable per quality
- Extra cost entries with custom labels and amounts

### 2. Overhead Cost Allocation (Section 2)
Distribute monthly overhead expenses across all qualities based on production volume.

**Sub-sections:**

#### A. Monthly Overhead Inputs
- Add multiple overhead line items (Electricity, Rent, Maintenance, etc.)
- Each entry has: Name (text) and Amount (₹)
- Month/Year selector for historical tracking
- Auto-calculated Total Overhead

#### B. Production Input
- Enter meters produced per quality for the selected month
- Auto-calculated Total Production (meters)

#### C. Overhead Allocation Table
Displays automatic distribution:
- **Quality Name**: Fabric quality identifier
- **Meters Produced**: Production volume from input
- **Share (%)**: `(Quality Meters ÷ Total Meters) × 100`
- **Allocated Overhead (₹)**: `Share% × Total Overhead`
- **Overhead/Meter (₹)**: `Allocated Overhead ÷ Quality Meters`

### 3. Grand Total Cost Summary (Section 3)
Final comprehensive cost breakdown per quality showing:
- Warp Yarn Cost/meter
- Weft Yarn Cost/meter
- Extra Costs/meter
- Overhead Cost/meter
- **✅ Grand Total Cost/meter** (highlighted)

## Formulas

### Yarn Costing
```
Warp Cost (100m) = Warp Weight (kg) × Warp Rate (₹/kg)
Weft Cost (100m) = Weft Weight (kg) × Weft Rate (₹/kg)
Total Yarn Cost = Warp Cost + Weft Cost
Cost per Meter = Total Yarn Cost / 100
```

### Overhead Allocation
```
Share (%) = (Quality Meters ÷ Total Meters) × 100
Allocated Overhead = (Share% / 100) × Total Overhead
Overhead per Meter = Allocated Overhead ÷ Quality Meters
```

### Grand Total
```
Grand Total/Meter = Warp/m + Weft/m + Extra/m + Overhead/m
```

## Data Persistence

### Tables Created
1. **quality_costing**: Stores warp/weft rates and extra costs per quality
2. **overhead_entries**: Stores overhead line items per month
3. **monthly_production**: Stores production volumes per quality per month

### Storage Format
- Overhead entries: Keyed by month (YYYY-MM format)
- Production data: Keyed by month and quality ID
- Historical data preserved for all past months

## Navigation
Access via: **Sidebar > Production > Costing**

## UI Components

### Main Components
- **QualityCostingTable**: Yarn costing with rates and extra costs
- **OverheadCostAllocation**: Three-part overhead management
- **GrandTotalSummary**: Final cost breakdown table

### Design Features
- Clean card/table layout matching existing design system
- Color-coded sections (Emerald for yarn, Orange for overhead, Purple for allocation)
- Real-time calculations on all inputs
- Month selector for historical data browsing
- Responsive tables with proper formatting

## Usage Workflow

1. **Set Yarn Rates**
   - Navigate to Costing page
   - Enter warp and weft purchase rates for each quality
   - (Optional) Add extra costs like processing or dyeing

2. **Enter Monthly Overhead**
   - Select current month (or browse historical months)
   - Add overhead entries (electricity, rent, maintenance, etc.)
   - View auto-calculated total overhead

3. **Input Production Data**
   - Enter meters produced for each quality in the selected month
   - View auto-calculated total production

4. **Review Cost Analysis**
   - Check overhead allocation percentages
   - Review overhead cost per meter for each quality
   - View grand total cost per meter in the summary table

5. **Use for Pricing**
   - Use grand total cost/meter as baseline for pricing decisions
   - Add desired profit margin
   - Compare with market rates

## Technical Implementation

### Database Schema
- Migration files: `0007_add_quality_costing.sql`, `0008_add_overhead_costing.sql`
- Schema definitions in `src/lib/db/schema.ts`
- Type definitions in `src/types/costing.ts` and `src/types/overhead.ts`

### Storage Methods
- `getAll<T>(table)`: Retrieve all records from a table
- `upsert<T>(table, item)`: Insert or update record
- `deleteRecord(table, id)`: Delete record by ID

### Data Flow
1. QualityCostingTable calculates yarn costs and passes data to parent
2. OverheadCostAllocation receives yarn data and calculates overhead allocations
3. GrandTotalSummary combines both datasets for final summary
4. All components use React state management for real-time updates

## Benefits

### For Cost Management
- Complete visibility into all production costs
- Accurate overhead distribution based on actual production
- Historical tracking for trend analysis
- Transparent cost breakdown for decision-making

### For Pricing Strategy
- Know exact cost per meter for each quality
- Set competitive prices with known profit margins
- Identify high-cost qualities for optimization
- Compare costs across different time periods

### For Business Analysis
- Track overhead efficiency over time
- Identify cost-saving opportunities
- Analyze production volume impact on unit costs
- Make data-driven operational decisions

## Example Scenario

**Month: March 2026**

**Overhead Entries:**
- Electricity Bill: ₹50,000
- Factory Rent: ₹1,00,000
- Maintenance: ₹30,000
- **Total Overhead: ₹1,80,000**

**Production Data:**
- Quality ASW: 30,000 meters (60%)
- Quality Wetless: 20,000 meters (40%)
- **Total Production: 50,000 meters**

**Overhead Allocation:**
- ASW: ₹1,08,000 (60%) → ₹3.60/meter
- Wetless: ₹72,000 (40%) → ₹3.60/meter

**Grand Total (Example for ASW):**
- Warp Yarn: ₹2.50/meter
- Weft Yarn: ₹3.20/meter
- Extra Costs: ₹1.00/meter
- Overhead: ₹3.60/meter
- **Grand Total: ₹10.30/meter**

This gives you the complete production cost, allowing you to set selling prices with confidence.
