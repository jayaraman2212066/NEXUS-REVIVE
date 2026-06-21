# Local Development Fix

## Issue: `/api/convert` returns 404

This is a Next.js development server caching issue. Here are the solutions:

### Solution 1: Clear Next.js Cache (RECOMMENDED)

```bash
# Stop the server (Ctrl+C)
# Delete cache
rmdir /s /q .next
del /f /q .next\*

# Reinstall and restart
npm install
npm run dev
```

### Solution 2: Force Full Rebuild

```bash
# Windows
rmdir /s /q .next
rmdir /s /q node_modules\.cache
npm run build
npm run dev
```

### Solution 3: Check API Route Manually

Visit in browser: `http://localhost:3001/api/health`

Should return: `{"status":"ok"}`

### Solution 4: Verify Database

```bash
npx prisma generate
npx prisma db push
```

### Quick Test Script

Create a file `test-api.js`:

```javascript
// test-api.js
const testAPI = async () => {
  try {
    // Test health
    const health = await fetch('http://localhost:3001/api/health');
    console.log('Health:', await health.json());

    // Test upload (you'll need a file)
    const formData = new FormData();
    formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');
    
    const upload = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });
    const uploadResult = await upload.json();
    console.log('Upload:', uploadResult);

    // Test convert
    if (uploadResult.jobId) {
      const convert = await fetch('http://localhost:3001/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: uploadResult.jobId,
          targetFormat: 'txt'
        }),
      });
      console.log('Convert status:', convert.status);
      console.log('Convert result:', await convert.json());
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
};

testAPI();
```

Run with: `node test-api.js`

## Common Causes

1. **Next.js cache corruption** - Delete `.next` folder
2. **Port conflict** - App is using port 3001 (3000 was busy)
3. **Missing Prisma client** - Run `npx prisma generate`
4. **Database not initialized** - Run `npx prisma db push`
5. **TypeScript compilation error** - Check terminal for TS errors

## Google Fonts Warning (Non-Critical)

The Google Fonts errors are due to network issues but won't break the app:
```
request to https://fonts.googleapis.com/css2?family=Inter... failed
```

**Fix:** App uses fallback system fonts automatically. To disable Google Fonts:

Edit `src/app/layout.tsx` and change font imports to local or remove them.

## Verify Everything Works

1. ✅ Server starts: `npm run dev`
2. ✅ Home page loads: `http://localhost:3001`
3. ✅ Health check: `http://localhost:3001/api/health`
4. ✅ Upload works: Try uploading a file
5. ✅ Convert works: Click convert button

## Still Not Working?

Check these files exist:
- `src/app/api/convert/route.ts` ✓
- `src/app/api/upload/route.ts` ✓
- `src/app/api/preview/[jobId]/route.ts` ✓

Check environment variables in `.env.local`:
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="nexus-revive-dev-secret-change-in-production-32c"
```

## Nuclear Option

```bash
# Complete reset
rmdir /s /q .next
rmdir /s /q node_modules
del package-lock.json
npm install
npx prisma generate
npx prisma db push
npm run dev
```

After this, your app should work perfectly!
