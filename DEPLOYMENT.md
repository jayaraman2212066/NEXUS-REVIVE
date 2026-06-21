# Nexus Revive - Production Deployment Guide

## Architecture Overview

**Decoupled Infrastructure:**
- **Frontend**: Next.js on Vercel
- **Backend Processor**: FastAPI/Python on Render (optional)
- **Domain Masking**: All traffic routed through your custom domain

## Prerequisites

1. GitHub account with repository created
2. Vercel account (free tier)
3. Custom domain (optional, recommended for production)
4. Render account (optional, for FastAPI backend)

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Nexus Revive"
git branch -M main
git remote add origin https://github.com/jayaraman2212066/NEXUS-REVIVE.git
git push -u origin main
```

## Step 2: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add the following secrets:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-vercel-org-id>
VERCEL_PROJECT_ID=<your-vercel-project-id>

DATABASE_URL=file:./prisma/prod.db
NEXTAUTH_SECRET=<generate-64-char-random-string>
NEXTAUTH_URL=https://nexusrevive.com

NEXT_PUBLIC_POLAR_CHECKOUT_URL=https://buy.polar.sh/...
POLAR_ORG_ID=49987b95-c011-4be3-ae4f-838e943c9e90
POLAR_WEBHOOK_SECRET=<your-webhook-secret>

PROCESSOR_API_URL=https://nexusrevive-processor.onrender.com
```

### Generate NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Deploy to Vercel

### Option A: Automatic GitHub Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will auto-deploy on every push to `main`
3. GitHub Actions workflow will handle builds

### Option B: Manual Vercel Deployment
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Step 4: Configure Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add ALL variables from `.env.production`:

```env
DATABASE_URL=file:./prisma/prod.db
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://nexusrevive.com
NEXT_PUBLIC_POLAR_CHECKOUT_URL=https://buy.polar.sh/...
POLAR_ORG_ID=49987b95-c011-4be3-ae4f-838e943c9e90
POLAR_WEBHOOK_SECRET=<your-secret>
PROCESSOR_API_URL=https://nexusrevive-processor.onrender.com
NEXT_PUBLIC_PROCESSOR_ENDPOINT=/api/processor
STORAGE_PATH=/tmp/storage
TEMP_PATH=/tmp/storage/tmp
OUTPUT_PATH=/tmp/storage/output
AI_MODELS_PATH=/tmp/storage/ai-models
MAX_FREE_FILE_BYTES=26214400
MAX_PRO_FILE_BYTES=524288000
FILE_EXPIRY_HOURS=24
MAX_FREE_JOBS_PER_DAY=10
MAX_BATCH_FILES_PRO=50
ENABLE_LOCAL_AI=true
ENABLE_OCR=true
AI_MODEL_CACHE=true
NEXT_PUBLIC_APP_NAME=Nexus Revive
NEXT_PUBLIC_APP_URL=https://nexusrevive.com
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
ALLOWED_ORIGINS=https://nexusrevive.com,https://www.nexusrevive.com
```

## Step 5: Configure Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain: `nexusrevive.com`
3. Add `www.nexusrevive.com` (optional)
4. Follow Vercel's DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### DNS Records (Example):
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 6: Deploy FastAPI Backend to Render (Optional)

If you have a separate FastAPI processor:

1. Create a new Web Service on Render
2. Connect your backend repository
3. Set environment variables
4. Deploy
5. Copy the Render URL (e.g., `https://nexusrevive-processor.onrender.com`)
6. Update `PROCESSOR_API_URL` in Vercel environment variables

## Step 7: Verify Domain Masking

Test that backend requests are properly masked:

```bash
# Should return results without exposing .onrender.com
curl https://nexusrevive.com/api/processor/health
```

All `/api/processor/*` requests will be invisibly proxied to your Render backend.

## Step 8: Test Production Deployment

1. Visit `https://nexusrevive.com`
2. Upload a test file
3. Verify conversion works
4. Check that logos appear:
   - Browser tab shows `n_logo_tabbrowse.png`
   - Downloaded files have `n_logo_print.png` watermark
5. Test paywall for Pro features

## Monitoring & Maintenance

### View Logs
```bash
vercel logs <deployment-url>
```

### Redeploy
```bash
git push origin main  # Auto-deploys via GitHub Actions
```

### Database Migrations
```bash
# Run on Vercel deployment
npx prisma db push
```

## Troubleshooting

### Issue: "Module not found" errors
**Solution**: Ensure all dependencies are in `package.json` and run:
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Issue: Environment variables not working
**Solution**: 
1. Check Vercel Dashboard → Environment Variables
2. Ensure they're set for "Production" environment
3. Redeploy after adding variables

### Issue: 404 on API routes
**Solution**: Check `next.config.js` rewrites are properly configured

### Issue: Images/logos not showing
**Solution**: Ensure `n_logo_print.png` and `n_logo_tabbrowse.png` are in `/public` directory

### Issue: Database errors
**Solution**: 
```bash
npx prisma generate
npx prisma db push
```

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is a strong random string (64+ characters)
- [ ] All secrets are stored in Vercel environment variables (not in code)
- [ ] `ALLOWED_ORIGINS` only includes your production domains
- [ ] HTTPS is enforced (automatic with Vercel)
- [ ] CORS headers are properly configured
- [ ] File upload size limits are enforced

## Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Configure CDN caching for static assets
- [ ] Monitor serverless function execution time
- [ ] Set up error tracking (Sentry)
- [ ] Configure database connection pooling

## Cost Estimates

**Free Tier (Vercel):**
- 100GB bandwidth/month
- 100 serverless function executions/day
- 6000 build minutes/year

**Pro Tier ($20/month):**
- 1TB bandwidth
- Unlimited executions
- Advanced analytics

## Backup Strategy

```bash
# Backup database
cp prisma/prod.db prisma/backup-$(date +%Y%m%d).db

# Backup storage
tar -czf storage-backup-$(date +%Y%m%d).tar.gz storage/
```

## Support

- Documentation: [README.md](README.md)
- Issues: GitHub Issues
- Email: support@nexusrevive.com

---

**🎉 Your Nexus Revive deployment is complete!**

Visit your domain and start resurrecting files.
