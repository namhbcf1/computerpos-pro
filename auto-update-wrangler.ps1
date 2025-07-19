# ComputerPOS Pro - Auto Update Wrangler.toml with Real IDs
# PowerShell script to automatically replace placeholders with real resource IDs

Write-Host "🔄 ComputerPOS Pro - Auto Update Wrangler Configuration" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is available
try {
    $wranglerVersion = wrangler --version
    Write-Host "✅ Wrangler CLI found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI not found. Please install: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Getting Cloudflare resource IDs..." -ForegroundColor Yellow

# Get D1 database IDs
Write-Host "💾 Getting D1 database IDs..." -ForegroundColor Blue
$d1Output = wrangler d1 list --json 2>$null
if ($d1Output) {
    $d1Data = $d1Output | ConvertFrom-Json
    $prodDbId = ($d1Data | Where-Object { $_.name -eq "computerpos-pro-db" }).uuid
    $devDbId = ($d1Data | Where-Object { $_.name -eq "computerpos-pro-dev-db" }).uuid
    
    if ($prodDbId) {
        Write-Host "  ✅ Production DB ID: $prodDbId" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Production DB not found. Run: wrangler d1 create computerpos-pro-db" -ForegroundColor Red
    }
    
    if ($devDbId) {
        Write-Host "  ✅ Development DB ID: $devDbId" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Development DB not found. Run: wrangler d1 create computerpos-pro-dev-db" -ForegroundColor Red
    }
}

# Get KV namespace IDs
Write-Host "🗂️ Getting KV namespace IDs..." -ForegroundColor Blue
$kvOutput = wrangler kv:namespace list --json 2>$null
if ($kvOutput) {
    $kvData = $kvOutput | ConvertFrom-Json
    
    # Find KV namespaces
    $cacheKv = $kvData | Where-Object { $_.title -like "*CACHE_KV*" -and $_.title -notlike "*preview*" -and $_.title -notlike "*DEV*" }
    $cacheKvPreview = $kvData | Where-Object { $_.title -like "*CACHE_KV*" -and $_.title -like "*preview*" -and $_.title -notlike "*DEV*" }
    
    $analyticsKv = $kvData | Where-Object { $_.title -like "*ANALYTICS_KV*" -and $_.title -notlike "*preview*" }
    $analyticsKvPreview = $kvData | Where-Object { $_.title -like "*ANALYTICS_KV*" -and $_.title -like "*preview*" }
    
    $rateLimitKv = $kvData | Where-Object { $_.title -like "*RATE_LIMIT_KV*" -and $_.title -notlike "*preview*" }
    $rateLimitKvPreview = $kvData | Where-Object { $_.title -like "*RATE_LIMIT_KV*" -and $_.title -like "*preview*" }
    
    $devCacheKv = $kvData | Where-Object { $_.title -like "*CACHE_KV_DEV*" -and $_.title -notlike "*preview*" }
    $devCacheKvPreview = $kvData | Where-Object { $_.title -like "*CACHE_KV_DEV*" -and $_.title -like "*preview*" }
    
    # Display found IDs
    if ($cacheKv) { Write-Host "  ✅ Cache KV ID: $($cacheKv.id)" -ForegroundColor Green }
    if ($cacheKvPreview) { Write-Host "  ✅ Cache KV Preview ID: $($cacheKvPreview.id)" -ForegroundColor Green }
    if ($analyticsKv) { Write-Host "  ✅ Analytics KV ID: $($analyticsKv.id)" -ForegroundColor Green }
    if ($analyticsKvPreview) { Write-Host "  ✅ Analytics KV Preview ID: $($analyticsKvPreview.id)" -ForegroundColor Green }
    if ($rateLimitKv) { Write-Host "  ✅ Rate Limit KV ID: $($rateLimitKv.id)" -ForegroundColor Green }
    if ($rateLimitKvPreview) { Write-Host "  ✅ Rate Limit KV Preview ID: $($rateLimitKvPreview.id)" -ForegroundColor Green }
    if ($devCacheKv) { Write-Host "  ✅ Dev Cache KV ID: $($devCacheKv.id)" -ForegroundColor Green }
    if ($devCacheKvPreview) { Write-Host "  ✅ Dev Cache KV Preview ID: $($devCacheKvPreview.id)" -ForegroundColor Green }
}

Write-Host ""
Write-Host "📝 Updating wrangler.toml..." -ForegroundColor Yellow

# Read wrangler.toml
$wranglerContent = Get-Content "wrangler.toml" -Raw

# Replace D1 database IDs
if ($prodDbId) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_D1_DATABASE_ID_FROM_WRANGLER_OUTPUT", $prodDbId
    Write-Host "  ✅ Updated production D1 database ID" -ForegroundColor Green
}

if ($devDbId) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_DEV_D1_DATABASE_ID_FROM_WRANGLER_OUTPUT", $devDbId
    Write-Host "  ✅ Updated development D1 database ID" -ForegroundColor Green
}

# Replace KV namespace IDs
if ($cacheKv) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_CACHE_KV_ID_FROM_WRANGLER_OUTPUT", $cacheKv.id
    Write-Host "  ✅ Updated Cache KV ID" -ForegroundColor Green
}

if ($cacheKvPreview) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_CACHE_KV_PREVIEW_ID_FROM_WRANGLER_OUTPUT", $cacheKvPreview.id
    Write-Host "  ✅ Updated Cache KV Preview ID" -ForegroundColor Green
}

if ($analyticsKv) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_ANALYTICS_KV_ID_FROM_WRANGLER_OUTPUT", $analyticsKv.id
    Write-Host "  ✅ Updated Analytics KV ID" -ForegroundColor Green
}

if ($analyticsKvPreview) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_ANALYTICS_KV_PREVIEW_ID_FROM_WRANGLER_OUTPUT", $analyticsKvPreview.id
    Write-Host "  ✅ Updated Analytics KV Preview ID" -ForegroundColor Green
}

if ($rateLimitKv) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_RATE_LIMIT_KV_ID_FROM_WRANGLER_OUTPUT", $rateLimitKv.id
    Write-Host "  ✅ Updated Rate Limit KV ID" -ForegroundColor Green
}

if ($rateLimitKvPreview) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_RATE_LIMIT_KV_PREVIEW_ID_FROM_WRANGLER_OUTPUT", $rateLimitKvPreview.id
    Write-Host "  ✅ Updated Rate Limit KV Preview ID" -ForegroundColor Green
}

if ($devCacheKv) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_DEV_CACHE_KV_ID_FROM_WRANGLER_OUTPUT", $devCacheKv.id
    Write-Host "  ✅ Updated Dev Cache KV ID" -ForegroundColor Green
}

if ($devCacheKvPreview) {
    $wranglerContent = $wranglerContent -replace "REPLACE_WITH_DEV_CACHE_KV_PREVIEW_ID_FROM_WRANGLER_OUTPUT", $devCacheKvPreview.id
    Write-Host "  ✅ Updated Dev Cache KV Preview ID" -ForegroundColor Green
}

# Save updated wrangler.toml
$wranglerContent | Set-Content "wrangler.toml" -NoNewline

Write-Host ""
Write-Host "📊 Updating documentation file..." -ForegroundColor Yellow

# Update the documentation file
$docPath = "c:\Users\ADMIN\Desktop\kho\ttcloudflare+github.md"
if (Test-Path $docPath) {
    $docContent = Get-Content $docPath -Raw
    
    # Update with real IDs
    if ($prodDbId) {
        $docContent = $docContent -replace "\[TO_BE_FILLED_FROM_WRANGLER_OUTPUT\]", $prodDbId
    }
    
    # Add timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $docContent = $docContent -replace "\[TO_BE_FILLED\]", $timestamp
    $docContent = $docContent -replace "\[YOUR_NAME\]", $env:USERNAME
    
    $docContent | Set-Content $docPath -NoNewline
    Write-Host "  ✅ Updated documentation file" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Documentation file not found at $docPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Configuration update complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ wrangler.toml updated with real resource IDs" -ForegroundColor Green
Write-Host "✅ Documentation file updated" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready for deployment!" -ForegroundColor Cyan
Write-Host "Run: npm run deploy" -ForegroundColor Cyan
Write-Host ""
