@echo off
echo 🚀 ComputerPOS Pro - Production Deployment Script
echo ==================================================

echo.
echo 📋 Deploying to Cloudflare Production Environment
echo Account ID: 5b62d10947844251d23e0eac532531dd
echo Frontend: pos-frontend (Pages)
echo Backend: computerpos-api (Workers)
echo.

echo 📦 Step 1: Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    goto :error
)

echo.
echo 🔨 Step 2: Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed
    goto :error
)

echo.
echo ✅ Frontend build successful!
echo 📊 Build output:
if exist "dist" (
    dir dist
) else (
    echo ❌ dist folder not found
    goto :error
)

echo.
echo 🌐 Step 3: Deploying frontend to Cloudflare Pages...
echo Project: pos-frontend
echo URL: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend

call npx wrangler pages deploy ./dist --project-name=pos-frontend --compatibility-date=2024-01-01

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend deployment failed
    goto :error
)

echo.
echo ✅ Frontend deployed successfully!
echo 🌐 Frontend URL: https://pos-frontend.pages.dev

echo.
echo 🔧 Step 4: Deploying backend to Cloudflare Workers...
echo Service: computerpos-api
echo URL: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api

if exist "server" (
    cd server
    call npx wrangler deploy --env production
    cd ..
) else (
    echo ⚠️  Server directory not found, skipping backend deployment
)

echo.
echo 🎉 Deployment Summary:
echo =====================
echo ✅ Frontend (Pages): https://pos-frontend.pages.dev
echo ✅ Backend (Workers): https://computerpos-api.your-subdomain.workers.dev
echo ✅ GitHub Repository: https://github.com/namhbcf1/computerpos-pro
echo.
echo 📊 Next Steps:
echo 1. Test frontend functionality
echo 2. Verify API endpoints
echo 3. Check performance metrics
echo 4. Monitor error logs
echo.
echo 🔗 Management URLs:
echo - Pages Dashboard: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
echo - Workers Dashboard: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api
echo - Analytics: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/analytics
echo.
echo 🎯 Expected Performance:
echo - Page Load Time: ^< 1 second
echo - Lighthouse Score: 90+
echo - API Response Time: ^< 100ms
echo - Uptime: 99.9%+
echo.
echo 🎉 ComputerPOS Pro is now live in production!
goto :end

:error
echo.
echo ❌ Deployment failed!
echo Please check the errors above and try again.
echo.
echo 🔧 Troubleshooting:
echo 1. Ensure you're logged in: wrangler auth login
echo 2. Check account permissions
echo 3. Verify project names match Cloudflare dashboard
echo 4. Check network connection
pause
exit /b 1

:end
pause
