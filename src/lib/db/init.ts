import { testConnection } from './config';
import { runMigrations } from './migrate';

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    // Run migrations
    await runMigrations();
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}