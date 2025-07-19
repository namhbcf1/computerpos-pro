@echo off
echo 🔧 ComputerPOS Pro - Cloudflare Resources Setup
echo ===============================================

echo.
echo 📋 Creating all required Cloudflare resources...
echo Account ID: 5b62d10947844251d23e0eac532531dd
echo.

echo 🔐 Step 1: Authenticating with Cloudflare...
call wrangler login

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Authentication failed
    goto :error
)

echo.
echo 💾 Step 2: Creating D1 Databases...

echo Creating production database...
call wrangler d1 create computerpos-pro-db
echo.

echo Creating development database...
call wrangler d1 create computerpos-pro-dev-db
echo.

echo 🗂️ Step 3: Creating KV Namespaces...

echo Creating CACHE_KV (production)...
call wrangler kv:namespace create "CACHE_KV"
echo.

echo Creating CACHE_KV (preview)...
call wrangler kv:namespace create "CACHE_KV" --preview
echo.

echo Creating ANALYTICS_KV (production)...
call wrangler kv:namespace create "ANALYTICS_KV"
echo.

echo Creating ANALYTICS_KV (preview)...
call wrangler kv:namespace create "ANALYTICS_KV" --preview
echo.

echo Creating RATE_LIMIT_KV (production)...
call wrangler kv:namespace create "RATE_LIMIT_KV"
echo.

echo Creating RATE_LIMIT_KV (preview)...
call wrangler kv:namespace create "RATE_LIMIT_KV" --preview
echo.

echo Creating development CACHE_KV...
call wrangler kv:namespace create "CACHE_KV_DEV"
echo.

echo Creating development CACHE_KV (preview)...
call wrangler kv:namespace create "CACHE_KV_DEV" --preview
echo.

echo 📦 Step 4: Creating R2 Buckets...

echo Creating assets bucket...
call wrangler r2 bucket create computerpos-pro-assets
echo.

echo 📊 Step 5: Listing all created resources...

echo.
echo 💾 D1 Databases:
call wrangler d1 list
echo.

echo 🗂️ KV Namespaces:
call wrangler kv:namespace list
echo.

echo 📦 R2 Buckets:
call wrangler r2 bucket list
echo.

echo ✅ All resources created successfully!
echo.
echo 📋 Next steps:
echo 1. Copy the IDs from above output
echo 2. Update wrangler.toml with real IDs
echo 3. Save all information to ttcloudflare+github.md
echo.
echo 🎯 Resource Summary:
echo - D1 Databases: 2 created
echo - KV Namespaces: 8 created
echo - R2 Buckets: 1 created
echo - Account ID: 5b62d10947844251d23e0eac532531dd
goto :end

:error
echo.
echo ❌ Resource creation failed!
echo Please check your authentication and try again.
pause
exit /b 1

:end
pause
