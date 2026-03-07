import type { Sale } from '@/lib/types';

/**
 * Calculate days passed since expected payment date
 * @param expectedPaymentDate - The expected payment date in YYYY-MM-DD format
 * @returns Number of days passed (positive if overdue, negative if not yet due)
 */
export function calculateDaysPassed(expectedPaymentDate: string): number {
  const today = new Date();
  const expectedDate = new Date(expectedPaymentDate);
  return Math.floor((today.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Filter sales for urgent payment collection (beyond 45 days overdue)
 * @param sales - Array of sales records
 * @returns Array of sales with payment days beyond 45, sorted by most overdue first
 */
export function getUrgentPaymentCollection(sales: Sale[]) {
  const today = new Date();
  
  return sales
    .filter(s => s.status === 'pending')
    .map(s => {
      const daysPassed = calculateDaysPassed(s.expectedPaymentDate);
      return { ...s, daysPassed };
    })
    .filter(s => s.daysPassed > 45)
    .sort((a, b) => b.daysPassed - a.daysPassed); // Sort by most overdue first
}

/**
 * Get priority level based on days overdue
 * @param daysPassed - Number of days passed since expected payment date
 * @returns Priority level string
 */
export function getPaymentPriority(daysPassed: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (daysPassed > 90) return 'CRITICAL';
  if (daysPassed > 60) return 'HIGH';
  if (daysPassed > 45) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculate total outstanding amount for urgent payments
 * @param urgentPayments - Array of urgent payment sales
 * @returns Total outstanding amount
 */
export function calculateTotalOutstanding(urgentPayments: (Sale & { daysPassed: number })[]): number {
  return urgentPayments.reduce((sum, sale) => sum + sale.total, 0);
}