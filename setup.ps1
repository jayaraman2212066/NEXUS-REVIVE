# Nexus Revive - Setup Script
# This script seeds 100K reviews and pushes to GitHub

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  NEXUS REVIVE - SETUP WIZARD" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Step 1: Check if node_modules exists
Write-Host "`n[1/5] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "   ✓ Dependencies already installed" -ForegroundColor Green
}

# Step 2: Setup database
Write-Host "`n[2/5] Setting up database..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database ready" -ForegroundColor Green
} else {
    Write-Host "   ✗ Database setup failed" -ForegroundColor Red
    exit 1
}

# Step 3: Seed reviews
Write-Host "`n[3/5] Seeding 100,000 reviews (this takes 2-5 minutes)..." -ForegroundColor Yellow
npm run db:seed-reviews
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Reviews seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Review seeding failed" -ForegroundColor Red
    exit 1
}

# Step 4: Initialize Git and commit
Write-Host "`n[4/5] Preparing Git repository..." -ForegroundColor Yellow

# Check if .git exists
if (-not (Test-Path ".git")) {
    Write-Host "   Initializing Git..." -ForegroundColor Gray
    git init
} else {
    Write-Host "   ✓ Git already initialized" -ForegroundColor Green
}

Write-Host "   Staging files..." -ForegroundColor Gray
git add .

$commitMessage = "Initial commit - Nexus Revive with 100K reviews (4.6★ avg)"
Write-Host "   Creating commit: '$commitMessage'" -ForegroundColor Gray
git commit -m $commitMessage

Write-Host "   Setting main branch..." -ForegroundColor Gray
git branch -M main

# Step 5: Add remote and push
Write-Host "`n[5/5] Pushing to GitHub..." -ForegroundColor Yellow

$repoUrl = "https://github.com/jayaraman2212066/NEXUS-REVIVE.git"

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "   Adding remote: $repoUrl" -ForegroundColor Gray
    git remote add origin $repoUrl
} else {
    Write-Host "   ✓ Remote already configured" -ForegroundColor Green
}

Write-Host "   Pushing to GitHub..." -ForegroundColor Gray
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=====================================" -ForegroundColor Green
    Write-Host "  ✓ SUCCESS!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "`nYour project is now on GitHub!" -ForegroundColor White
    Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
    Write-Host "`nReview Statistics:" -ForegroundColor White
    Write-Host "  • 100,020 total reviews" -ForegroundColor Gray
    Write-Host "  • 4.6★ average rating" -ForegroundColor Gray
    Write-Host "  • 20 featured testimonials" -ForegroundColor Gray
    Write-Host "`nNext Steps:" -ForegroundColor White
    Write-Host "  1. Go to https://vercel.com/new" -ForegroundColor Gray
    Write-Host "  2. Import: jayaraman2212066/NEXUS-REVIVE" -ForegroundColor Gray
    Write-Host "  3. Add environment variables (see REVIEWS_AND_GITHUB_SETUP.md)" -ForegroundColor Gray
    Write-Host "  4. Deploy!" -ForegroundColor Gray
    Write-Host "`nDocumentation:" -ForegroundColor White
    Write-Host "  • REVIEWS_AND_GITHUB_SETUP.md - Full setup guide" -ForegroundColor Gray
    Write-Host "  • VERCEL_DEPLOYMENT_CHECKLIST.md - Deployment steps" -ForegroundColor Gray
    Write-Host "  • DEPLOY_NOW.md - Quick deploy guide" -ForegroundColor Gray
} else {
    Write-Host "`n=====================================" -ForegroundColor Red
    Write-Host "  ✗ PUSH FAILED" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "`nPossible issues:" -ForegroundColor Yellow
    Write-Host "  1. Repository doesn't exist on GitHub" -ForegroundColor Gray
    Write-Host "     Create it at: https://github.com/new" -ForegroundColor Gray
    Write-Host "  2. Authentication required" -ForegroundColor Gray
    Write-Host "     Run: gh auth login" -ForegroundColor Gray
    Write-Host "  3. Wrong repository URL" -ForegroundColor Gray
    Write-Host "     Check: $repoUrl" -ForegroundColor Gray
    Write-Host "`nTry manual push:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main --force" -ForegroundColor Cyan
}

Write-Host ""
