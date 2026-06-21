#!/usr/bin/env node

console.log('Running post-install setup...');

const fs = require('fs');
const path = require('path');

// Create storage directories
const dirs = [
  './storage',
  './storage/tmp',
  './storage/output',
  './storage/ai-models',
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created ${dir}`);
  }
});

console.log('✓ Post-install complete');
