# 🚀 VERCEL DEPLOYMENT - BUILD FIX APPLIED

## ✅ Issues Fixed

1. **Removed `prisma db push` from build script** - SQLite can't be pushed during build on Vercel
2. **Added binary targets** - `linux-musl-openssl-3.0.x` for Vercel serverless
3. **Storage initialization** - Middleware creates `/tmp` directories at runtime
4. **Build command updated** - Uses `prisma generate && next build` only
5. **Package.json fixed** - Removed pnpm references, using npm

---

## 📋 Vercel Dashboard Configuration

### Required Environment Variables

Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

```env
# Database (CRITICAL - use /tmp for serverless)
DATABASE_URL=file:/tmp/prisma.db

# Auth (generate with: openssl rand -base64 48)
NEXTAUTH_SECRET=your-64-char-random-secret-here
NEXTAUTH_URL=https://your-project.vercel.app

# Storage paths (auto-created by middleware)
STORAGE_PATH=/tmp/storage
TEMP_PATH=/tmp/storage/tmp
OUTPUT_PATH=/tmp/storage/output
AI_MODELS_PATH=/tmp/storage/ai-models

# File limits
MAX_FREE_FILE_BYTES=26214400
MAX_PRO_FILE_BYTES=524288000
FILE_EXPIRY_HOURS=24
MAX_FREE_JOBS_PER_DAY=10
MAX_BATCH_FILES_PRO=50

# AI features
ENABLE_LOCAL_AI=true
ENABLE_OCR=true
AI_MODEL_CACHE=true

# App
NEXT_PUBLIC_APP_NAME=Nexus Revive
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NODE_ENV=production

# Optional: Polar.sh (if using payments)
NEXT_PUBLIC_POLAR_CHECKOUT_URL=https://buy.polar.sh/your-checkout-id
POLAR_ORG_ID=your-org-id
```

---

## 🔧 Deploy Steps

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Auto-Deploy

1. Push to your `main` branch on GitHub
2. Vercel will auto-deploy
3. Check build logs at vercel.com/your-project

---

## ⚠️ Important Notes

### SQLite Limitations on Vercel

- **Database resets on each cold start** - SQLite is stored in `/tmp` which is ephemeral
- **Reviews/jobs are NOT persisted** between deployments
- **For production**, migrate to:
  - **PostgreSQL** (Vercel Postgres, Neon, Supabase)
  - **PlanetScale** (MySQL)
  - **Turso** (Edge SQLite)

### File Storage

- Files stored in `/tmp` are **temporary**
- **24-hour auto-delete** still applies
- For persistent storage, use:
  - **Vercel Blob**
  - **AWS S3**
  - **Cloudflare R2**

### Edge Functions

Current setup uses **Node.js serverless functions** (not Edge Runtime) because:
- Prisma requires Node.js
- File processing (mammoth, xlsx) needs full Node.js
- OCR (Tesseract) requires Node.js binaries

---

## 🐛 Troubleshooting

### Build fails with "prisma generate" error

```bash
# Locally, regenerate Prisma client
npm run postinstall
```

### "Can't reach database" in production

Check Vercel logs:
- Ensure `DATABASE_URL=file:/tmp/prisma.db` is set
- Database auto-creates on first API request

### Large bundle size warning

Expected - includes:
- Tesseract.js OCR engine (~15MB)
- XLSX, mammoth, pdf-parse
- Prisma client binaries

---

## 🔄 Upgrade to PostgreSQL (Production-Ready)

See `POSTGRESQL_MIGRATION.md` for full guide.

Quick steps:

1. **Create Postgres database** (Vercel Postgres recommended)

2. **Update `prisma/schema.prisma`**:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Set DATABASE_URL** in Vercel:
```
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

4. **Push schema**:
```bash
npx prisma db push
```

5. **Seed reviews** (optional):
```bash
npm run db:seed-reviews
```

---

## ✅ Verification

After deployment, test:

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Upload test
# Visit https://your-project.vercel.app/convert
# Drop a .txt or .doc file
```

---

## 📊 Expected Build Output

```
✅ Cloning repository
✅ Installing dependencies (npm install)
✅ Running "prisma generate"
✅ Running "next build"
✅ Build completed in ~2-3 minutes
✅ Deployment ready
```

---

## 🎯 Next Steps

1. **Set environment variables** in Vercel Dashboard
2. **Deploy**: `vercel --prod`
3. **Test upload** at `/convert`
4. **Optional**: Migrate to PostgreSQL for persistence
5. **Optional**: Configure custom domain

---

Built with ❤️ for Nexus Revive
