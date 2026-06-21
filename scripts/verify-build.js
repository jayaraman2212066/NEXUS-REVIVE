#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load .env file if exists
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    });
  }
} catch (error) {
  // Ignore env loading errors
}

console.log('🔍 Nexus Revive Build Verification\n');

const checks = [];

// Check 1: Environment variables
console.log('1️⃣  Checking environment variables...');
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  checks.push({ status: '❌', message: `Missing env vars: ${missingEnvVars.join(', ')}` });
} else {
  checks.push({ status: '✅', message: 'All required env vars present' });
}

// Check 2: Node modules
console.log('2️⃣  Checking node_modules...');
if (fs.existsSync('./node_modules')) {
  checks.push({ status: '✅', message: 'node_modules exists' });
} else {
  checks.push({ status: '❌', message: 'node_modules missing - run npm install' });
}

// Check 3: Prisma client
console.log('3️⃣  Checking Prisma client...');
if (fs.existsSync('./node_modules/.prisma/client')) {
  checks.push({ status: '✅', message: 'Prisma client generated' });
} else {
  checks.push({ status: '⚠️', message: 'Prisma client not found - will generate during build' });
}

// Check 4: Storage directories
console.log('4️⃣  Checking storage directories...');
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const storageBase = isVercel ? '/tmp/storage' : './storage';
const storageDirs = ['tmp', 'output', 'ai-models'].map(d => path.join(storageBase, d));

if (!isVercel) {
  const missingDirs = storageDirs.filter(d => !fs.existsSync(d));
  if (missingDirs.length === 0) {
    checks.push({ status: '✅', message: 'All storage directories exist' });
  } else {
    checks.push({ status: '⚠️', message: `Missing dirs: ${missingDirs.join(', ')} - will create during build` });
  }
} else {
  checks.push({ status: 'ℹ️', message: 'Vercel environment - storage will be created at /tmp' });
}

// Check 5: TypeScript configuration
console.log('5️⃣  Checking TypeScript config...');
if (fs.existsSync('./tsconfig.json')) {
  checks.push({ status: '✅', message: 'tsconfig.json exists' });
} else {
  checks.push({ status: '❌', message: 'tsconfig.json missing' });
}

// Check 6: Next.js config
console.log('6️⃣  Checking Next.js config...');
if (fs.existsSync('./next.config.js')) {
  checks.push({ status: '✅', message: 'next.config.js exists' });
} else {
  checks.push({ status: '❌', message: 'next.config.js missing' });
}

// Check 7: Critical source files
console.log('7️⃣  Checking critical source files...');
const criticalFiles = [
  './src/app/layout.tsx',
  './src/app/page.tsx',
  './src/lib/prisma.ts',
  './prisma/schema.prisma'
];
const missingFiles = criticalFiles.filter(f => !fs.existsSync(f));
if (missingFiles.length === 0) {
  checks.push({ status: '✅', message: 'All critical files present' });
} else {
  checks.push({ status: '❌', message: `Missing files: ${missingFiles.join(', ')}` });
}

// Summary
console.log('\n📊 Verification Summary:\n');
checks.forEach(check => {
  console.log(`${check.status}  ${check.message}`);
});

const hasErrors = checks.some(c => c.status === '❌');
const hasWarnings = checks.some(c => c.status === '⚠️');

console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ BUILD BLOCKED: Critical issues found');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  BUILD MAY PROCEED: Some warnings present');
  process.exit(0);
} else {
  console.log('✅ ALL CHECKS PASSED: Ready to build');
  process.exit(0);
}
