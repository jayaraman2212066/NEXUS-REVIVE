# 🚀 VERCEL DEPLOYMENT - COMPLETE STEP-BY-STEP GUIDE

## ⚠️ FOLLOW THESE STEPS IN EXACT ORDER

---

## STEP 1: Generate NEXTAUTH_SECRET First

**Before anything else, generate your secret key.**

### On Windows (Command Prompt or PowerShell):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Example Output:
```
a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

**COPY THIS VALUE** - You'll need it in Step 3!

---

## STEP 2: Go to Vercel Dashboard

1. Open browser and go to: **https://vercel.com/dashboard**
2. Sign in if needed
3. Find your project: **nexus-revive**
4. Click on the project name

---

## STEP 3: Set Environment Variables

### 3.1 Click "Settings" Tab
Located at the top of your project page.

### 3.2 Click "Environment Variables" in Left Sidebar

### 3.3 Add Each Variable One by One

**For EACH variable below:**
- Click **"Add New"** button
- Enter the **Key** (left box)
- Enter the **Value** (right box)
- Select **"Production"** checkbox
- Select **"Preview"** checkbox (optional)
- Click **"Save"**

---

### 📝 COPY-PASTE THESE VARIABLES:

#### Variable 1:
```
Key:   DATABASE_URL
Value: file:/tmp/prisma.db
```
☑️ Production ☑️ Preview → Save

#### Variable 2:
```
Key:   NEXTAUTH_SECRET
Value: <PASTE YOUR GENERATED 64-CHAR STRING FROM STEP 1>
```
☑️ Production ☑️ Preview → Save

#### Variable 3:
```
Key:   NEXTAUTH_URL
Value: https://nexus-revive.vercel.app
```
☑️ Production ☑️ Preview → Save

**Note:** Replace with your actual Vercel URL if different

#### Variable 4:
```
Key:   NEXT_PUBLIC_APP_URL
Value: https://nexus-revive.vercel.app
```
☑️ Production ☑️ Preview → Save

#### Variable 5:
```
Key:   NEXT_PUBLIC_APP_NAME
Value: Nexus Revive
```
☑️ Production ☑️ Preview → Save

#### Variable 6:
```
Key:   NEXT_PUBLIC_APP_VERSION
Value: 1.0.0
```
☑️ Production ☑️ Preview → Save

#### Variable 7:
```
Key:   NODE_ENV
Value: production
```
☑️ Production ☑️ Preview → Save

#### Variable 8:
```
Key:   STORAGE_PATH
Value: /tmp/storage
```
☑️ Production ☑️ Preview → Save

#### Variable 9:
```
Key:   TEMP_PATH
Value: /tmp/storage/tmp
```
☑️ Production ☑️ Preview → Save

#### Variable 10:
```
Key:   OUTPUT_PATH
Value: /tmp/storage/output
```
☑️ Production ☑️ Preview → Save

#### Variable 11:
```
Key:   AI_MODELS_PATH
Value: /tmp/storage/ai-models
```
☑️ Production ☑️ Preview → Save

#### Variable 12:
```
Key:   ENABLE_LOCAL_AI
Value: true
```
☑️ Production ☑️ Preview → Save

#### Variable 13:
```
Key:   ENABLE_OCR
Value: true
```
☑️ Production ☑️ Preview → Save

#### Variable 14:
```
Key:   AI_MODEL_CACHE
Value: true
```
☑️ Production ☑️ Preview → Save

#### Variable 15:
```
Key:   MAX_FREE_FILE_BYTES
Value: 26214400
```
☑️ Production ☑️ Preview → Save

#### Variable 16:
```
Key:   MAX_PRO_FILE_BYTES
Value: 524288000
```
☑️ Production ☑️ Preview → Save

#### Variable 17:
```
Key:   FILE_EXPIRY_HOURS
Value: 24
```
☑️ Production ☑️ Preview → Save

#### Variable 18:
```
Key:   MAX_FREE_JOBS_PER_DAY
Value: 10
```
☑️ Production ☑️ Preview → Save

#### Variable 19:
```
Key:   MAX_BATCH_FILES_PRO
Value: 50
```
☑️ Production ☑️ Preview → Save

---

### 🎯 Optional - Polar Monetization Variables

**Only add these if you have Polar.sh account:**

#### Variable 20 (Optional):
```
Key:   NEXT_PUBLIC_POLAR_CHECKOUT_URL
Value: https://buy.polar.sh/polar_cl_r6JtJ7fUkqiBrc0sem02LQIJWYhO5fUx5TEZH2TglPa
```
☑️ Production ☑️ Preview → Save

#### Variable 21 (Optional):
```
Key:   POLAR_ORG_ID
Value: 49987b95-c011-4be3-ae4f-838e943c9e90
```
☑️ Production ☑️ Preview → Save

#### Variable 22 (Optional):
```
Key:   POLAR_WEBHOOK_SECRET
Value: <YOUR_POLAR_WEBHOOK_SECRET>
```
☑️ Production ☑️ Preview → Save

---

## STEP 4: Verify All Variables Are Set

### 4.1 Check Your Environment Variables Page

You should see **19 variables** (or 22 if you added Polar).

### 4.2 Critical Variables Checklist:

- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET (64 characters)
- ✅ NEXTAUTH_URL
- ✅ NEXT_PUBLIC_APP_URL
- ✅ NODE_ENV
- ✅ All storage paths (4 variables)
- ✅ All feature flags (3 variables)
- ✅ All limits (4 variables)

---

## STEP 5: Trigger Redeploy

### 5.1 Go to "Deployments" Tab
Click **"Deployments"** at the top of your project page.

### 5.2 Find Latest Deployment
You'll see a list of deployments. Find the most recent one (at the top).

### 5.3 Click Three Dots Menu
On the right side of the latest deployment, click the **"..."** (three dots).

### 5.4 Click "Redeploy"

### 5.5 IMPORTANT: Uncheck "Use existing Build Cache"
- You'll see a popup
- **UNCHECK** the box that says "Use existing Build Cache"
- This ensures a fresh build with new env vars

### 5.6 Click "Redeploy" Button
The deployment will start immediately.

---

## STEP 6: Monitor the Build

### 6.1 Watch Build Logs

Click on the deployment to see live logs.

### 6.2 Expected Output:

```
Running build in Washington, D.C., USA (East) – iad1
✓ Cloning github.com/jayaraman2212066/NEXUS-REVIVE
✓ Running "vercel build"
✓ Running "npm install"...
✓ Running "prisma generate"...
✓ Generating Prisma Client...
✓ Creating an optimized production build...
✓ Compiled successfully
✓ Checking validity of types...
✓ Collecting page data...
✓ Generating static pages...
✓ Build completed successfully
✓ Deployment ready
```

### 6.3 Build Time:
- Expected: **2-4 minutes**
- If longer than 5 minutes, check for errors

---

## STEP 7: Build Success Indicators

### ✅ You'll see:
```
Build completed
Functions: 14 deployed
Pages: 3 deployed
Status: Ready
Domain: https://nexus-revive-xxxxx.vercel.app
```

### ❌ If you see errors:
1. Check environment variables are all set
2. Check NEXTAUTH_SECRET is 64 characters
3. Look at specific error in logs
4. See troubleshooting section below

---

## STEP 8: Test Your Deployment

### 8.1 Get Your Deployment URL

After successful build, you'll see:
```
✅ Production: https://nexus-revive.vercel.app
```

### 8.2 Test These URLs:

#### Test 1: Health Check
```
https://nexus-revive.vercel.app/api/health
```
**Expected:** JSON response like:
```json
{
  "status": "ok",
  "timestamp": "2025-01-08T...",
  "version": "1.0.0"
}
```

#### Test 2: Home Page
```
https://nexus-revive.vercel.app/
```
**Expected:** Landing page with logo, features, "Get Started" button

#### Test 3: Converter Page
```
https://nexus-revive.vercel.app/convert
```
**Expected:** File upload interface with drop zone

#### Test 4: Upload a File
1. Go to converter page
2. Drop a .doc or .pdf file
3. Wait for upload (few seconds)
4. Select output format
5. Click "Convert"
6. Wait for conversion (10-30 seconds)
7. See preview
8. Download (if Pro)

---

## STEP 9: Update URLs if Needed

### If Your Actual URL is Different:

Your actual URL might be:
- `https://nexus-revive-git-main-j-ai-enterprices.vercel.app`
- Or a custom domain

### Update These Variables:
1. Go back to Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Click "Edit"
4. Update with actual URL
5. Do same for `NEXT_PUBLIC_APP_URL`
6. Redeploy again

---

## 🔧 TROUBLESHOOTING

### Issue 1: "Missing NEXTAUTH_SECRET"
**Solution:** 
- Check you added it in Step 3, Variable 2
- Must be exactly 64 characters
- Regenerate if needed

### Issue 2: "Build Failed"
**Solution:**
- Check all 19 variables are set
- Clear build cache (uncheck box when redeploying)
- Check commit is 86d4cfd or newer

### Issue 3: "Cannot connect to database"
**Solution:**
- Check DATABASE_URL is `file:/tmp/prisma.db`
- Not `file:./prisma/dev.db`
- Must be `/tmp/` for Vercel

### Issue 4: "Module not found"
**Solution:**
- This was fixed in commit 82825de
- Make sure Vercel is deploying latest commit
- Redeploy without cache

### Issue 5: "Environment variable not found"
**Solution:**
- Go to Settings → Environment Variables
- Verify all variables show "Production" tag
- If missing, add it
- Redeploy

---

## ✅ SUCCESS CHECKLIST

After deployment, verify:

- ✅ Health endpoint returns JSON
- ✅ Home page loads completely
- ✅ Logo displays
- ✅ "Get Started" button works
- ✅ Converter page loads
- ✅ File upload works
- ✅ Can select file format
- ✅ Conversion completes
- ✅ Preview shows text
- ✅ No console errors

---

## 📊 VERIFICATION COMMANDS

### Check Deployment Status:
```bash
curl https://nexus-revive.vercel.app/api/health
```

### Check if Variables Loaded:
The health endpoint will fail if critical vars missing.

---

## 🎉 YOU'RE DONE!

If all tests pass:
1. ✅ Your app is live!
2. ✅ All features working
3. ✅ Database initializing on first use
4. ✅ File uploads working
5. ✅ Conversions working

---

## 📞 NEED HELP?

**Check these files:**
- `FINAL_FIX_APPLIED.md` - Latest fixes
- `VERCEL_TROUBLESHOOTING.md` - Common issues
- `BUILD_FIXES_APPLIED.md` - All technical fixes

**Or check build logs in Vercel Dashboard for specific errors.**

---

**DEPLOYMENT COMPLETE! 🚀**

Your Nexus Revive app is now live on Vercel!

Share your URL: `https://nexus-revive.vercel.app`
