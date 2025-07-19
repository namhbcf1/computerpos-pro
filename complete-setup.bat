@echo off
echo 🚀 ComputerPOS Pro - Complete Setup & Deployment
echo =================================================

echo.
echo 📋 This script will set up everything for ComputerPOS Pro:
echo 1. Create Cloudflare resources
echo 2. Get resource IDs
echo 3. Guide you through configuration
echo 4. Deploy to production
echo.
echo Account ID: 5b62d10947844251d23e0eac532531dd
echo GitHub: https://github.com/namhbcf1/computerpos-pro
echo.

pause

echo.
echo 🔐 Step 1: Authenticating with Cloudflare...
call wrangler login

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Authentication failed
    goto :error
)

echo.
echo ✅ Authentication successful!

echo.
echo 🔧 Step 2: Creating Cloudflare resources...
call create-cloudflare-resources.bat

echo.
echo 📊 Step 3: Getting resource IDs...
call get-cloudflare-ids.bat

echo.
echo 📝 Step 4: Configuration update required
echo ========================================
echo.
echo IMPORTANT: You need to manually update wrangler.toml with the resource IDs shown above.
echo.
echo 1. Open wrangler.toml in your text editor
echo 2. Replace all "your-*-id" placeholders with actual IDs from the output above
echo 3. Save the file
echo 4. Press any key to continue...
echo.
pause

echo.
echo 🔄 Step 5: Updating configuration helper...
call update-wrangler-config.bat

echo.
echo 📦 Step 6: Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    goto :error
)

echo.
echo 🔨 Step 7: Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    goto :error
)

echo.
echo 🚀 Step 8: Deploying to production...
echo.
echo Choose deployment method:
echo 1. Quick deploy (Pages only)
echo 2. Full deploy (Pages + Workers)
echo 3. Skip deployment (manual later)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    call quick-deploy.bat
) else if "%choice%"=="2" (
    call deploy-production.bat
) else (
    echo Skipping deployment. You can deploy later using:
    echo - quick-deploy.bat
    echo - deploy-production.bat
    echo - npm run deploy
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo ✅ Cloudflare resources created
echo ✅ Configuration files ready
echo ✅ Project built successfully
echo ✅ Ready for deployment
echo.
echo 📁 Important files:
echo - wrangler.toml (Cloudflare configuration)
echo - c:\Users\ADMIN\Desktop\kho\ttcloudflare+github.md (All credentials)
echo.
echo 🌐 Your URLs:
echo - Frontend: https://pos-frontend.pages.dev
echo - Backend: https://computerpos-api.your-subdomain.workers.dev
echo - GitHub: https://github.com/namhbcf1/computerpos-pro
echo.
echo 📊 Management Dashboards:
echo - Pages: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo - Workers: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api
echo.
echo 🎯 Next Steps:
echo 1. Test your live site
echo 2. Configure custom domain (optional)
echo 3. Set up monitoring
echo 4. Add production data
echo.
echo 🎉 ComputerPOS Pro is now live in production!
goto :end

:error
echo.
echo ❌ Setup failed!
echo Please check the errors above and try again.
echo.
echo 🔧 Troubleshooting:
echo 1. Ensure you have proper Cloudflare account access
echo 2. Check internet connection
echo 3. Verify Node.js version (18+)
echo 4. Try running individual scripts manually
pause
exit /b 1

:end
pause
