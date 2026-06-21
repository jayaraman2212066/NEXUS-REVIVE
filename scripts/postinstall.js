#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Running post-install setup...');

// Detect environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const ROOT = isVercel ? '/tmp' : process.cwd();

const dirs = isVercel ? [
  '/tmp/storage',
  '/tmp/storage/tmp',
  '/tmp/storage/output',
  '/tmp/storage/ai-models',
] : [
  './storage',
  './storage/tmp',
  './storage/output',
  './storage/ai-models',
];

console.log(`📍 Environment: ${isVercel ? 'Vercel (production)' : 'Local development'}`);
console.log(`📁 Root path: ${ROOT}`);

dirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created ${dir}`);
    } else {
      console.log(`✓ ${dir} already exists`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not create ${dir}: ${error.message}`);
  }
});

console.log('✅ Post-install complete\n');
