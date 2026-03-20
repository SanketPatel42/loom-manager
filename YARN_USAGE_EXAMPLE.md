# Yarn Usage Tracking - Example Walkthrough

## Scenario: Tracking Yarn Usage for Different Qualities

### Step 1: Sync Warp Weight from Textile Calculations

Go to Textile Calculations page and you see:

**Quality: asw**
- EPI: 100, PPI: 56, Denier: 55D
- Warp Wt (kg): 3.361 kg (for 1 taka)
- Click "Sync" → Saved to quality

**Quality: Wetless**
- EPI: 100, PPI: 34, Denier: 50D
- Warp Wt (kg): 3.056 kg (for 1 taka)
- Click "Sync" → Saved to quality

### Step 2: Add Beams

Now when you add beams:

**Beam 1:**
- Date: 2026-03-06
- Warper: John
- Beam No: B001
- Quality: asw (warp weight: 3.361 kg/taka)
- No. of Takas: 23
- **Automatic Calculation**: Yarn Used = 3.361 kg × 23 takas = **77.303 kg**

**Beam 2:**
- Date: 2026-03-07
- Warper: John
- Beam No: B002
- Quality: asw
- No. of Takas: 23
- **Automatic Calculation**: Yarn Used = 3.361 kg × 23 takas = **77.303 kg**

**Beam 3:**
- Date: 2026-03-08
- Warper: Sarah
- Beam No: B003
- Quality: Wetless (warp weight: 3.056 kg/taka)
- No. of Takas: 23
- **Automatic Calculation**: Yarn Used = 3.056 kg × 23 takas = **70.288 kg**

### Step 3: View Dashboard

The dashboard will show:

```
┌─────────────────────────────────────────────────────────┐
│  Yarn Usage by Quality (This Month)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ asw              │  │ Wetless          │           │
│  │ 2 beams          │  │ 1 beam           │           │
│  │                  │  │                  │           │
│  │ 154.61 kg        │  │ 70.29 kg         │           │
│  │ Avg: 77.3 kg/beam│  │ Avg: 70.3 kg/beam│           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  Total Yarn Used This Month: 224.90 kg                 │
└─────────────────────────────────────────────────────────┘
```

## Real-World Example

### Textile Factory Scenario

**Factory**: Grey Loom Textiles
**Month**: March 2026

#### Qualities Configured:
1. **Premium Silk 150D**
   - Warp Weight: 3.2 kg/taka
   - Used for high-end sarees

2. **Standard Cotton 100D**
   - Warp Weight: 2.1 kg/taka
   - Used for regular fabric

3. **Economy Polyester 75D**
   - Warp Weight: 1.5 kg/taka
   - Used for budget products

#### Production This Month:

**Week 1:**
- 5 beams of Premium Silk (avg 8 takas each) = 5 × 8 × 3.2 = **128 kg**
- 10 beams of Standard Cotton (avg 12 takas each) = 10 × 12 × 2.1 = **252 kg**
- 8 beams of Economy Polyester (avg 15 takas each) = 8 × 15 × 1.5 = **180 kg**

**Week 2:**
- 3 beams of Premium Silk (avg 10 takas each) = 3 × 10 × 3.2 = **96 kg**
- 12 beams of Standard Cotton (avg 11 takas each) = 12 × 11 × 2.1 = **277.2 kg**
- 10 beams of Economy Polyester (avg 14 takas each) = 10 × 14 × 1.5 = **210 kg**

#### Dashboard Shows:

```
Premium Silk 150D:     224 kg    (8 beams)   Avg: 28.0 kg/beam
Standard Cotton 100D:  529.2 kg  (22 beams)  Avg: 24.1 kg/beam
Economy Polyester 75D: 390 kg    (18 beams)  Avg: 21.7 kg/beam

Total Yarn Used: 1,143.2 kg
```

## Benefits in Action

### 1. Inventory Planning
"We used 1,143 kg this month. At this rate, we need to order 1,200 kg for next month."

### 2. Cost Analysis
"Premium Silk uses 28 kg/beam on average. At ₹500/kg, that's ₹14,000 in yarn cost per beam."

### 3. Quality Comparison
"Economy Polyester is most efficient at 21.7 kg/beam, while Premium Silk uses 28 kg/beam."

### 4. Production Insights
"Standard Cotton is our highest volume - 529 kg used across 22 beams this month."

### 5. Trend Analysis
"Week 2 used more yarn than Week 1. We're ramping up production as expected."

## Formula Reference

```
Warp Weight per Taka = (Denier × 100 × Tars) / 9,000,000 kg

Yarn Used in Beam = Warp Weight per Taka × Number of Takas

Example:
- Warp Weight: 3.361 kg/taka (from textile calculations)
- Number of Takas: 23
- Yarn Used: 3.361 × 23 = 77.303 kg
```

## Tips for Accurate Tracking

1. **Measure Warp Weight Accurately**: Weigh actual samples to get precise kg/taka values
2. **Update Regularly**: If yarn specifications change, update the warp weight
3. **Quality-Specific**: Different qualities have different warp weights - configure each one
4. **Historical Data**: Old beams won't show usage, but new ones will track automatically
5. **Monthly Review**: Check dashboard monthly to understand consumption patterns

## Common Questions

**Q: What if I don't know the warp weight?**
A: Leave it blank. The feature is optional. You can add it later when you have the data.

**Q: Can I change warp weight later?**
A: Yes, but it only affects new beams. Existing beams keep their calculated values.

**Q: What if I enter wrong number of takas?**
A: Edit the beam record. The yarn usage will be recalculated based on the new taka count.

**Q: Does this track weft yarn too?**
A: Currently only warp yarn. Weft tracking could be added as a future enhancement.

**Q: Can I see usage for previous months?**
A: Currently shows current month. Historical reporting could be added later.
