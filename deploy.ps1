###########################################
#  SunPoya Full Deploy Script (ahmad-zahir)
#  Fix base → Build → Deploy → Git Push
###########################################

Write-Host "Starting deployment..." -ForegroundColor Cyan

# 1. Move to project directory
cd "C:\Users\POYA\Downloads\SunPoya" | Out-Null
Write-Host "Entered project directory." -ForegroundColor Gray

# 2. Ensure vite.config.ts contains correct base
Write-Host "Fixing vite.config.ts base path..." -ForegroundColor Gray
(Get-Content vite.config.ts) `
    -replace 'base:.*', 'base: "/SunPoya/",' |
    Set-Content vite.config.ts

# 3. Build project
Write-Host "Building project with Vite..." -ForegroundColor Yellow
npm run build

# 4. Deploy to GitHub Pages
Write-Host "Deploying build to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

# 5. Git add, commit, push → to ahmad-zahir branch
Write-Host "Sending code changes to GitHub repository (branch: ahmad-zahir)..." -ForegroundColor Yellow
git add .
git commit -m "Auto deploy: fixed vite base, rebuilt & deployed"
git push origin ahmad-zahir

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Your site is live at:" -ForegroundColor Cyan
Write-Host "https://cabirpoya.github.io/SunPoya/" -ForegroundColor Cyan
