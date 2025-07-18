# ComputerPOS Pro - Force Production Deployment Script

Write-Host "🚀 ComputerPOS Pro - Force Production Deployment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Step 1: Build frontend
Write-Host "📦 Building React app..." -ForegroundColor Yellow
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy with production settings
Write-Host "🚀 Deploying to production..." -ForegroundColor Yellow
$deployOutput = wrangler pages deploy build --project-name=pos-frontend --commit-dirty=true --commit-message="Production deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    
    # Extract URLs from output
    $previewUrl = ($deployOutput | Select-String "https://(.+)\.pos-frontend-e1q\.pages\.dev").Matches[0].Value
    $aliasUrl = ($deployOutput | Select-String "https://(.+)\.pos-frontend-e1q\.pages\.dev").Matches[1].Value
    
    if ($previewUrl) {
        Write-Host "🌐 Preview URL: $previewUrl" -ForegroundColor Cyan
    }
    if ($aliasUrl) {
        Write-Host "🌐 Alias URL: $aliasUrl" -ForegroundColor Cyan
    }
    
    Write-Host "🎯 Main Domain: https://pos-frontend-e1q.pages.dev" -ForegroundColor Green
    
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $deployOutput -ForegroundColor Red
    exit 1
}

# Step 3: Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://pos-frontend-e1q.pages.dev" -Method HEAD -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Main domain is accessible!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Main domain returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Main domain test failed, but deployment completed" -ForegroundColor Yellow
}

# Step 4: Test API connection
Write-Host "🔗 Testing API connection..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-RestMethod -Uri "https://8d695b6e-computerpos-api.bangachieu2.workers.dev" -Method GET -TimeoutSec 10
    if ($apiResponse.status -eq "healthy") {
        Write-Host "✅ API is healthy!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API status: $($apiResponse.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  API test failed" -ForegroundColor Yellow
}

Set-Location ..

# Summary
Write-Host "" -ForegroundColor White
Write-Host "🎉 PRODUCTION DEPLOYMENT COMPLETED!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host "🌐 Frontend: https://pos-frontend-e1q.pages.dev" -ForegroundColor Cyan
Write-Host "🔧 Backend: https://8d695b6e-computerpos-api.bangachieu2.workers.dev" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "✅ Ready for production use!" -ForegroundColor Green

# Open browser to main domain
Write-Host "🌐 Opening main domain in browser..." -ForegroundColor Yellow
Start-Process "https://pos-frontend-e1q.pages.dev"
