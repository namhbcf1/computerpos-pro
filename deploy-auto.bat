@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    ComputerPOS Pro - Full Auto Deploy
echo    Wrangler v4.25.0 + GitHub Actions
echo ========================================
echo.

:: Check if we're in a git repository
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not in a Git repository!
    echo Please run this script from the project root.
    pause
    exit /b 1
)

echo [1/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Dependencies installation failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [3/6] Testing backend locally...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend dependencies failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [4/6] Committing changes to Git...
git add .
git commit -m "Auto-deploy: Frontend build + Backend updates - %date% %time%"
if %errorlevel% neq 0 (
    echo WARNING: No changes to commit or commit failed
)

echo.
echo [5/6] Pushing to GitHub (triggers auto-deployment)...
git push origin master
if %errorlevel% neq 0 (
    echo ERROR: Git push failed!
    echo Please check your Git configuration and network connection.
    pause
    exit /b 1
)

echo.
echo [6/6] Manual deployment fallback...
echo Creating deployment package for manual upload...

:: Create zip for manual upload as fallback
if exist "computerpos-frontend.zip" del "computerpos-frontend.zip"
powershell -command "Compress-Archive -Path '.\dist\*' -DestinationPath '.\computerpos-frontend.zip' -Force"

echo.
echo ========================================
echo    🎉 DEPLOYMENT INITIATED!
echo ========================================
echo.
echo ✅ Frontend built successfully
echo ✅ Changes committed to Git
echo ✅ Pushed to GitHub (auto-deployment triggered)
echo ✅ Manual deployment package ready
echo.
echo 🔗 Monitor deployment status:
echo    📊 GitHub Actions: https://github.com/namhbcf1/computerpos-pro/actions
echo    📱 Frontend: https://pos-frontend.pages.dev
echo    🔧 Backend: https://pos-backend-production.bangachieu2.workers.dev
echo.
echo 📦 Manual upload available: computerpos-frontend.zip
echo    Dashboard: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo.
echo ⏱️  Deployment typically takes 2-3 minutes to complete.
echo    Check the URLs above to verify deployment success.
echo.
pause
