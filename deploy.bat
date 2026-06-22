@echo off
echo ========================================
echo NEXUS REVIVE - QUICK DEPLOY TO VERCEL
echo ========================================
echo.

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Adding all changes...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Production ready - Fixed storage and API initialization"
echo.

echo [4/4] Pushing to GitHub (triggers Vercel deploy)...
git push origin main
echo.

echo ========================================
echo DEPLOYMENT INITIATED!
echo ========================================
echo.
echo Next steps:
echo 1. Visit https://vercel.com/dashboard to monitor deployment
echo 2. Check logs for any errors
echo 3. Test at https://nexus-revive.vercel.app
echo 4. After success, run: npm run db:seed-reviews
echo.
pause
