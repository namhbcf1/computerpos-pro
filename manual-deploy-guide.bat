@echo off
echo 🌐 ComputerPOS Pro - Manual Deployment Guide
echo ============================================

echo.
echo 📋 Since CLI deployment had issues, here's the manual method:
echo.

echo 📦 Step 1: Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    echo Please fix build errors first
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo 📁 Build output: %CD%\dist

echo.
echo 🌐 Step 2: Manual deployment via browser
echo =======================================
echo.
echo 1. Open your browser and go to:
echo    https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo.
echo 2. Click "Create deployment" or "Upload assets"
echo.
echo 3. Drag the entire "dist" folder to the upload area
echo    Location: %CD%\dist
echo.
echo 4. Click "Deploy site"
echo.
echo 5. Wait 1-2 minutes for deployment to complete
echo.
echo 6. Your site will be live at:
echo    https://pos-frontend.pages.dev
echo.

echo 🚀 Opening browser for you...
start https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend

echo.
echo 📂 Opening dist folder for you...
start explorer "%CD%\dist"

echo.
echo 📋 Quick checklist:
echo ✅ Build completed
echo ✅ Browser opened to Cloudflare Pages
echo ✅ Dist folder opened
echo.
echo 🎯 Next steps:
echo 1. Drag dist folder to browser
echo 2. Click Deploy
echo 3. Wait for completion
echo 4. Test your site!
echo.
echo 🎉 Your site will be live at: https://pos-frontend.pages.dev
echo.
pause
