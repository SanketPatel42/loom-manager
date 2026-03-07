# Yarn Usage Integration with Textile Calculations - Update

## What Changed

### Integration with Existing Calculations
The yarn usage tracking feature now integrates seamlessly with the existing Textile Calculations page, eliminating the need for manual warp weight entry.

## New Features

### 1. Automatic Warp Weight Calculation
**Location**: Textile Calculations page → "Automatic Quality Calculations" table

**New Column Added**: "Warp/Taka (kg)"
- Automatically calculates warp weight per taka for each quality
- Formula: `(Warp Weight per 100m / 100) × 12`
- Assumes 1 taka = 12 meters (standard textile measurement)

### 2. One-Click Sync Button
**Feature**: "Sync" button in the calculations table
- Click to automatically save the calculated warp weight to the quality
- Updates the quality's `warpWeight` field
- Shows success toast notification
- No manual data entry needed

### 3. Visual Enhancements
- New purple-highlighted column for Warp/Taka values
- Sync button with refresh icon
- Updated help text explaining the feature
- Clear visual distinction from other weight columns

## How It Works

### Calculation Flow
```
Quality Specifications (EPI, PPI, Denier, Tars)
    ↓
Textile Calculations Page
    ↓
Automatic Calculation: Warp Weight per 100m
    ↓
Convert to per Taka: (Weight/100) × 12
    ↓
Display in "Warp/Taka (kg)" column
    ↓
User clicks "Sync" button
    ↓
Save to Quality.warpWeight field
    ↓
Used automatically in Beam production
```

### User Workflow
1. **View Calculations**: Go to Textile Calculations page
2. **See Warp/Taka**: Check the calculated values in the table
3. **Sync**: Click "Sync" button for each quality
4. **Done**: Warp weight is now saved and ready to use
5. **Add Beams**: Yarn usage calculates automatically

## Files Modified

### Updated Files
1. `src/components/calculations/CalculatedQualitiesTable.tsx`
   - Added `warpWeightPerTaka` calculation
   - Added "Warp/Taka (kg)" column
   - Added "Action" column with Sync button
   - Added `handleSyncWarpWeight` function
   - Updated help text and formulas

2. `YARN_USAGE_TRACKING_FEATURE.md`
   - Updated with automatic calculation instructions
   - Added sync button documentation

3. `QUICK_START_YARN_TRACKING.md`
   - Updated Step 1 with automatic sync option
   - Made manual entry the alternative method

## Benefits

### For Users
- ✅ No manual calculation needed
- ✅ No manual data entry required
- ✅ One-click sync from calculations
- ✅ Automatic accuracy (no human error)
- ✅ Consistent with existing textile formulas

### Technical
- ✅ Leverages existing calculation logic
- ✅ Single source of truth for formulas
- ✅ Seamless integration with existing UI
- ✅ No breaking changes to existing features

## Formula Reference

### Warp Weight per 100 meters
```
(Denier × 100 × Tars) / 9,000,000 = kg per 100m
```

### Warp Weight per Taka
```
(Warp Weight per 100m / 100) × 12 = kg per taka
```

### Yarn Used in Beam
```
Warp Weight per Taka × Number of Takas = Total kg used
```

## Example

### Quality: Premium 150D
- Denier: 150
- Tars: 2800
- EPI: 50
- PPI: 34

### Calculations
1. **Warp Weight (100m)**: (150 × 100 × 2800) / 9,000,000 = 4.667 kg
2. **Warp Weight (per taka)**: (4.667 / 100) × 12 = 0.560 kg
3. **Click Sync**: Saves 0.560 kg to quality

### Beam Production
- Add beam with 10 takas
- Yarn used: 0.560 × 10 = 5.6 kg
- Automatically calculated and stored

## Testing Checklist

- [x] Warp/Taka column displays correctly
- [x] Calculation formula is accurate
- [x] Sync button appears for valid calculations
- [x] Sync button updates quality correctly
- [x] Toast notification shows on sync
- [x] Updated warp weight used in beam production
- [x] Dashboard shows yarn usage correctly
- [x] No TypeScript errors
- [x] Integration with existing features works

## Status: ✅ COMPLETE

The integration is complete and ready for use. Users can now leverage the existing textile calculations to automatically populate warp weights for yarn usage tracking.
