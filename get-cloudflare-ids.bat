@echo off
echo 📊 ComputerPOS Pro - Get Cloudflare Resource IDs
echo ================================================

echo.
echo 🔍 Retrieving all Cloudflare resource IDs...
echo Account ID: 5b62d10947844251d23e0eac532531dd
echo.

echo 💾 D1 Database IDs:
echo ==================
call wrangler d1 list
echo.

echo 🗂️ KV Namespace IDs:
echo ===================
call wrangler kv:namespace list
echo.

echo 📦 R2 Bucket Information:
echo =========================
call wrangler r2 bucket list
echo.

echo ⚙️ Workers Services:
echo ===================
call wrangler services list
echo.

echo 🌐 Pages Projects:
echo ==================
call wrangler pages project list
echo.

echo 📋 Copy these IDs to update wrangler.toml:
echo ==========================================
echo.
echo [D1 Databases]
echo - computerpos-pro-db: [COPY ID FROM ABOVE]
echo - computerpos-pro-dev-db: [COPY ID FROM ABOVE]
echo.
echo [KV Namespaces]
echo - CACHE_KV (prod): [COPY ID FROM ABOVE]
echo - CACHE_KV (preview): [COPY ID FROM ABOVE]
echo - ANALYTICS_KV (prod): [COPY ID FROM ABOVE]
echo - ANALYTICS_KV (preview): [COPY ID FROM ABOVE]
echo - RATE_LIMIT_KV (prod): [COPY ID FROM ABOVE]
echo - RATE_LIMIT_KV (preview): [COPY ID FROM ABOVE]
echo - CACHE_KV_DEV (prod): [COPY ID FROM ABOVE]
echo - CACHE_KV_DEV (preview): [COPY ID FROM ABOVE]
echo.
echo [R2 Buckets]
echo - computerpos-pro-assets: [CREATED]
echo.
echo [GitHub Repository]
echo - URL: https://github.com/namhbcf1/computerpos-pro
echo - Clone URL: git@github.com:namhbcf1/computerpos-pro.git
echo.
echo 🎯 Save all this information to:
echo c:\Users\ADMIN\Desktop\kho\ttcloudflare+github.md
echo.
pause
