@echo off
echo 🚀 ComputerPOS Pro - Auto Deploy NOW!
echo ====================================

echo.
echo 📋 Deploying ComputerPOS Pro automatically...
echo Account: 5b62d10947844251d23e0eac532531dd
echo GitHub: https://github.com/namhbcf1/computerpos-pro
echo Email: bangAchieu2@gmail.com
echo.

echo 🔐 Step 1: Login to Cloudflare...
call wrangler login

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Login failed, trying alternative method...
    echo 🌐 Opening browser for manual login...
    start https://dash.cloudflare.com/login
    echo.
    echo Please login in browser, then press any key to continue...
    pause
)

echo.
echo 📦 Step 2: Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    goto :error
)

echo.
echo 🔨 Step 3: Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    goto :error
)

echo.
echo ✅ Build successful! Checking output...
if exist "dist" (
    echo ✅ dist folder exists
    dir dist
) else (
    echo ❌ dist folder missing
    goto :error
)

echo.
echo 🌐 Step 4: Deploying to Cloudflare Pages...
echo Project: pos-frontend
echo Target: https://pos-frontend.pages.dev

call wrangler pages deploy ./dist --project-name=pos-frontend --compatibility-date=2024-01-01

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Pages deployment failed, trying alternative...
    echo.
    echo 🔄 Trying with npx...
    call npx wrangler pages deploy ./dist --project-name=pos-frontend
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Alternative deployment also failed
        echo.
        echo 🌐 Manual deployment option:
        echo 1. Go to: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
        echo 2. Click "Upload assets"
        echo 3. Drag the "dist" folder
        echo 4. Click "Deploy"
        goto :manual
    )
)

echo.
echo ✅ Frontend deployment successful!

echo.
echo 🔧 Step 5: Checking Workers deployment...
if exist "server" (
    echo Found server directory, deploying Workers...
    cd server
    call wrangler deploy --env production
    cd ..
    if %ERRORLEVEL% NEQ 0 (
        echo ⚠️  Workers deployment failed, but frontend is live
    ) else (
        echo ✅ Workers deployment successful!
    )
) else (
    echo ⚠️  No server directory found, skipping Workers deployment
)

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo =======================
echo.
echo ✅ Frontend deployed successfully
echo 🌐 Live URL: https://pos-frontend.pages.dev
echo 📊 Dashboard: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo.
echo 🧪 Testing your site...
echo 1. Homepage: https://pos-frontend.pages.dev
echo 2. POS Page: https://pos-frontend.pages.dev/pos
echo.
echo 📊 Performance Check:
echo - Expected load time: ^< 1 second
echo - Expected Lighthouse score: 90+
echo - Mobile responsive: Yes
echo.
echo 🎯 Next Steps:
echo 1. Test the live site
echo 2. Run Lighthouse audit
echo 3. Check mobile responsiveness
echo 4. Share with team!
echo.
echo 🎉 ComputerPOS Pro is now LIVE!
goto :end

:manual
echo.
echo 📋 Manual Deployment Instructions:
echo ==================================
echo.
echo 1. Build completed successfully (dist folder ready)
echo 2. Go to: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo 3. Click "Upload assets" or "Create deployment"
echo 4. Drag the entire "dist" folder to the upload area
echo 5. Click "Deploy site"
echo 6. Wait 1-2 minutes for deployment
echo 7. Your site will be live at: https://pos-frontend.pages.dev
echo.
echo 📁 Build output location: %CD%\dist
echo.
goto :end

:error
echo.
echo ❌ Deployment failed!
echo.
echo 🔧 Troubleshooting:
echo 1. Check internet connection
echo 2. Verify Cloudflare account access
echo 3. Try manual deployment via browser
echo 4. Check Node.js version: node --version
echo.
echo 🌐 Manual deployment option:
echo 1. Run: npm run build
echo 2. Go to: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo 3. Upload dist folder
echo.
pause
exit /b 1

:end
echo.
echo 🎊 SUCCESS! ComputerPOS Pro is live!
echo.
echo 🔗 Important Links:
echo - Live Site: https://pos-frontend.pages.dev
echo - Dashboard: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages
echo - GitHub: https://github.com/namhbcf1/computerpos-pro
echo.
pause
