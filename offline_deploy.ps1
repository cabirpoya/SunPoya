###############################################
# OFFLINE DEPLOY SCRIPT (NO API REQUIRED)
# SunPoya - Full Automatic Offline Mode
###############################################

Write-Host "`n=== Starting OFFLINE MODE deployment ===" -ForegroundColor Cyan

# 1) Move to project directory
cd "C:\Users\POYA\Downloads\SunPoya" | Out-Null

# 2) Ensure services folder exists
if (-Not (Test-Path "services")) {
    Write-Host "Creating services folder..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "services" | Out-Null
}

# 3) Create offlineService.ts
Write-Host "Creating offlineService.ts..." -ForegroundColor Yellow

@'
export async function generateSongFromPoem(poem: string) {
  console.warn("OFFLINE MODE: No real AI. Returning sample text.");
  
  return `
🎵 DEMO OUTPUT (NO AI)
Poem received:
"${poem}"

This is a demo composition generated offline.
  `;
}

export async function generatePerformanceAudio(poem: string) {
  console.warn("OFFLINE MODE: No real AI audio. Returning sample audio URL.");

  return "/demo-audio.mp3"; 
}
'@ | Set-Content "services\offlineService.ts" -Encoding UTF8

# 4) Fix App.tsx import → replace any service with offlineService
Write-Host "Fixing App.tsx import to use offlineService..." -ForegroundColor Yellow

(Get-Content "App.tsx") `
    -replace './services/geminiService', './services/offlineService' `
    -replace './services/openrouterService', './services/offlineService' `
    -replace './services/openRouteServices', './services/offlineService' |
    Set-Content "App.tsx"

# 5) Ensure demo audio exists
Write-Host "Checking demo audio..." -ForegroundColor Gray
if (-Not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

if (-Not (Test-Path "public/demo-audio.mp3")) {
    Write-Host "Creating empty demo-audio.mp3 placeholder..." -ForegroundColor Yellow
    Set-Content "public/demo-audio.mp3" -Value "" -Encoding Byte
}

# 6) Build project
Write-Host "Building project in OFFLINE MODE..." -ForegroundColor Yellow
npm run build

# 7) Deploy to GitHub Pages
Write-Host "Deploying OFFLINE build to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

# 8) Push changes to your branch
Write-Host "Pushing changes to branch ahmad-zahir..." -ForegroundColor Yellow
git add .
git commit -m "Offline mode activated: removed API dependency + demo outputs"
git push origin ahmad-zahir

Write-Host "`n=== OFFLINE DEPLOY COMPLETE ===" -ForegroundColor Green
Write-Host "Your offline site is live at:" -ForegroundColor Cyan
Write-Host "https://cabirpoya.github.io/SunPoya/" -ForegroundColor Cyan
