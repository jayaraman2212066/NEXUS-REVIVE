#!/usr/bin/env node

/**
 * Vercel Build Script
 * Handles build process with proper error handling
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Starting Vercel build process...');

try {
  // 1. Verify environment variables
  console.log('🔍 Checking environment variables...');
  const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Warning: Missing env vars:', missing.join(', '));
  } else {
    console.log('✅ All required environment variables present');
  }

  // 2. Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 3. Push database schema (Vercel deployment)
  if (process.env.VERCEL === '1') {
    console.log('🔄 Pushing database schema to PostgreSQL...');
    try {
      execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ Database schema pushed');
    } catch (dbError) {
      console.warn('⚠️  Database push failed - continuing with build:', dbError.message);
    }
  }

  // 4. Build Next.js
  console.log('🚀 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
