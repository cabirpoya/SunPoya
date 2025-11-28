###############################################
# SunPoya Final Auto-Deploy (GitHub Pages FIXED)
###############################################

Write-Host "Starting FINAL deployment..." -ForegroundColor Cyan

# 1. Go to project directory
cd "C:\Users\POYA\Downloads\SunPoya" | Out-Null
Write-Host "Project directory OK." -ForegroundColor Gray

# 2. Fix Vite base path for GitHub Pages
Write-Host "Fixing Vite base path..." -ForegroundColor Gray
(Get-Content vite.config.ts) `
    -replace "base: ''", "base: '/SunPoya/'" |
    Set-Content vite.config.ts

# 3. Fix index.html - correct asset paths
Write-Host "Fixing index.html paths..." -ForegroundColor Gray
(Get-Content dist/index.html) `
    -replace 'href="/', 'href="/SunPoya/' `
    -replace 'src="/', 'src="/SunPoya/' |
    Set-Content dist/index.html

# 4. Rebuild
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

# 5. Deployment
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

# 6. Git commit & push
Write-Host "Pushing changes to GitHub (branch ahmad-zahir)..." -ForegroundColor Yellow
git add .
git commit -m "Final deploy: fixed Vite base path + GitHub Pages asset paths"
git push origin ahmad-zahir

Write-Host "`nFINISHED!" -ForegroundColor Green
Write-Host "Live URL:"
Write-Host "https://cabirpoya.github.io/SunPoya/" -ForegroundColor Cyan
