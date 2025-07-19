@echo off
echo 🔄 ComputerPOS Pro - Auto Update Wrangler Configuration
echo ======================================================

echo.
echo 📋 This script will automatically update wrangler.toml with real Cloudflare resource IDs
echo.

echo 🔍 Checking PowerShell availability...
powershell -Command "Write-Host 'PowerShell is available'" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PowerShell not available
    echo Please update wrangler.toml manually using the IDs from: get-cloudflare-ids.bat
    pause
    exit /b 1
)

echo ✅ PowerShell available

echo.
echo 🚀 Running auto-update script...
powershell -ExecutionPolicy Bypass -File "auto-update-wrangler.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Auto-update failed
    echo Please update wrangler.toml manually
    pause
    exit /b 1
)

echo.
echo ✅ Auto-update completed successfully!
echo.
echo 📋 Next steps:
echo 1. Review wrangler.toml to ensure all IDs are filled
echo 2. Test deployment: npm run deploy
echo 3. Check c:\Users\ADMIN\Desktop\kho\ttcloudflare+github.md for documentation
echo.
pause
