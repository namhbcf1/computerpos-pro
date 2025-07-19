@echo off
echo 🚀 ComputerPOS Pro - Build and Deploy
echo =====================================

cd /d "C:\Users\Administrator\Desktop\computerpos-pro"

echo.
echo 📦 Installing dependencies...
npm install

echo.
echo 🔨 Building project...
npm run build

echo.
echo ✅ Build complete!
echo.
echo 📁 Build output location: %CD%\dist
echo.
echo 🌐 Manual Deployment Steps:
echo ===========================
echo.
echo 1. Go to: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo.
echo 2. Click "Create deployment" or "Upload assets"
echo.
echo 3. Drag the "dist" folder to upload area
echo.
echo 4. Click "Deploy site"
echo.
echo 5. Your site will be live at: https://pos-frontend.pages.dev
echo.

echo 🚀 Opening browser and folder for you...
start https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
start explorer "%CD%\dist"

echo.
echo 🎉 Ready for deployment!
pause
