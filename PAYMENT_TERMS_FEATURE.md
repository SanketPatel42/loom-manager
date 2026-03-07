# Payment Terms Auto-Calculation Feature

## Overview
This feature enhances the sales form by adding an intelligent payment terms system that automatically calculates expected payment dates based on the number of days from the contract date.

## Features

### 1. Dual Input Mode
- **Payment Terms Mode**: Enter number of days (e.g., 45 days) and the system automatically calculates the expected payment date
- **Manual Date Mode**: Directly select a specific payment date using the date picker
- **Toggle Button**: Easy switching between the two modes with visual icons

### 2. Auto-Calculation
- **Real-time Updates**: Expected payment date updates automatically when:
  - Contract date changes
  - Payment terms (days) change
  - Mode is switched from manual to payment terms
- **Smart Recalculation**: When editing existing sales, the system detects if the original expected date was calculated from payment terms

### 3. Quick Preset Buttons
- **Common Terms**: Quick-select buttons for standard payment terms:
  - 15 days
  - 30 days
  - 45 days (default)
  - 60 days
  - 90 days
- **Visual Feedback**: Active preset is highlighted
- **One-Click Selection**: Instantly applies the selected payment terms

### 4. Visual Indicators
- **Auto-calculated Date**: Green indicator showing the automatically calculated date
- **Manual Date**: Blue indicator when using manual date selection
- **Icons**: Calendar and Clock icons to distinguish between modes
- **Real-time Preview**: Shows the calculated date as you type

## Technical Implementation

### Key Functions
```typescript
calculateExpectedDate(date: string, terms: number): string
```
- Calculates expected payment date by adding specified days to contract date
- Handles month boundaries and leap years correctly

### Form State Management
```typescript
interface FormData {
  // ... existing fields
  paymentTerms: number;           // Number of days for payment
  expectedPaymentDate: string;    // Calculated or manual date
  usePaymentTerms: boolean;       // Toggle between modes
}
```

### Auto-Calculation Logic
1. **Contract Date Change**: If using payment terms mode, recalculates expected date
2. **Payment Terms Change**: Immediately updates expected payment date
3. **Mode Toggle**: Switches between manual date input and payment terms calculation
4. **Edit Detection**: When editing, detects if original date was auto-calculated

## User Interface

### Payment Terms Mode
```
Payment Target                    [Use Date]
┌─────────────────────────────────────────┐
│ [45] days from contract date           │
│ [15d] [30d] [45d] [60d] [90d]          │
│ ✓ Auto-calculated: March 15, 2024      │
└─────────────────────────────────────────┘
```

### Manual Date Mode
```
Payment Target                    [Use Days]
┌─────────────────────────────────────────┐
│ [2024-03-15] (date picker)             │
│ ⏰ Manual date selected                 │
└─────────────────────────────────────────┘
```

## Usage Examples

### Example 1: Standard 45-Day Terms
1. Select contract date: January 1, 2024
2. Keep default 45 days payment terms
3. Expected payment date automatically set to: February 15, 2024

### Example 2: Custom Payment Terms
1. Enter contract date: March 1, 2024
2. Change payment terms to 30 days
3. Expected payment date automatically updates to: March 31, 2024

### Example 3: Manual Date Override
1. Click "Use Date" button
2. Select specific date: April 15, 2024
3. System switches to manual mode and uses selected date

### Example 4: Quick Preset Selection
1. Click "60d" preset button
2. Payment terms automatically set to 60 days
3. Expected date recalculates based on contract date + 60 days

## Benefits

### For Users
- **Faster Data Entry**: No need to manually calculate payment dates
- **Consistency**: Standardized payment terms across all contracts
- **Flexibility**: Can override with manual dates when needed
- **Error Reduction**: Eliminates calculation mistakes

### For Business
- **Payment Tracking**: Consistent payment terms make tracking easier
- **Cash Flow Planning**: Predictable payment schedules
- **Urgent Payment Detection**: Works seamlessly with the urgent payment collection feature
- **Audit Trail**: Clear record of payment terms vs manual dates

## Integration with Urgent Payment Collection

This feature works perfectly with the urgent payment collection system:
- Payment terms are stored and used for overdue calculations
- Auto-calculated dates ensure consistency in payment tracking
- Manual date overrides are preserved and respected
- The 45-day urgent threshold aligns with common payment terms

## Configuration

### Default Settings
- **Default Payment Terms**: 45 days
- **Available Presets**: 15, 30, 45, 60, 90 days
- **Mode Default**: Payment terms mode (auto-calculation)

### Customization
To modify default payment terms or presets, edit the following in `src/pages/Sales.tsx`:
```typescript
// Default payment terms
paymentTerms: 45,

// Preset buttons
{[15, 30, 45, 60, 90].map(days => (
  // Modify this array to change available presets
))}
```

## Future Enhancements
- **Company-specific Defaults**: Different default terms per party
- **Payment Term Templates**: Save and reuse custom payment term configurations
- **Holiday Awareness**: Skip weekends and holidays in date calculations
- **Multi-currency Support**: Different payment terms for different currencies
- **Payment Reminders**: Automated reminders based on payment terms
- **Analytics**: Reports on payment term effectiveness and collection rates