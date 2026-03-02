#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default database first
};

const targetDatabase = process.env.DB_NAME || 'textile_erp';

async function setupDatabase() {
  console.log('🚀 Setting up PostgreSQL database...');
  
  const pool = new Pool(config);
  
  try {
    // Check if database exists
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [targetDatabase]
    );
    
    if (result.rows.length === 0) {
      // Create database
      console.log(`📦 Creating database: ${targetDatabase}`);
      await pool.query(`CREATE DATABASE "${targetDatabase}"`);
      console.log('✅ Database created successfully');
    } else {
      console.log(`✅ Database ${targetDatabase} already exists`);
    }
    
    await pool.end();
    
    // Now connect to the target database and test
    const targetPool = new Pool({
      ...config,
      database: targetDatabase,
    });
    
    console.log('🔍 Testing database connection...');
    const testResult = await targetPool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log(`⏰ Current time: ${testResult.rows[0].current_time}`);
    
    await targetPool.end();
    
    console.log('\n🎉 Database setup completed!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Run: npm run db:migrate');
    console.log('3. Start your application: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();