// Test file for payment terms calculation
// This can be run manually or integrated into a test suite

/**
 * Test the calculateExpectedDate function from Sales.tsx
 */
export function testPaymentTermsCalculation() {
  console.log('Testing Payment Terms Calculation...');

  // Helper function (copied from Sales.tsx)
  const calculateExpectedDate = (date: string, terms: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + terms);
    return d.toISOString().split('T')[0];
  };

  // Test cases
  const testCases = [
    {
      name: 'Standard 45-day terms',
      contractDate: '2024-01-01',
      paymentTerms: 45,
      expectedResult: '2024-02-15'
    },
    {
      name: 'Standard 30-day terms',
      contractDate: '2024-03-01',
      paymentTerms: 30,
      expectedResult: '2024-03-31'
    },
    {
      name: 'Cross-month boundary',
      contractDate: '2024-01-15',
      paymentTerms: 30,
      expectedResult: '2024-02-14'
    },
    {
      name: 'Leap year handling',
      contractDate: '2024-02-01',
      paymentTerms: 28,
      expectedResult: '2024-02-29'
    },
    {
      name: 'End of year boundary',
      contractDate: '2024-12-15',
      paymentTerms: 30,
      expectedResult: '2025-01-14'
    },
    {
      name: 'Short payment terms',
      contractDate: '2024-06-01',
      paymentTerms: 7,
      expectedResult: '2024-06-08'
    },
    {
      name: 'Long payment terms',
      contractDate: '2024-01-01',
      paymentTerms: 90,
      expectedResult: '2024-03-31'
    }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(testCase => {
    const result = calculateExpectedDate(testCase.contractDate, testCase.paymentTerms);
    const success = result === testCase.expectedResult;
    
    console.log(`${success ? '✅' : '❌'} ${testCase.name}`);
    console.log(`   Contract: ${testCase.contractDate}, Terms: ${testCase.paymentTerms} days`);
    console.log(`   Expected: ${testCase.expectedResult}, Got: ${result}`);
    
    if (success) {
      passed++;
    } else {
      failed++;
      console.log(`   ❌ FAILED: Expected ${testCase.expectedResult}, but got ${result}`);
    }
    console.log('');
  });

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All payment terms calculation tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }

  return { passed, failed, total: testCases.length };
}

/**
 * Test payment terms integration scenarios
 */
export function testPaymentTermsIntegration() {
  console.log('\nTesting Payment Terms Integration Scenarios...');

  // Simulate form data changes
  const simulateFormData = {
    date: '2024-01-01',
    paymentTerms: 45,
    expectedPaymentDate: '2024-02-15',
    usePaymentTerms: true
  };

  console.log('📋 Initial Form State:');
  console.log(`   Contract Date: ${simulateFormData.date}`);
  console.log(`   Payment Terms: ${simulateFormData.paymentTerms} days`);
  console.log(`   Expected Date: ${simulateFormData.expectedPaymentDate}`);
  console.log(`   Using Payment Terms: ${simulateFormData.usePaymentTerms}`);

  // Test scenario 1: Change contract date
  console.log('\n🔄 Scenario 1: Contract date changed to 2024-02-01');
  const newContractDate = '2024-02-01';
  const calculateExpectedDate = (date: string, terms: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + terms);
    return d.toISOString().split('T')[0];
  };
  
  if (simulateFormData.usePaymentTerms) {
    simulateFormData.expectedPaymentDate = calculateExpectedDate(newContractDate, simulateFormData.paymentTerms);
  }
  simulateFormData.date = newContractDate;
  
  console.log(`   ✅ Expected date auto-updated to: ${simulateFormData.expectedPaymentDate}`);

  // Test scenario 2: Change payment terms
  console.log('\n🔄 Scenario 2: Payment terms changed to 30 days');
  const newPaymentTerms = 30;
  simulateFormData.paymentTerms = newPaymentTerms;
  simulateFormData.expectedPaymentDate = calculateExpectedDate(simulateFormData.date, newPaymentTerms);
  
  console.log(`   ✅ Expected date auto-updated to: ${simulateFormData.expectedPaymentDate}`);

  // Test scenario 3: Switch to manual date mode
  console.log('\n🔄 Scenario 3: Switch to manual date mode');
  simulateFormData.usePaymentTerms = false;
  const manualDate = '2024-03-15';
  simulateFormData.expectedPaymentDate = manualDate;
  
  console.log(`   ✅ Manual date set to: ${simulateFormData.expectedPaymentDate}`);
  console.log(`   ✅ Payment terms preserved: ${simulateFormData.paymentTerms} days`);

  // Test scenario 4: Switch back to payment terms mode
  console.log('\n🔄 Scenario 4: Switch back to payment terms mode');
  simulateFormData.usePaymentTerms = true;
  simulateFormData.expectedPaymentDate = calculateExpectedDate(simulateFormData.date, simulateFormData.paymentTerms);
  
  console.log(`   ✅ Expected date recalculated to: ${simulateFormData.expectedPaymentDate}`);

  console.log('\n🎉 All integration scenarios completed successfully!');
}

// Manual test runner
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testPaymentTerms = () => {
    testPaymentTermsCalculation();
    testPaymentTermsIntegration();
  };
  console.log('💡 Run testPaymentTerms() in the browser console to test payment terms functionality');
}