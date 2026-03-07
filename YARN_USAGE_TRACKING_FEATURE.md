# Yarn Usage Tracking Feature

## Overview
This feature tracks the amount of yarn (in kg) used in beam production by quality. It integrates with the Textile Calculations page where the warp weight per taka is already calculated.

## How It Works

### 1. Warp Weight from Textile Calculations
The Textile Calculations page shows "Warp Wt (kg)" which represents the weight for 1 taka:
- **Formula**: `Warp Weight = (Denier × 100 × Tars) / 9,000,000`
- This value is already per taka (for 100 meters of fabric)

### 2. Sync to Quality
- Go to **Textile Calculations** page
- View the "Automatic Quality Calculations" table
- See the "Warp Wt (kg)" column (weight for 1 taka)
- Click **"Sync"** button to save this value to the quality
- This automatically updates the quality's warp weight field

### 3. Beam Production Tracking
- When adding a beam, specify the number of takas (e.g., 23 takas)
- The system automatically calculates yarn usage:
  - **Formula**: `yarnUsedKg = warpWeight × noOfTakas`
  - **Example**: If warp weight = 3.361 kg and you have 23 takas
  - **Result**: 3.361 × 23 = 77.303 kg of yarn used
- This value is stored with each beam record

### 4. Dashboard Display
- The dashboard shows: **"Yarn Usage by Quality (This Month)"**
- Displays quality-wise breakdown:
  - Quality name
  - Total kg of yarn used
  - Number of beams produced
  - Average kg per beam
- Shows total yarn consumption for the current month

## Database Changes

### New Fields
1. **qualities table**: Added `warp_weight` column (REAL, nullable)
2. **beams table**: Added `yarn_used_kg` column (REAL, nullable)

### Migrations
- `0005_add_warp_weight_to_qualities.sql` - Adds warp_weight to qualities
- `0006_add_yarn_used_kg_to_beams.sql` - Adds yarn_used_kg to beams

## Usage Instructions

### Step 1: Automatic Calculation (Recommended)
1. Go to **Textile Calculations** page
2. Scroll to "Automatic Quality Calculations" table
3. View the "Warp Wt (kg)" for each quality (this is weight for 1 taka)
4. Click **"Sync"** button next to the quality you want to update
5. The warp weight is automatically saved to the quality
   - ✅ No manual calculation needed!

### Step 1 Alternative: Manual Entry
1. Go to **Qualities** page
2. Edit a quality
3. Enter the "Warp Weight (kg/taka)" value manually
4. Save the quality

### Step 2: Add Beams with Number of Takas
1. Go to **Beams** page
2. Add a new beam
3. Select the quality
4. Enter the number of takas
5. The system automatically calculates and stores the yarn usage

### Step 3: View Yarn Usage
1. Go to **Dashboard**
2. Scroll to the "Yarn Usage by Quality (This Month)" section
3. View quality-wise yarn consumption
4. See total yarn used for the month

## Benefits
- Track material consumption by quality
- Monitor yarn usage trends
- Better inventory planning
- Cost analysis by quality
- Production efficiency insights

## Technical Details

### Calculation Logic
```typescript
// When adding a beam:
const selectedQuality = qualities.find(q => q.id === formData.qualityId);
const yarnUsedKg = selectedQuality?.warpWeight 
  ? selectedQuality.warpWeight * formData.noOfTakas 
  : undefined;
```

### Dashboard Aggregation
```typescript
// Group beams by quality and sum yarn usage
const yarnUsageByQuality = calculateYarnUsageByQuality(
  beams, 
  qualities, 
  startOfMonth
);
```

## Notes
- Warp weight is optional - if not set, yarn usage won't be calculated
- Existing beams without yarn usage data will not show in the dashboard
- Only beams from the current month are included in dashboard metrics
- The feature is backward compatible - existing data remains unaffected
