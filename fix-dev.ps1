# fix-dev.ps1 - Fix Next.js Development Issues
Write-Host "🔧 Nexus Revive - Development Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running dev servers
Write-Host "⏹️  Stopping any running dev servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*NexusRevive*"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Clear Next.js cache
Write-Host "🗑️  Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✓ Removed .next folder" -ForegroundColor Green
}

# Clear Node modules cache
Write-Host "🗑️  Clearing node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force
    Write-Host "   ✓ Removed node_modules cache" -ForegroundColor Green
}

# Clear TypeScript build info
if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item -Path "tsconfig.tsbuildinfo" -Force
    Write-Host "   ✓ Removed TypeScript build cache" -ForegroundColor Green
}

# Regenerate Prisma Client
Write-Host "🔄 Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "   ✗ Prisma generation failed" -ForegroundColor Red
}

# Push database schema
Write-Host "🗄️  Pushing database schema..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Database schema synced" -ForegroundColor Green
} else {
    Write-Host "   ✗ Database push failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Fix complete! Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Server will start at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   (or http://localhost:3001 if port 3000 is busy)" -ForegroundColor Gray
Write-Host ""

# Start dev server
npm run dev
