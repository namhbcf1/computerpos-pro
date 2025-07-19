@echo off
echo ========================================
echo    ComputerPOS Pro - Manual Deploy
echo    Wrangler v4.25.0 Compatible
echo ========================================
echo.

echo [1/4] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Creating deployment package...
cd dist
if exist "..\computerpos-frontend.zip" del "..\computerpos-frontend.zip"
powershell -command "Compress-Archive -Path '.\*' -DestinationPath '..\computerpos-frontend.zip' -Force"
cd ..

echo.
echo [3/4] Opening Cloudflare Pages Dashboard...
start https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend

echo.
echo [4/4] Manual Upload Instructions:
echo ========================================
echo 1. Click "Create deployment" button
echo 2. Drag and drop the file: computerpos-frontend.zip
echo 3. Or click "Select from computer" and choose computerpos-frontend.zip
echo 4. Click "Deploy site"
echo 5. Wait for deployment to complete (1-2 minutes)
echo ========================================
echo.
echo ✅ Build completed successfully!
echo 📦 Package created: computerpos-frontend.zip
echo 🌐 Dashboard opened in browser
echo.
echo After upload, your site will be live at:
echo 📱 https://pos-frontend.pages.dev
echo 🔧 Backend: https://pos-backend-production.bangachieu2.workers.dev
echo.
pause
