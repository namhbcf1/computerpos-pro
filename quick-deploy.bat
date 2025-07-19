@echo off
echo ⚡ ComputerPOS Pro - Quick Deploy
echo =================================

echo.
echo 🎯 Target Environment:
echo Account: 5b62d10947844251d23e0eac532531dd
echo Frontend: pos-frontend.pages.dev
echo Backend: computerpos-api.workers.dev
echo GitHub: github.com/namhbcf1/computerpos-pro
echo.

echo 📦 Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying to Cloudflare Pages...
call npx wrangler pages deploy ./dist --project-name=pos-frontend

echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your site is live at:
echo https://pos-frontend.pages.dev
echo.
echo 📊 Management URLs:
echo - Pages: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo - Workers: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api
echo.
pause
