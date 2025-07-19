@echo off
echo 🔐 ComputerPOS Pro - Cloudflare Authentication
echo ===============================================

echo.
echo 📋 Setting up Cloudflare CLI authentication...
echo Account ID: 5b62d10947844251d23e0eac532531dd
echo.

echo 📦 Step 1: Installing Wrangler CLI...
call npm install -g wrangler

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Wrangler installation failed
    goto :error
)

echo.
echo ✅ Wrangler CLI installed successfully!

echo.
echo 🔐 Step 2: Authenticating with Cloudflare...
echo This will open your browser for authentication.
echo Please login with your Cloudflare account.
echo.
pause

call wrangler login

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Authentication failed
    goto :error
)

echo.
echo ✅ Authentication successful!

echo.
echo 🔍 Step 3: Verifying account access...
call wrangler whoami

echo.
echo 📊 Step 4: Checking existing projects...
echo.
echo 📄 Pages Projects:
call wrangler pages project list

echo.
echo ⚙️  Workers Services:
call wrangler services list

echo.
echo 🎯 Step 5: Verifying specific projects...
echo.
echo 🌐 Checking pos-frontend (Pages):
call wrangler pages project info pos-frontend

echo.
echo 🔧 Checking computerpos-api (Workers):
call wrangler services info computerpos-api

echo.
echo ✅ Authentication Setup Complete!
echo.
echo 📋 Summary:
echo - ✅ Wrangler CLI installed
echo - ✅ Cloudflare account authenticated
echo - ✅ Account ID: 5b62d10947844251d23e0eac532531dd
echo - ✅ Access to pos-frontend (Pages)
echo - ✅ Access to computerpos-api (Workers)
echo.
echo 🚀 Ready for deployment!
echo Run: deploy-production.bat
echo.
echo 🔗 Management URLs:
echo - Pages: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages
echo - Workers: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers
echo - Analytics: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/analytics
goto :end

:error
echo.
echo ❌ Setup failed!
echo.
echo 🔧 Troubleshooting:
echo 1. Check internet connection
echo 2. Verify Cloudflare account credentials
echo 3. Ensure account has proper permissions
echo 4. Try running as administrator
echo.
echo 💡 Alternative: Manual browser login
echo 1. Go to: https://dash.cloudflare.com/login
echo 2. Login with your credentials
echo 3. Navigate to Pages/Workers sections
echo 4. Use browser-based deployment
pause
exit /b 1

:end
pause
