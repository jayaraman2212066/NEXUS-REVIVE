# 🔄 PostgreSQL Migration Guide

**Time Required**: 15-30 minutes  
**Difficulty**: Easy  
**Priority**: HIGH (for production)

---

## Why Migrate?

SQLite on Vercel:
- ❌ Database file stored in `/tmp` (ephemeral)
- ❌ Data resets on every deployment
- ❌ No persistence across serverless functions

PostgreSQL on Vercel:
- ✅ Persistent data
- ✅ Production-ready
- ✅ Free tier available
- ✅ Better performance at scale

---

## Option 1: Vercel Postgres (Recommended)

### Step 1: Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Choose region closest to your users
6. Click **"Create"**

### Step 2: Get Connection String

Vercel will automatically add these to your environment variables:
```
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
```

### Step 3: Update Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}

// Rest of your models stay the same...
```

### Step 4: Update Environment Variables

**Local (.env.local):**
```bash
# Use the POSTGRES_PRISMA_URL from Vercel
DATABASE_URL="postgres://default:...@...postgres.vercel-storage.com:5432/verceldb"
```

**Vercel Dashboard:**
```bash
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

### Step 5: Update Schema & Deploy

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed data
npm run db:seed

# Commit changes
git add .
git commit -m "Migrate to PostgreSQL"
git push origin main
```

Vercel will auto-deploy. Done! ✅

---

## Option 2: Supabase (Free Tier)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click **"New Project"**
3. Choose organization
4. Set project name, password, region
5. Wait 2 minutes for setup

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Find **Connection String** → **URI**
3. Replace `[YOUR-PASSWORD]` with your password

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Step 3: Update Schema & Environment

Same as Option 1, steps 3-5 above.

---

## Option 3: Neon (Serverless Postgres)

### Step 1: Create Neon Project

1. Go to https://neon.tech
2. Sign up and create project
3. Choose region
4. Get connection string

### Step 2: Add to Vercel

Same as Option 1, steps 3-5 above.

---

## Option 4: PlanetScale (MySQL Alternative)

If you prefer MySQL:

### Update Schema

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

Then follow PlanetScale docs.

---

## Schema Changes Summary

**Only 2 lines change:**

```diff
datasource db {
- provider = "sqlite"
+ provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**All your models stay identical!** ✅

---

## Data Type Compatibility

Your schema is already compatible! Prisma handles these conversions:

| Prisma Type | SQLite | PostgreSQL |
|-------------|--------|------------|
| String | TEXT | VARCHAR |
| Int | INTEGER | INTEGER |
| Boolean | INTEGER | BOOLEAN |
| DateTime | TEXT | TIMESTAMP |
| Json | TEXT | JSONB |

No changes needed ✅

---

## Testing the Migration

### 1. Test Locally

```bash
# Update .env.local with PostgreSQL URL
DATABASE_URL="postgres://..."

# Generate client
npx prisma generate

# Push schema
npx prisma db push

# Test
npm run dev

# Upload a test file
# Verify it works
```

### 2. Test on Vercel

After deployment:
1. Visit your Vercel URL
2. Upload a test file
3. Convert it
4. Redeploy (push a change)
5. Verify the file is still in database ✅

---

## Rollback Plan

If something goes wrong:

### Rollback to SQLite

```bash
# Revert prisma/schema.prisma
git revert HEAD

# Push
git push origin main
```

Your SQLite code still works, just with ephemeral data.

---

## Troubleshooting

### Error: "Connection timeout"

**Solution**: Check your DATABASE_URL is correct and database is running.

### Error: "SSL required"

**Solution**: Add to connection string:
```
?sslmode=require
```

### Error: "Can't reach database server"

**Solution**: 
1. Check database region matches Vercel region
2. Verify IP allowlist (Supabase/PlanetScale)
3. Use connection pooling URL

---

## Performance Tips

### 1. Use Connection Pooling

Vercel Postgres and Supabase provide pooled connections:
```
POSTGRES_PRISMA_URL  # Already pooled ✅
```

### 2. Index Important Queries

Already handled in your schema with `@unique` and `@id` ✅

### 3. Monitor Queries

```bash
# Enable query logging (development only)
DATABASE_URL="...?connection_limit=5"
```

---

## Cost Comparison

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Vercel Postgres** | 256 MB (0.5GB storage) | $0.50/GB |
| **Supabase** | 500 MB | $25/month (8GB) |
| **Neon** | 512 MB | $0.16/GB-hour |
| **PlanetScale** | 1 row read/write | $29/month |

**Recommendation**: Start with Vercel Postgres free tier ✅

---

## Migration Checklist

- [ ] Choose provider (Vercel Postgres recommended)
- [ ] Create database
- [ ] Get connection string
- [ ] Update `prisma/schema.prisma` (provider = "postgresql")
- [ ] Update `.env.local` with DATABASE_URL
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Test locally (`npm run dev`)
- [ ] Add DATABASE_URL to Vercel environment variables
- [ ] Commit and push to GitHub
- [ ] Verify deployment successful
- [ ] Test upload → convert → download flow
- [ ] Redeploy and verify data persists ✅

---

## After Migration

Your app will have:
- ✅ Persistent data across deployments
- ✅ Production-ready database
- ✅ Better performance
- ✅ Ability to scale

**Time to Complete**: 15-30 minutes  
**Deployment Impact**: Zero downtime (new database)

---

## Need Help?

- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Prisma PostgreSQL**: https://www.prisma.io/docs/concepts/database-connectors/postgresql
- **Supabase**: https://supabase.com/docs
- **Neon**: https://neon.tech/docs

---

**Status**: Ready to migrate ✅  
**Recommended**: Do this before production launch 🚀
