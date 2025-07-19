@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    ComputerPOS Pro - Quick GitHub Upload
echo ========================================
echo.

:: Get current timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%DD%/%MM%/%YYYY% %HH%:%Min%:%Sec%"

:: Quick commit and push
echo [1/3] Adding all changes...
git add .

echo.
echo [2/3] Creating commit...
git commit -m "Auto-update: %timestamp% - Latest changes"

echo.
echo [3/3] Pushing to GitHub...
git push origin master

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS: Code uploaded to GitHub!
    echo 🔗 Repository: https://github.com/namhbcf1/computerpos-pro
    echo 📊 Actions: https://github.com/namhbcf1/computerpos-pro/actions
) else (
    echo.
    echo ❌ ERROR: Upload failed!
    echo Please check your internet connection and Git configuration.
)

echo.
pause
