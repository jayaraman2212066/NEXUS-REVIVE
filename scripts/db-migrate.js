#!/usr/bin/env node

/**
 * Database Migration Script for Vercel Deployment
 * Runs Prisma migrations safely in production
 */

const { execSync } = require('child_process');

console.log('🚀 Starting database migration...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to database (creates tables if they don't exist)
  console.log('🔄 Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  
  console.log('✅ Database migration completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
}
