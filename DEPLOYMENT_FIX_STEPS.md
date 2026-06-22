# 🚀 STEP-BY-STEP DEPLOYMENT FIX

## Current Issues Detected
1. ❌ `DATABASE_URL` has `&amp;` instead of `&` (HTML encoded)
2. ❌ Prisma connection failing: "ENOENT: no such file or directory"
3. ❌ API routes returning 500 errors

## Fix Steps (Complete in Order)

### Step 1: Fix Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `nexus-revive`

2. **Navigate to Settings → Environment Variables**

3. **Delete the current DATABASE_URL**

4. **Add corrected DATABASE_URL:**
   ```
   postgresql://neondb_owner:npg_pdkeHCYi6F7t@ep-blue-lab-aotmpxgw-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```
   **CRITICAL:** Make sure it uses `&` NOT `&amp;`

5. **Verify all environment variables match** `VERCEL_ENV_COPY_PASTE_FIXED.txt`

### Step 2: Test Database Connection Locally

Before redeploying, test the connection:

```bash
# Test connection string
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient({ datasourceUrl: 'postgresql://neondb_owner:npg_pdkeHCYi6F7t@ep-blue-lab-aotmpxgw-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require' }); prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message)).finally(() => prisma.\$disconnect());"
```

### Step 3: Trigger Redeploy

**Option A: From Vercel Dashboard**
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Check "Use existing build cache" = OFF
5. Click "Redeploy"

**Option B: From Git**
```bash
git commit --allow-empty -m "Trigger redeploy with fixed env vars"
git push origin main
```

### Step 4: Monitor Deployment

1. **Watch build logs** in Vercel dashboard
2. Look for:
   - ✅ "Prisma Client generated"
   - ✅ "Database schema pushed"
   - ✅ "Build completed"

### Step 5: Verify Deployment

Once deployed, test these endpoints:

**Health Check:**
```bash
curl https://nexus-revive.vercel.app/api/health
```

**Expected:** `{"status":"ok","database":"connected",...}`

**Database Connection:**
```bash
curl https://nexus-revive.vercel.app/api/reviews/stats
```

**Expected:** JSON with review statistics

### Step 6: Test Full Conversion Flow

1. Visit: https://nexus-revive.vercel.app
2. Upload a test file (PDF, DOC, etc.)
3. Check if preview works
4. Monitor logs in Vercel dashboard

## Common Issues & Solutions

### Issue: Still getting "ENOENT" errors
**Solution:** Prisma client not generated during build
- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`
- Clear build cache and redeploy

### Issue: "P1001: Can't reach database server"
**Solution:** Check DATABASE_URL format
- Must use `&` not `&amp;`
- Verify credentials are correct
- Test connection from local machine

### Issue: "Storage init warning"
**Solution:** Normal on Vercel (uses /tmp)
- This is expected behavior
- Files are ephemeral on Vercel
- Auto-cleanup happens after 24 hours

## Environment Variables Checklist

Copy from `VERCEL_ENV_COPY_PASTE_FIXED.txt`:

- [ ] DATABASE_URL (with `&` not `&amp;`)
- [ ] DIRECT_DATABASE_URL
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] NEXT_PUBLIC_APP_URL
- [ ] All other variables from the file

## Next Steps After Successful Deploy

1. ✅ Test file upload
2. ✅ Test conversion
3. ✅ Test download
4. ✅ Test reviews section
5. ✅ Monitor error rates in Vercel
6. ✅ Set up custom domain (optional)

## Need Help?

Check logs:
```bash
# View function logs
vercel logs nexus-revive --follow
```

Or check Vercel dashboard → Runtime Logs
