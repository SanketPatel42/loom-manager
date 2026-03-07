import { calculateDaysPassed, getUrgentPaymentCollection, getPaymentPriority, calculateTotalOutstanding } from './paymentUtils';
import type { Sale } from '@/lib/types';

// Mock sales data for testing
const mockSales: Sale[] = [
  {
    id: '1',
    date: '2024-01-01',
    party: 'Party A',
    takas: 100,
    meters: 1000,
    ratePerMeter: 50,
    amount: 50000,
    tax: 2500,
    total: 52500,
    paymentTerms: 30,
    expectedPaymentDate: '2024-01-31', // 30 days overdue from today (assuming today is March 2024)
    status: 'pending',
    type: 'spot'
  },
  {
    id: '2',
    date: '2024-01-15',
    party: 'Party B',
    takas: 200,
    meters: 2000,
    ratePerMeter: 45,
    amount: 90000,
    tax: 4500,
    total: 94500,
    paymentTerms: 45,
    expectedPaymentDate: '2023-12-01', // 90+ days overdue
    status: 'pending',
    type: 'spot'
  },
  {
    id: '3',
    date: '2024-02-01',
    party: 'Party C',
    takas: 150,
    meters: 1500,
    ratePerMeter: 55,
    amount: 82500,
    tax: 4125,
    total: 86625,
    paymentTerms: 30,
    expectedPaymentDate: '2024-03-10', // Future date, not overdue
    status: 'pending',
    type: 'spot'
  },
  {
    id: '4',
    date: '2024-01-20',
    party: 'Party D',
    takas: 120,
    meters: 1200,
    ratePerMeter: 48,
    amount: 57600,
    tax: 2880,
    total: 60480,
    paymentTerms: 30,
    expectedPaymentDate: '2023-11-15', // 100+ days overdue
    status: 'pending',
    type: 'spot'
  },
  {
    id: '5',
    date: '2024-02-15',
    party: 'Party E',
    takas: 80,
    meters: 800,
    ratePerMeter: 52,
    amount: 41600,
    tax: 2080,
    total: 43680,
    paymentTerms: 30,
    expectedPaymentDate: '2024-03-15',
    status: 'paid', // This should be filtered out
    type: 'spot'
  }
];

describe('Payment Utils', () => {
  describe('calculateDaysPassed', () => {
    it('should calculate positive days for overdue payments', () => {
      const pastDate = '2024-01-01';
      const daysPassed = calculateDaysPassed(pastDate);
      expect(daysPassed).toBeGreaterThan(0);
    });

    it('should calculate negative days for future payments', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      const daysPassed = calculateDaysPassed(futureDateStr);
      expect(daysPassed).toBeLessThan(0);
    });
  });

  describe('getUrgentPaymentCollection', () => {
    it('should filter only pending sales beyond 45 days', () => {
      const urgentPayments = getUrgentPaymentCollection(mockSales);
      
      // Should only include pending sales with more than 45 days overdue
      expect(urgentPayments.length).toBeGreaterThan(0);
      urgentPayments.forEach(payment => {
        expect(payment.status).toBe('pending');
        expect(payment.daysPassed).toBeGreaterThan(45);
      });
    });

    it('should sort by most overdue first', () => {
      const urgentPayments = getUrgentPaymentCollection(mockSales);
      
      if (urgentPayments.length > 1) {
        for (let i = 0; i < urgentPayments.length - 1; i++) {
          expect(urgentPayments[i].daysPassed).toBeGreaterThanOrEqual(urgentPayments[i + 1].daysPassed);
        }
      }
    });

    it('should exclude paid sales', () => {
      const urgentPayments = getUrgentPaymentCollection(mockSales);
      urgentPayments.forEach(payment => {
        expect(payment.status).not.toBe('paid');
      });
    });
  });

  describe('getPaymentPriority', () => {
    it('should return CRITICAL for 90+ days', () => {
      expect(getPaymentPriority(95)).toBe('CRITICAL');
      expect(getPaymentPriority(120)).toBe('CRITICAL');
    });

    it('should return HIGH for 60-90 days', () => {
      expect(getPaymentPriority(65)).toBe('HIGH');
      expect(getPaymentPriority(89)).toBe('HIGH');
    });

    it('should return MEDIUM for 45-60 days', () => {
      expect(getPaymentPriority(50)).toBe('MEDIUM');
      expect(getPaymentPriority(59)).toBe('MEDIUM');
    });

    it('should return LOW for less than 45 days', () => {
      expect(getPaymentPriority(30)).toBe('LOW');
      expect(getPaymentPriority(10)).toBe('LOW');
    });
  });

  describe('calculateTotalOutstanding', () => {
    it('should sum up total amounts correctly', () => {
      const urgentPayments = getUrgentPaymentCollection(mockSales);
      const total = calculateTotalOutstanding(urgentPayments);
      
      const expectedTotal = urgentPayments.reduce((sum, sale) => sum + sale.total, 0);
      expect(total).toBe(expectedTotal);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalOutstanding([])).toBe(0);
    });
  });
});

// Manual test function for development
export function testPaymentUtils() {
  console.log('Testing Payment Utils...');
  
  const urgentPayments = getUrgentPaymentCollection(mockSales);
  console.log('Urgent Payments:', urgentPayments);
  
  const totalOutstanding = calculateTotalOutstanding(urgentPayments);
  console.log('Total Outstanding:', totalOutstanding);
  
  urgentPayments.forEach(payment => {
    console.log(`${payment.party}: ${payment.daysPassed} days overdue, Priority: ${getPaymentPriority(payment.daysPassed)}`);
  });
}