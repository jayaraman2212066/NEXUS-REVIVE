# 🔧 PDF-PARSE TEST FILE ERROR - ROOT CAUSE FIX

## Issue
```
Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
at /vercel/path0/.next/server/chunks/605.js:1:455709
```

## Root Cause Found

**File:** `node_modules/pdf-parse/index.js`

```javascript
let isDebugMode = !module.parent; 

//for testing purpose
if (isDebugMode) {
    let PDF_FILE = './test/data/05-versions-space.pdf';  // ❌ THIS LINE
    let dataBuffer = Fs.readFileSync(PDF_FILE);
    // ... test code
}
```

**Problem:** 
- The pdf-parse package has test code in its main index.js
- When webpack bundles it, the test code path gets included
- During build, Next.js tries to evaluate this code
- Test file doesn't exist in Vercel build → ENOENT error

## Solution Applied

**next.config.js** - Bypass pdf-parse index.js entirely:

```javascript
// Override pdf-parse to use lib directly and skip test code in index.js
config.resolve.alias['pdf-parse'] = require.resolve('pdf-parse/lib/pdf-parse.js');
```

**What this does:**
- Instead of importing `pdf-parse` → `pdf-parse/index.js` (with test code)
- We import `pdf-parse` → `pdf-parse/lib/pdf-parse.js` (pure library)
- Completely bypasses the test code section
- No test files referenced = no ENOENT error

## Files Modified
- ✅ `next.config.js`

## Commit
```
627a4ec - fix: bypass pdf-parse index.js test code
```

## Verification

The alias redirects:
```javascript
// Before (causes error):
import pdfParse from 'pdf-parse';  
// → node_modules/pdf-parse/index.js (has test code)

// After (works):
import pdfParse from 'pdf-parse';  
// → node_modules/pdf-parse/lib/pdf-parse.js (no test code)
```

## Expected Build Output

```
✅ Installing dependencies
✅ Generating Prisma Client
✅ Building Next.js
✅ Collecting page data (no ENOENT errors) ← FIXED
✅ Build completed
```

## Status

- ✅ Root cause identified
- ✅ Fix applied
- ✅ Pushed to main
- ⏳ Vercel auto-deploying now
- ⚠️ Still need to fix DATABASE_URL in Vercel dashboard

## Next: Fix DATABASE_URL

While build is running, set environment variables in Vercel:
```
DATABASE_URL=postgresql://...&sslmode=require  (use & not &amp;)
```
