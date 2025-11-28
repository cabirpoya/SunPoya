###########################################
#  SunPoya Full Deploy Script
#  Fix paths → Build → Deploy → Git Push
###########################################

Write-Host "Starting deployment..." -ForegroundColor Cyan

# 1. Move to project directory
cd "C:\Users\POYA\Downloads\SunPoya" | Out-Null
Write-Host "Entered project directory." -ForegroundColor Gray

# 2. FIX CSS PATH (remove leading slash)
Write-Host "Fixing index.html stylesheet path..." -ForegroundColor Gray
(Get-Content index.html) `
    -replace 'href="/index.css"', 'href="./index.css"' |
    Set-Content index.html

# 3. FIX text-size-adjust warning in CSS (if file exists)
if (Test-Path "./index.css") {
    Write-Host "Adding text-size-adjust fallback to index.css..." -ForegroundColor Gray
    $css = Get-Content "./index.css"
    if ($css -match '-webkit-text-size-adjust') {
        $updatedCss = $css -replace '-webkit-text-size-adjust:\s*100%;', "-webkit-text-size-adjust: 100%;`r`ntext-size-adjust: 100%;"
        Set-Content "./index.css" $updatedCss
    }
}

# 4. Build project
Write-Host "Building project with Vite..." -ForegroundColor Yellow
npm run build

# 5. Deploy to GitHub Pages
Write-Host "Deploying build to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

# 6. Git add, commit, push
Write-Host "Sending code changes to GitHub repository..." -ForegroundColor Yellow
git add .
git commit -m "Auto deploy: fixed paths, css warnings, updated build"
git push origin main

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Your site is live at:"
Write-Host "https://cabirpoya.github.io/SunPoya/" -ForegroundColor Cyan
