# Complete Yarn Usage Tracking Workflow

## Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Textile Calculations Page                         │
│  (Automatic - No Manual Entry Needed)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Automatic Quality Calculations Table                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Quality  │ E/P/D    │ Warp(100m) │ Warp/Taka │ Sync │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ Premium  │ 100/34   │ 3.361 kg   │ 0.403 kg  │ [✓]  │ │
│  │ Standard │ 100/34   │ 3.056 kg   │ 0.367 kg  │ [✓]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  💡 Click "Sync" to save warp weight to quality            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [User clicks Sync]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Quality Record Updated                                     │
│  ✅ Premium: warpWeight = 0.403 kg/taka                    │
│  ✅ Standard: warpWeight = 0.367 kg/taka                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Add Beams (Normal Workflow)                       │
│  Beams Page                                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Add Beam Form                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Date: 2026-03-06                                      │ │
│  │ Warper: John                                          │ │
│  │ Beam No: B001                                         │ │
│  │ Quality: Premium ◄── (warpWeight: 0.403 kg/taka)     │ │
│  │ No. of Takas: 10                                      │ │
│  │                                                       │ │
│  │ [Add Beam] ◄── Click to save                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  [Automatic Calculation]
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Beam Record Saved                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Beam B001                                             │ │
│  │ Quality: Premium                                      │ │
│  │ Takas: 10                                             │ │
│  │ Yarn Used: 0.403 × 10 = 4.03 kg ◄── Auto calculated  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: View Dashboard                                     │
│  Dashboard Page                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Yarn Usage by Quality (This Month)                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ┌──────────────────┐  ┌──────────────────┐          │ │
│  │  │ Premium          │  │ Standard         │          │ │
│  │  │ 5 beams          │  │ 8 beams          │          │ │
│  │  │                  │  │                  │          │ │
│  │  │ 20.15 kg         │  │ 29.36 kg         │          │ │
│  │  │ Avg: 4.03 kg/beam│  │ Avg: 3.67 kg/beam│          │ │
│  │  └──────────────────┘  └──────────────────┘          │ │
│  │                                                       │ │
│  │  Total Yarn Used This Month: 49.51 kg                │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Real-World Example

### Scenario: New Quality Setup

#### Starting Point
You have a new quality "Premium Silk 150D" with:
- EPI: 100
- PPI: 34
- Denier: 150
- Tars: 2800

#### Step-by-Step Process

**1. Go to Textile Calculations Page**
```
Navigate: Menu → Textile Calculations
Scroll to: "Automatic Quality Calculations" table
```

**2. View Calculated Values**
```
Quality: Premium Silk 150D
Warp Weight (100m): 4.200 kg
Warp/Taka: 0.504 kg  ◄── This is what you need!
```

**3. Click Sync Button**
```
Click: [Sync] button next to Premium Silk 150D
Result: ✅ "Warp weight synced: 0.504 kg/taka"
```

**4. Add Beams**
```
Go to: Beams page
Add Beam:
  - Quality: Premium Silk 150D
  - Takas: 12
  
Automatic Calculation:
  Yarn Used = 0.504 × 12 = 6.048 kg
```

**5. Check Dashboard**
```
Go to: Dashboard
View: "Yarn Usage by Quality (This Month)"

Premium Silk 150D:
  - 1 beam
  - 6.048 kg used
  - Avg: 6.048 kg/beam
```

## Key Points

### ✅ Advantages
1. **No Manual Calculation**: System does all the math
2. **One-Click Sync**: Just click the button
3. **Automatic Tracking**: Yarn usage calculated on every beam
4. **Real-Time Dashboard**: See consumption instantly
5. **Quality-Wise Breakdown**: Track each quality separately

### 📊 What You Get
- Accurate yarn consumption tracking
- Quality-wise usage reports
- Monthly totals
- Average usage per beam
- Historical data for analysis

### 🎯 Use Cases
1. **Inventory Planning**: Know how much yarn to order
2. **Cost Analysis**: Calculate material costs per quality
3. **Production Efficiency**: Compare yarn usage across qualities
4. **Budget Forecasting**: Predict monthly yarn expenses
5. **Quality Optimization**: Identify most efficient qualities

## Quick Reference

| Action | Location | Result |
|--------|----------|--------|
| View calculations | Textile Calculations page | See warp weight per taka |
| Sync warp weight | Click "Sync" button | Save to quality |
| Add beam | Beams page | Auto-calculate yarn usage |
| View usage | Dashboard | See monthly consumption |

## Tips

1. **Sync Once**: You only need to sync when quality specs change
2. **Check Calculations**: Review the calculated values before syncing
3. **Update Specs**: If you change EPI/PPI/Denier, re-sync the warp weight
4. **Monthly Review**: Check dashboard monthly for trends
5. **Quality Comparison**: Use the data to optimize quality selection

## Troubleshooting

**Q: Warp/Taka shows "-"**
A: Quality is missing EPI, PPI, Denier, or Tars. Add these values first.

**Q: Sync button doesn't appear**
A: Calculation couldn't be performed. Check quality specifications.

**Q: Dashboard shows no data**
A: No beams added this month, or warp weight not synced before adding beams.

**Q: Yarn usage seems wrong**
A: Verify the warp weight is correct. Re-sync from calculations if needed.

**Q: Can I change the taka length?**
A: Currently assumes 12 meters per taka. This is standard but can be customized in code if needed.
