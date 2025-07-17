@echo off
REM 🚀 ComputerPOS Pro - Auto Deploy Script for Windows
REM Tự động deploy lên Cloudflare Workers và Pages

setlocal enabledelayedexpansion

REM Project configuration
set PROJECT_NAME=computerpos-pro
set WORKERS_NAME=computerpos-pro-api
set PAGES_NAME=computerpos-pro
set DB_NAME=computerpos-pro-db

echo 🚀 Starting ComputerPOS Pro Deployment...
echo ==================================

REM Function to log with timestamp
set "timestamp="
for /f "tokens=1-3 delims=/: " %%a in ('date /t') do set "timestamp=%%c-%%a-%%b"
for /f "tokens=1-2 delims=/: " %%a in ('time /t') do set "timestamp=!timestamp! %%a:%%b"

echo [%timestamp%] 📋 Checking prerequisites...

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [%timestamp%] ❌ Wrangler CLI not found. Installing...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo [%timestamp%] ❌ Failed to install Wrangler CLI
        pause
        exit /b 1
    )
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [%timestamp%] ❌ npm not found. Please install Node.js
    pause
    exit /b 1
)

echo [%timestamp%] ✅ Prerequisites check passed

REM Check if user is logged in to Cloudflare
echo [%timestamp%] 🔐 Checking Cloudflare authentication...
wrangler whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [%timestamp%] ❌ Not logged in to Cloudflare. Please run: wrangler login
    pause
    exit /b 1
)

echo [%timestamp%] ✅ Authenticated with Cloudflare

REM Install dependencies
echo [%timestamp%] 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo [%timestamp%] ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create D1 Database if needed
echo [%timestamp%] 🗄️ Setting up database...

REM Check if database exists (simplified check)
wrangler d1 list | findstr /C:"%DB_NAME%" >nul
if %errorlevel% neq 0 (
    echo [%timestamp%] Creating D1 database: %DB_NAME%
    wrangler d1 create %DB_NAME%
    if %errorlevel% neq 0 (
        echo [%timestamp%] ❌ Failed to create database
        pause
        exit /b 1
    )
    echo [%timestamp%] ✅ Database created
    echo [%timestamp%] ⚠️ Please update wrangler.toml with the database_id from the output above
    pause
) else (
    echo [%timestamp%] ✅ Database %DB_NAME% already exists
)

REM Import database schema and seed data
echo [%timestamp%] 📊 Importing database schema and seed data...
if exist ".\schemas\schema.sql" (
    wrangler d1 execute %DB_NAME% --file=.\schemas\schema.sql --env=production
    if %errorlevel% equ 0 (
        echo [%timestamp%] ✅ Schema imported
    ) else (
        echo [%timestamp%] ⚠️ Failed to import schema
    )
) else (
    echo [%timestamp%] ⚠️ Schema file not found at .\schemas\schema.sql
)

if exist ".\schemas\seed.sql" (
    wrangler d1 execute %DB_NAME% --file=.\schemas\seed.sql --env=production
    if %errorlevel% equ 0 (
        echo [%timestamp%] ✅ Seed data imported
    ) else (
        echo [%timestamp%] ⚠️ Failed to import seed data
    )
) else (
    echo [%timestamp%] ⚠️ Seed file not found at .\schemas\seed.sql
)

REM Build the project
echo [%timestamp%] 🔨 Building project...
npm run build
if %errorlevel% neq 0 (
    echo [%timestamp%] ❌ Build failed
    pause
    exit /b 1
)

echo [%timestamp%] ✅ Build completed

REM Deploy Workers API
echo [%timestamp%] ⚡ Deploying Workers API...
if exist ".\workers\api.js" (
    wrangler deploy workers\api.js --name=%WORKERS_NAME% --env=production
    if %errorlevel% equ 0 (
        echo [%timestamp%] ✅ Workers API deployed successfully
    ) else (
        echo [%timestamp%] ❌ Failed to deploy Workers API
        pause
        exit /b 1
    )
) else (
    echo [%timestamp%] ❌ Workers API file not found at .\workers\api.js
    pause
    exit /b 1
)

REM Create Pages project if it doesn't exist
echo [%timestamp%] 🌐 Setting up Cloudflare Pages...
wrangler pages project list | findstr /C:"%PAGES_NAME%" >nul
if %errorlevel% neq 0 (
    echo [%timestamp%] Creating Pages project: %PAGES_NAME%
    wrangler pages project create %PAGES_NAME%
    if %errorlevel% equ 0 (
        echo [%timestamp%] ✅ Pages project created
    ) else (
        echo [%timestamp%] ❌ Failed to create Pages project
        pause
        exit /b 1
    )
) else (
    echo [%timestamp%] ✅ Pages project %PAGES_NAME% already exists
)

REM Deploy to Cloudflare Pages
echo [%timestamp%] 🌐 Deploying to Cloudflare Pages...
if exist ".\dist" (
    wrangler pages deploy dist --project-name=%PAGES_NAME%
    if %errorlevel% equ 0 (
        echo [%timestamp%] ✅ Pages deployed successfully
    ) else (
        echo [%timestamp%] ❌ Failed to deploy Pages
        pause
        exit /b 1
    )
) else (
    echo [%timestamp%] ❌ Build directory .\dist not found
    pause
    exit /b 1
)

REM Summary
echo.
echo ==================================
echo [%timestamp%] 🎉 Deployment completed successfully!
echo.
echo 📊 Deployment Summary:
echo Frontend URL: https://%PAGES_NAME%.pages.dev
echo API URL: https://%WORKERS_NAME%.workers.dev
echo Database: %DB_NAME%
echo.
echo 📋 Next Steps:
echo 1. Update API_BASE_URL in src\lib\api\client.ts if needed
echo 2. Configure custom domain (optional)
echo 3. Set up monitoring and alerts
echo 4. Test all functionality
echo.
echo 💡 Useful Commands:
echo Monitor logs: wrangler tail %WORKERS_NAME% --env=production
echo Check DB: wrangler d1 execute %DB_NAME% --command="SELECT COUNT(*) FROM products;" --env=production
echo Pages logs: wrangler pages deployment list --project-name=%PAGES_NAME%
echo.

REM Ask if user wants to open URLs
set /p "choice=Open URLs in browser? (y/N): "
if /i "%choice%"=="y" (
    start https://%PAGES_NAME%.pages.dev
    start https://%WORKERS_NAME%.workers.dev
)

echo [%timestamp%] 🚀 ComputerPOS Pro deployment complete!
pause