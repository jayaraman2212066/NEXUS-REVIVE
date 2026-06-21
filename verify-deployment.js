#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before pushing to GitHub/Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let errorCount = 0;
let warningCount = 0;

function log(message, type = 'info') {
  const colors = { success: GREEN, error: RED, warning: YELLOW, info: RESET };
  const color = colors[type] || RESET;
  console.log(`${color}${message}${RESET}`);
}

function check(name, fn) {
  process.stdout.write(`${BOLD}Checking: ${name}${RESET}... `);
  try {
    fn();
    log('✅ PASS', 'success');
  } catch (error) {
    log(`❌ FAIL: ${error.message}`, 'error');
    errorCount++;
  }
}

function warn(name, fn) {
  process.stdout.write(`${BOLD}Warning: ${name}${RESET}... `);
  try {
    fn();
    log('✅ OK', 'success');
  } catch (error) {
    log(`⚠️  ${error.message}`, 'warning');
    warningCount++;
  }
}

console.log(`\n${BOLD}🚀 Nexus Revive - Pre-Deployment Verification${RESET}\n`);

// ── Essential Files ──────────────────────────────────────────────────────
check('package.json exists', () => {
  if (!fs.existsSync('package.json')) throw new Error('package.json not found');
});

check('next.config.js exists', () => {
  if (!fs.existsSync('next.config.js')) throw new Error('next.config.js not found');
});

check('vercel.json exists', () => {
  if (!fs.existsSync('vercel.json')) throw new Error('vercel.json not found');
});

check('prisma/schema.prisma exists', () => {
  if (!fs.existsSync('prisma/schema.prisma')) throw new Error('schema.prisma not found');
});

// ── Environment Check ────────────────────────────────────────────────────
warn('.env.example exists', () => {
  if (!fs.existsSync('.env.example')) throw new Error('.env.example missing');
});

check('.env or .env.local exists', () => {
  if (!fs.existsSync('.env') && !fs.existsSync('.env.local')) {
    throw new Error('No .env file found - create one from .env.example');
  }
});

// ── .gitignore Check ─────────────────────────────────────────────────────
check('.gitignore prevents secrets', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf-8');
  if (!gitignore.includes('.env')) throw new Error('.env not in .gitignore');
  if (!gitignore.includes('*.db')) throw new Error('*.db not in .gitignore');
});

// ── Dependencies ─────────────────────────────────────────────────────────
check('node_modules installed', () => {
  if (!fs.existsSync('node_modules')) {
    throw new Error('Run: npm install');
  }
});

// ── TypeScript Check ─────────────────────────────────────────────────────
check('TypeScript compiles', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (e) {
    throw new Error('TypeScript errors found. Run: npx tsc --noEmit');
  }
});

// ── Linting ──────────────────────────────────────────────────────────────
warn('ESLint passes', () => {
  try {
    execSync('npm run lint', { stdio: 'pipe' });
  } catch (e) {
    throw new Error('Linting issues. Run: npm run lint');
  }
});

// ── Prisma ───────────────────────────────────────────────────────────────
check('Prisma schema valid', () => {
  try {
    execSync('npx prisma validate', { stdio: 'pipe' });
  } catch (e) {
    throw new Error('Invalid Prisma schema');
  }
});

check('Prisma client generated', () => {
  const clientPath = path.join('node_modules', '@prisma', 'client');
  if (!fs.existsSync(clientPath)) {
    throw new Error('Run: npx prisma generate');
  }
});

// ── Build Test ───────────────────────────────────────────────────────────
check('Next.js build succeeds', () => {
  log('\n  Building... (this may take 30-60 seconds)', 'info');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (e) {
    throw new Error('Build failed. Check errors above.');
  }
});

// ── Critical Directories ─────────────────────────────────────────────────
check('public/ directory exists', () => {
  if (!fs.existsSync('public')) throw new Error('public/ directory missing');
});

check('Favicon exists', () => {
  if (!fs.existsSync('public/n_logo_tabbrowse.ico')) {
    throw new Error('Favicon missing at public/n_logo_tabbrowse.ico');
  }
});

// ── API Routes Check ─────────────────────────────────────────────────────
check('API routes exist', () => {
  const routes = [
    'src/app/api/upload/route.ts',
    'src/app/api/convert/route.ts',
    'src/app/api/preview/[jobId]/route.ts',
    'src/app/api/download/[jobId]/route.ts',
  ];
  
  for (const route of routes) {
    if (!fs.existsSync(route)) {
      throw new Error(`Missing API route: ${route}`);
    }
  }
});

// ── Results ──────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);

if (errorCount === 0 && warningCount === 0) {
  log(`\n✅ ${BOLD}ALL CHECKS PASSED!${RESET}`, 'success');
  log('\n🚀 Your project is ready to deploy to Vercel!\n', 'success');
  log('Next steps:', 'info');
  log('  1. git add .', 'info');
  log('  2. git commit -m "Ready for deployment"', 'info');
  log('  3. git push origin main', 'info');
  log('  4. Import repository to Vercel\n', 'info');
  process.exit(0);
} else {
  if (errorCount > 0) {
    log(`\n❌ ${errorCount} ERROR(S) FOUND`, 'error');
    log('   Fix errors before deploying.\n', 'error');
  }
  if (warningCount > 0) {
    log(`\n⚠️  ${warningCount} WARNING(S)`, 'warning');
    log('   Warnings won\'t prevent deployment but should be reviewed.\n', 'warning');
  }
  process.exit(errorCount > 0 ? 1 : 0);
}
