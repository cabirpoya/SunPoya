###############################################
# AUTO FIX + AUTO CREATE openrouterService.ts
# FULL AUTO DEPLOY FOR SunPoya
###############################################

Write-Host "`n=== Starting Automatic Fix ===" -ForegroundColor Cyan

# 1) Move to project directory
cd "C:\Users\POYA\Downloads\SunPoya" | Out-Null

# 2) Ensure services folder exists
if (-Not (Test-Path "services")) {
    Write-Host "Creating services folder..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "services" | Out-Null
}

# 3) Create correct openrouterService.ts with exact name
Write-Host "Creating openrouterService.ts..." -ForegroundColor Yellow

@'
export async function generateSongFromPoem(poem: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Missing OpenRouter API Key");
    return null;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI music composer. Create a musical composition from the poem." },
        { role: "user", content: poem }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function generatePerformanceAudio(poem: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Missing OpenRouter API Key");
    return null;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-audio",
      messages: [
        { role: "system", content: "You are an AI musician. Generate audio performance for the poem." },
        { role: "user", content: poem }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}
'@ | Set-Content "services\openrouterService.ts" -Encoding UTF8


# 4) Fix App.tsx import
Write-Host "Fixing App.tsx import..." -ForegroundColor Yellow

(Get-Content "App.tsx") `
    -replace './services/geminiService', './services/openrouterService' |
    Set-Content "App.tsx"

# 5) Rebuild project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

# 6) Deploy to gh-pages
Write-Host "Deploying to GitHub Pages..." -ForegroundColor Yellow
npm run deploy

# 7) Push changes to branch
Write-Host "Pushing changes to GitHub branch ahmad-zahir..." -ForegroundColor Yellow
git add .
git commit -m "Auto fixed services + added openrouterService.ts + deployed"
git push origin ahmad-zahir

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Live URL: https://cabirpoya.github.io/SunPoya/" -ForegroundColor Cyan
