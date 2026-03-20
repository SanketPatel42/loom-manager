# Urgent Payment Collection Feature

## Overview
This feature adds an urgent payment collection system to the dashboard that highlights parties with payments overdue by more than 45 days in a prominent red alert box.

## Features

### 1. Dashboard Alert Box
- **Red Alert Box**: Prominently displays parties with payments beyond 45 days overdue
- **Animated Elements**: Uses pulse animations and visual indicators to draw attention
- **Comprehensive Details**: Shows party name, amount, quantity, expected date, type, and bill numbers
- **Priority Levels**: Categorizes urgency as CRITICAL (90+ days), HIGH (60-90 days), or MEDIUM (45-60 days)
- **Total Outstanding**: Displays the total amount pending from all urgent collections

### 2. Quick Stats Integration
- **Urgent Counter**: Adds a fifth quick stat card that shows the count of overdue parties
- **Visual Prominence**: Uses red styling with pulse animation when urgent payments exist
- **Responsive Design**: Adapts to different screen sizes (2 columns on mobile, 5 on desktop)

### 3. Smart Filtering & Sorting
- **45-Day Threshold**: Only shows payments overdue by more than 45 days
- **Status Filtering**: Only includes 'pending' payments (excludes paid ones)
- **Priority Sorting**: Orders by most overdue first
- **Real-time Updates**: Automatically refreshes with other dashboard data

## Technical Implementation

### Files Modified
- `src/pages/Index.tsx` - Main dashboard component
- `src/utils/paymentUtils.ts` - Utility functions for payment calculations
- `src/utils/paymentUtils.test.ts` - Test suite for payment utilities

### Key Functions
- `getUrgentPaymentCollection()` - Filters and sorts urgent payments
- `calculateDaysPassed()` - Calculates days since expected payment date
- `getPaymentPriority()` - Determines priority level based on days overdue
- `calculateTotalOutstanding()` - Sums total outstanding amounts

### Data Flow
1. Dashboard loads sales data using `asyncStorage.getSales()`
2. `getUrgentPaymentCollection()` filters for pending payments > 45 days overdue
3. Results are sorted by most overdue first
4. UI renders red alert box with detailed party information
5. Quick stats bar shows urgent payment counter if any exist

## Usage

### For Users
1. **Dashboard View**: Open the main dashboard to see urgent payment alerts
2. **Quick Identification**: Red alert box appears when payments are 45+ days overdue
3. **Priority Action**: Focus on CRITICAL (90+ days) and HIGH (60-90 days) priority items first
4. **Contact Information**: Use party names to follow up on overdue payments

### For Developers
```typescript
import { getUrgentPaymentCollection, getPaymentPriority } from '@/utils/paymentUtils';

// Get urgent payments
const urgentPayments = getUrgentPaymentCollection(salesData);

// Check priority level
const priority = getPaymentPriority(daysPassed);
```

## Styling
- Uses Tailwind CSS with red color scheme for urgency
- Responsive grid layout
- Gradient backgrounds and borders for visual appeal
- Consistent with existing dashboard design patterns
- Dark mode support included

## Testing
Run the test suite to verify payment calculations:
```bash
npm test src/utils/paymentUtils.test.ts
```

## Future Enhancements
- Email/SMS notifications for urgent payments
- Export urgent payment list to PDF/Excel
- Integration with accounting systems
- Automated follow-up reminders
- Payment history tracking
- Customer communication logs

## Configuration
The 45-day threshold can be modified in `src/utils/paymentUtils.ts` by changing the filter condition in `getUrgentPaymentCollection()`.

Priority levels can be adjusted in the `getPaymentPriority()` function:
- CRITICAL: 90+ days (currently)
- HIGH: 60-90 days (currently)  
- MEDIUM: 45-60 days (currently)
- LOW: <45 days (currently)