# Quick Start: Yarn Usage Tracking

## 3-Step Setup

### Step 1: Sync Warp Weight from Calculations (Automatic - Recommended)
1. Go to **Textile Calculations** page
2. Scroll to "Automatic Quality Calculations" table
3. Click **"Sync"** button for each quality
   - ✅ Warp weight calculated and saved automatically!

**OR** Manual Entry:
1. Go to **Qualities** page
2. Click **Edit** on a quality
3. Enter "Warp Weight (kg/taka)" manually
4. Click **Update Quality**

### Step 2: Add Beams (Normal workflow)
1. Go to **Beams** page
2. Click **Add Beam**
3. Select quality (with warp weight configured)
4. Enter number of takas
5. Click **Add Beam**
   - ✅ Yarn usage calculated automatically!

### Step 3: View Dashboard
1. Go to **Dashboard**
2. Scroll to "Yarn Usage by Quality (This Month)"
3. See your yarn consumption!

## That's It! 🎉

The system now tracks yarn usage automatically for all new beams.

## Quick Reference

| Field | Location | Purpose |
|-------|----------|---------|
| Warp Weight | Qualities page | Weight in kg for 1 taka |
| Yarn Used | Automatic | Calculated when adding beam |
| Dashboard | Home page | Shows monthly usage by quality |

## Example Values

| Quality Type | Warp Wt (kg) | Takas per Beam | Yarn Used |
|--------------|--------------|----------------|-----------|
| asw (100/56, 55D) | 3.361 kg | 23 | 77.3 kg |
| Wetless (100/34, 50D) | 3.056 kg | 23 | 70.3 kg |

*Note: Warp Wt is for 1 taka. Multiply by number of takas in your beam.*

## Need Help?

- See `YARN_USAGE_TRACKING_FEATURE.md` for detailed documentation
- See `YARN_USAGE_EXAMPLE.md` for real-world examples
- See `MIGRATION_INSTRUCTIONS.md` for database setup
