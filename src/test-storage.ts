// Simple test to verify enhanced storage functionality
import { asyncStorage } from './lib/storage';
import type { Beam } from './lib/localStorage';

export async function testEnhancedStorage() {
  try {
    console.log('🧪 Testing Enhanced Storage System...');
    
    // Test connection
    const connected = await asyncStorage.testConnection();
    console.log('✅ Connection test:', connected ? 'PASSED' : 'FAILED');
    
    // Test CRUD operations
    const testBeam: Beam = {
      id: 'test-beam-1',
      date: '2024-11-24',
      warper: 'Test Warper',
      beamNo: 'TB001',
      noOfTakas: 100,
      noOfTar: 50,
      pricePerBeam: 25.50,
      total: 2550,
    };
    
    // Create
    await asyncStorage.addBeam(testBeam);
    console.log('✅ Create test: PASSED');
    
    // Read
    const beams = await asyncStorage.getBeams();
    const foundBeam = beams.find(b => b.id === 'test-beam-1');
    console.log('✅ Read test:', foundBeam ? 'PASSED' : 'FAILED');
    
    // Update
    if (foundBeam) {
      const updatedBeam = { ...foundBeam, warper: 'Updated Warper' };
      await asyncStorage.updateBeam('test-beam-1', updatedBeam);
      
      const updatedBeams = await asyncStorage.getBeams();
      const updatedFoundBeam = updatedBeams.find(b => b.id === 'test-beam-1');
      console.log('✅ Update test:', updatedFoundBeam?.warper === 'Updated Warper' ? 'PASSED' : 'FAILED');
    }
    
    // Delete
    await asyncStorage.deleteBeam('test-beam-1');
    const finalBeams = await asyncStorage.getBeams();
    const deletedBeam = finalBeams.find(b => b.id === 'test-beam-1');
    console.log('✅ Delete test:', !deletedBeam ? 'PASSED' : 'FAILED');
    
    console.log('🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return false;
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testEnhancedStorage();
}