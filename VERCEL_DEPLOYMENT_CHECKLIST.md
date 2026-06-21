# ✅ Vercel Deployment Checklist

## 📋 Pre-Deployment Status

### ✅ Phase 1: Project Structure
- [x] Next.js 14 App Router configured
- [x] TypeScript properly set up
- [x] All dependencies in package.json
- [x] .gitignore configured for secrets and build files
- [x] vercel.json configured with proper functions and timeouts
- [x] next.config.js optimized for Vercel

### ✅ Phase 2: Database & Prisma
- [x] Prisma schema defined (SQLite)
- [x] Binary targets include `rhel-openssl-3.0.x` for Vercel compatibility
- [x] Build script includes `prisma generate`
- ⚠️ **ACTION REQUIRED**: Vercel will need DATABASE_URL in environment variables

### ✅ Phase 3: File Storage
- [x] Storage paths configurable via environment variables
- [x] ensureDirectories() creates folders dynamically
- ⚠️ **IMPORTANT**: Vercel uses ephemeral filesystem (`/tmp` only writable)

### ✅ Phase 4: API Routes
- [x] All API routes use `export const dynamic = "force-dynamic"`
- [x] Upload route properly handles file size limits
- [x] Convert route has maxDuration: 300 configured
- [x] Error handling in all routes
- [x] CORS headers configured in next.config.js

### ✅ Phase 5: AI & Processing
- [x] Tesseract.js configured with cache path
- [x] All processors handle errors gracefully
- [x] OCR can be disabled via environment variable
- [x] Image processing with sharp configured

### ✅ Phase 6: Frontend
- [x] All pages are properly typed
- [x] Client components marked with "use client"
- [x] No hardcoded URLs (uses env variables)
- [x] Images optimized with Next.js Image component
- [x] Favicon properly configured

### ✅ Phase 7: Security
- [x] Environment variables not committed
- [x] Security headers in vercel.json
- [x] NEXTAUTH_SECRET required
- [x] File upload size limits enforced
- [x] Input sanitization in place

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Push to GitHub

1. **Initialize Git (if not already done):**
```bash
git init
git add .
git commit -m "Initial commit - Nexus Revive ready for deployment"
```

2. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Name: `nexus-revive`
   - Keep it **Private** (recommended for now)
   - Do NOT initialize with README (you already have one)

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/nexus-revive.git
git branch -M main
git push -u origin main
```

---

### Step 2: Vercel Import & Configuration

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click **"Add New..."** → **"Project"**

2. **Import Repository:**
   - Click **"Import Git Repository"**
   - Select your `nexus-revive` repository
   - Click **"Import"**

3. **Configure Project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (already set in vercel.json)
   - **Install Command**: `npm install` (already set in vercel.json)

---

### Step 3: Environment Variables

**CRITICAL**: Add these environment variables in Vercel dashboard:

#### Database
```
DATABASE_URL=file:/tmp/prisma.db
```

#### Authentication
```
NEXTAUTH_SECRET=YOUR_64_CHARACTER_RANDOM_STRING_HERE
NEXTAUTH_URL=https://YOUR_APP.vercel.app
```

> **Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 48
```

#### File Storage (Vercel uses /tmp)
```
STORAGE_PATH=/tmp/storage
TEMP_PATH=/tmp/storage/tmp
OUTPUT_PATH=/tmp/storage/output
AI_MODELS_PATH=/tmp/storage/ai-models
MAX_FREE_FILE_BYTES=26214400
MAX_PRO_FILE_BYTES=524288000
FILE_EXPIRY_HOURS=24
MAX_FREE_JOBS_PER_DAY=10
MAX_BATCH_FILES_PRO=50
```

#### AI Configuration
```
ENABLE_LOCAL_AI=true
ENABLE_OCR=true
AI_MODEL_CACHE=true
```

#### App Configuration
```
NEXT_PUBLIC_APP_NAME=Nexus Revive
NEXT_PUBLIC_APP_URL=https://YOUR_APP.vercel.app
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

#### Polar.sh (Optional - for payments)
```
NEXT_PUBLIC_POLAR_CHECKOUT_URL=https://buy.polar.sh/your-checkout-id
POLAR_ORG_ID=your-polar-org-id
POLAR_WEBHOOK_SECRET=your-polar-webhook-secret
POLAR_ACCESS_TOKEN=your-polar-api-token
POLAR_PRODUCT_ID=your-polar-product-id
```

#### Cron (Optional)
```
CRON_SECRET=your-random-cron-secret-here
```

---

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will show deployment status

---

### Step 5: Post-Deployment Verification

Visit your deployment URL and test:

1. ✅ Homepage loads
2. ✅ Can navigate to /convert page
3. ✅ Can upload a file
4. ✅ Preview text extraction works
5. ✅ File conversion works (at least to .txt)
6. ✅ No console errors in browser

---

## ⚠️ Known Vercel Limitations & Solutions

### Issue 1: Ephemeral Filesystem
**Problem**: Files uploaded to /tmp are deleted when serverless function ends.

**Solution**: 
- ✅ Already handled: Database stores file paths and metadata
- ✅ Files auto-delete after 24 hours (by design)
- 🔄 For production: Consider S3/R2 for persistent storage

### Issue 2: SQLite in Serverless
**Problem**: SQLite database at `/tmp/prisma.db` is ephemeral.

**Solutions**:
- **Option A (Quick)**: Use Vercel Postgres (free tier available)
  ```
  DATABASE_URL=postgres://...vercel...
  ```
  Change prisma/schema.prisma: `provider = "postgresql"`
  
- **Option B**: Use PlanetScale, Supabase, or Neon (all have free tiers)

- **Option C (Testing only)**: Keep SQLite, but know data resets frequently

### Issue 3: Function Timeout
**Problem**: Free tier has 10s timeout, Pro has 60s.

**Solution**:
- ✅ Already configured in vercel.json
- Convert route: 300s (requires Pro plan for full feature)
- Consider upgrading to Vercel Pro for production

### Issue 4: Large Dependencies
**Problem**: Tesseract.js and transformers.js are large.

**Solution**:
- ✅ Already configured in next.config.js
- External packages list set
- Consider lazy loading AI models

---

## 🔧 Troubleshooting

### Build Fails

**Check 1: Prisma Generation**
```bash
# Locally test the build
npm run build
```

**Check 2: TypeScript Errors**
```bash
npm run lint
```

**Check 3: Environment Variables**
- Ensure all required vars are set in Vercel dashboard

### Runtime Errors

**Check Vercel Logs:**
- Go to your project in Vercel
- Click **"Functions"** tab
- View error logs

**Common Issues:**
1. Missing environment variables
2. Prisma client not generated
3. File path issues (use /tmp on Vercel)

---

## 📦 Optional: Database Migration to PostgreSQL

If you want persistent database (recommended for production):

1. **Update prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Get PostgreSQL URL:**
   - Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
   - Or use Supabase: https://supabase.com
   - Or use Neon: https://neon.tech

3. **Add to Vercel Environment Variables:**
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

4. **Push schema:**
```bash
npx prisma db push
```

5. **Redeploy on Vercel**

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Homepage loads at your Vercel URL
- ✅ You can upload a test file
- ✅ File processing completes
- ✅ Preview shows extracted text
- ✅ Download works (for allowed formats)
- ✅ No critical errors in Vercel logs

---

## 📝 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Go to Vercel project settings → Domains
   - Add your domain (e.g., nexusrevive.com)

2. **Set up Polar.sh** (For payments)
   - Create account at https://polar.sh
   - Add products and checkout links
   - Update environment variables

3. **Enable Analytics** (Optional)
   - Vercel Analytics (built-in)
   - Or Google Analytics

4. **Monitor Performance**
   - Check Vercel metrics
   - Monitor function execution times
   - Review error logs

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

**Last Updated**: 2025-01-XX
**Status**: ✅ Ready for Deployment
