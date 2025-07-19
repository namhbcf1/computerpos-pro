@echo off
echo 🧪 ComputerPOS Pro - Build Test Script
echo ======================================

echo.
echo 📋 Checking project structure...

if exist "src\pages\index.astro" (
    echo ✅ Homepage exists
) else (
    echo ❌ Homepage missing
    goto :error
)

if exist "astro.config.mjs" (
    echo ✅ Astro config exists
) else (
    echo ❌ Astro config missing
    goto :error
)

if exist "package.json" (
    echo ✅ Package.json exists
) else (
    echo ❌ Package.json missing
    goto :error
)

echo.
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install failed
    goto :error
)

echo.
echo 🔍 Running type check...
call npm run type-check

echo.
echo 🔨 Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please check the errors above.
    goto :error
)

echo.
echo ✅ Build successful!
echo.
echo 📊 Build output:
if exist "dist" (
    dir dist /s
    echo.
    echo 📏 Build size:
    for /f %%i in ('powershell -command "(Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum / 1MB"') do echo Build size: %%i MB
) else (
    echo ❌ dist folder not found
    goto :error
)

echo.
echo 🎯 Build verification:
if exist "dist\index.html" (
    echo ✅ Homepage HTML generated
) else (
    echo ❌ Homepage HTML missing
    goto :error
)

if exist "dist\_astro" (
    echo ✅ Astro assets generated
) else (
    echo ⚠️  Astro assets folder not found
)

echo.
echo 🌐 Ready for deployment!
echo.
echo 📋 Next steps:
echo 1. Push to GitHub: git add . && git commit -m "Ready for deployment" && git push
echo 2. Go to Cloudflare Pages: https://pages.cloudflare.com/
echo 3. Connect GitHub repository
echo 4. Set build command: npm run build
echo 5. Set output directory: dist
echo 6. Deploy!
echo.
echo 🎉 ComputerPOS Pro build test completed successfully!
goto :end

:error
echo.
echo ❌ Build test failed!
echo Please fix the errors above before deploying.
pause
exit /b 1

:end
pause
