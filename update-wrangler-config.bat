@echo off
echo 🔄 ComputerPOS Pro - Update Wrangler Configuration
echo ==================================================

echo.
echo 📋 This script will help you update wrangler.toml with real resource IDs
echo.

echo 🔍 Step 1: Getting current resource IDs...
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

echo 📋 Step 2: Manual Update Required
echo ================================
echo.
echo Please copy the IDs from above and update wrangler.toml manually:
echo.
echo 1. Open wrangler.toml in your editor
echo 2. Replace "your-d1-database-id" with actual D1 database ID
echo 3. Replace "your-cache-kv-id" with actual KV namespace IDs
echo 4. Replace "your-analytics-kv-id" with actual KV namespace IDs
echo 5. Replace "your-rate-limit-kv-id" with actual KV namespace IDs
echo 6. Save the file
echo.
echo 📝 Example replacements:
echo.
echo [D1 Databases]
echo database_id = "your-d1-database-id"  ^-^> database_id = "abc123-def456-ghi789"
echo.
echo [KV Namespaces]
echo id = "your-cache-kv-id"  ^-^> id = "abc123def456ghi789"
echo preview_id = "your-cache-kv-preview-id"  ^-^> preview_id = "xyz789uvw456rst123"
echo.
echo 🎯 After updating wrangler.toml:
echo 1. Test deployment: npm run deploy
echo 2. Verify all resources work correctly
echo 3. Update ttcloudflare+github.md with final IDs
echo.
echo 📁 Files to update:
echo - wrangler.toml (resource IDs)
echo - c:\Users\ADMIN\Desktop\kho\ttcloudflare+github.md (documentation)
echo.
pause
