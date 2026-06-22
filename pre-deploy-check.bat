@echo off
echo ========================================
echo NEXUS REVIVE - PRE-DEPLOYMENT CHECK
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found. Are you in the project root?
    pause
    exit /b 1
)

echo [1/6] Checking TypeScript...
call npx tsc --noEmit
if errorlevel 1 (
    echo.
    echo ERROR: TypeScript compilation failed!
    echo Fix the errors above before deploying.
    pause
    exit /b 1
)
echo     ✅ TypeScript OK
echo.

echo [2/6] Checking Prisma schema...
call npx prisma validate
if errorlevel 1 (
    echo.
    echo ERROR: Prisma schema validation failed!
    pause
    exit /b 1
)
echo     ✅ Prisma schema valid
echo.

echo [3/6] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo.
    echo ERROR: Prisma generation failed!
    pause
    exit /b 1
)
echo     ✅ Prisma Client generated
echo.

echo [4/6] Checking critical files...
set FILES_OK=1

if not exist "src\lib\api-init.ts" (
    echo     ❌ Missing: src\lib\api-init.ts
    set FILES_OK=0
)

if not exist "src\lib\storage.ts" (
    echo     ❌ Missing: src\lib\storage.ts
    set FILES_OK=0
)

if not exist "src\lib\db-init.ts" (
    echo     ❌ Missing: src\lib\db-init.ts
    set FILES_OK=0
)

if not exist "src\app\api\convert\route.ts" (
    echo     ❌ Missing: src\app\api\convert\route.ts
    set FILES_OK=0
)

if not exist "src\app\api\upload\route.ts" (
    echo     ❌ Missing: src\app\api\upload\route.ts
    set FILES_OK=0
)

if not exist "prisma\schema.prisma" (
    echo     ❌ Missing: prisma\schema.prisma
    set FILES_OK=0
)

if not exist "vercel.json" (
    echo     ❌ Missing: vercel.json
    set FILES_OK=0
)

if %FILES_OK%==0 (
    echo.
    echo ERROR: Some critical files are missing!
    pause
    exit /b 1
)
echo     ✅ All critical files present
echo.

echo [5/6] Checking git status...
git status --short
echo.

echo [6/6] Checking Vercel environment variables...
echo.
echo Make sure these are set in Vercel:
echo     ✓ DATABASE_URL
echo     ✓ DIRECT_DATABASE_URL
echo     ✓ NEXTAUTH_SECRET
echo     ✓ NEXTAUTH_URL
echo     ✓ NEXT_PUBLIC_APP_URL
echo.

echo ========================================
echo ✅ ALL PRE-DEPLOYMENT CHECKS PASSED!
echo ========================================
echo.
echo Ready to deploy! Run one of these:
echo   1. deploy.bat          (auto push)
echo   2. git push origin main (manual)
echo.
pause
