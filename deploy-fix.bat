@echo off
echo ========================================
echo  NEXUS REVIVE - VERCEL FIX DEPLOYMENT
echo ========================================
echo.

echo [1/4] Checking git status...
git status --short
echo.

echo [2/4] Adding all changes...
git add .
echo.

echo [3/4] Committing fix...
git commit -m "fix: Vercel upload and convert API routes - increase memory, add body parser config, add debug logging"
echo.

echo [4/4] Pushing to GitHub (Vercel auto-deploy)...
git push origin main
echo.

echo ========================================
echo  DEPLOYMENT INITIATED!
echo ========================================
echo.
echo Vercel will auto-deploy from GitHub in ~2-3 minutes
echo.
echo Monitor deployment:
echo https://vercel.com/dashboard
echo.
echo Test your site:
echo https://nexus-revive.vercel.app/convert
echo.
echo Open browser console (F12) to see debug logs:
echo - Upload logs: "🔄 Starting upload..."
echo - Convert logs: "🔄 Starting conversion..."
echo.
echo ========================================

pause
