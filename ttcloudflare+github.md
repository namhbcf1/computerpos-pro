# 🔧 ComputerPOS Pro - Cloudflare & GitHub Configuration

## 📊 CLOUDFLARE ACCOUNT INFORMATION

### Account Details
- **Account ID**: `5b62d10947844251d23e0eac532531dd`
- **Account Email**: [bangAchieu2@gmail.com]
- **Dashboard URL**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd

## 🌐 CLOUDFLARE PAGES

### Frontend Project
- **Project Name**: `pos-frontend`
- **Dashboard URL**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend
- **Live URL**: https://pos-frontend.pages.dev
- **Custom Domain**: [TO_BE_CONFIGURED]

### Build Configuration
```
Build command: npm run build
Build output directory: dist
Root directory: (empty)
Node.js version: 18
Environment variables:
- NODE_VERSION=18
- ENVIRONMENT=production
```

## ⚙️ CLOUDFLARE WORKERS

### Backend Service
- **Service Name**: `computerpos-api`
- **Dashboard URL**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api
- **Metrics URL**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api/production/metrics
- **Live URL**: https://computerpos-api.[YOUR_SUBDOMAIN].workers.dev

## 💾 CLOUDFLARE D1 DATABASES

### Production Database
- **Name**: `computerpos-pro-db`
- **Database ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Binding**: `DB`

### Development Database
- **Name**: `computerpos-pro-dev-db`
- **Database ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Binding**: `DB`

### Database Commands
```bash
# List databases
wrangler d1 list

# Execute SQL
wrangler d1 execute computerpos-pro-db --command="SELECT 1"

# Import schema
wrangler d1 execute computerpos-pro-db --file=./schema.sql
```

## 🗂️ CLOUDFLARE KV NAMESPACES

### Cache KV (Production)
- **Name**: `CACHE_KV`
- **Namespace ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Preview ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Binding**: `CACHE_KV`

### Analytics KV (Production)
- **Name**: `ANALYTICS_KV`
- **Namespace ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Preview ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Binding**: `ANALYTICS_KV`

### Rate Limit KV (Production)
- **Name**: `RATE_LIMIT_KV`
- **Namespace ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Preview ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Binding**: `RATE_LIMIT_KV`

### Cache KV (Development)
- **Name**: `CACHE_KV_DEV`
- **Namespace ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Preview ID**: `[TO_BE_FILLED_FROM_WRANGLER_OUTPUT]`
- **Binding**: `CACHE_KV`

### KV Commands
```bash
# List namespaces
wrangler kv:namespace list

# Put value
wrangler kv:key put --binding=CACHE_KV "key" "value"

# Get value
wrangler kv:key get --binding=CACHE_KV "key"

# List keys
wrangler kv:key list --binding=CACHE_KV
```

## 📦 CLOUDFLARE R2 STORAGE

### Assets Bucket
- **Bucket Name**: `computerpos-pro-assets`
- **Binding**: `ASSETS_BUCKET`
- **Purpose**: File uploads, images, documents

### R2 Commands
```bash
# List buckets
wrangler r2 bucket list

# Upload file
wrangler r2 object put computerpos-pro-assets/file.jpg --file=./file.jpg

# Download file
wrangler r2 object get computerpos-pro-assets/file.jpg --file=./downloaded.jpg

# List objects
wrangler r2 object list computerpos-pro-assets
```

## 🤖 CLOUDFLARE AI

### AI Configuration
- **Binding**: `AI`
- **Models Available**: 
  - Text Generation: @cf/meta/llama-2-7b-chat-int8
  - Text Embeddings: @cf/baai/bge-base-en-v1.5
  - Image Classification: @cf/microsoft/resnet-50

### AI Commands
```bash
# List available models
wrangler ai models list

# Run inference
wrangler ai run @cf/meta/llama-2-7b-chat-int8 --text="Hello"
```

## 🐙 GITHUB REPOSITORY

### Repository Information
- **Repository Name**: `computerpos-pro`
- **Owner**: `namhbcf1`
- **Full URL**: https://github.com/namhbcf1/computerpos-pro
- **Clone URL (HTTPS)**: https://github.com/namhbcf1/computerpos-pro.git
- **Clone URL (SSH)**: git@github.com:namhbcf1/computerpos-pro.git

### Repository Settings
- **Visibility**: Public
- **Default Branch**: `main`
- **Description**: Phần Mềm Quản Lý Cửa Hàng Máy Tính Hàng Đầu Việt Nam
- **Topics**: pos, vietnam, computer-hardware, astro, cloudflare

### GitHub Actions
- **Workflow File**: `.github/workflows/deploy.yml`
- **Triggers**: Push to main, Pull requests
- **Secrets Required**:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

### Branch Protection Rules
- **Protected Branch**: `main`
- **Require status checks**: ✅
- **Require review**: ✅
- **Restrict pushes**: ✅

## 🔐 SECRETS & ENVIRONMENT VARIABLES

### Cloudflare API Token
- **Token Name**: `ComputerPOS-Pro-Deploy`
- **Permissions**: 
  - Zone:Zone Settings:Edit
  - Zone:Zone:Read
  - Account:Cloudflare Pages:Edit
  - Account:Account Settings:Read
- **Account Resources**: Include - 5b62d10947844251d23e0eac532531dd
- **Zone Resources**: Include - All zones

### GitHub Secrets
```
CLOUDFLARE_API_TOKEN=[YOUR_API_TOKEN]
CLOUDFLARE_ACCOUNT_ID=5b62d10947844251d23e0eac532531dd
```

### Environment Variables (Production)
```
ENVIRONMENT=production
APP_NAME=ComputerPOS Pro
APP_VERSION=2.0.0
APP_URL=https://computerpos.pro
NODE_VERSION=18
```

## 🚀 DEPLOYMENT COMMANDS

### Quick Deploy
```bash
# Deploy frontend only
npm run deploy:pages

# Deploy backend only
npm run deploy:workers

# Deploy everything
npm run deploy:full
```

### Manual Deploy
```bash
# Build project
npm run build

# Deploy to Pages
wrangler pages deploy ./dist --project-name=pos-frontend

# Deploy Workers
wrangler deploy --env production
```

## 📊 MONITORING & ANALYTICS

### Cloudflare Analytics
- **Pages Analytics**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/pages/view/pos-frontend/analytics
- **Workers Analytics**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/workers/services/view/computerpos-api/production/metrics
- **Account Analytics**: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd/analytics

### Performance Targets
- **Page Load Time**: < 1 second
- **API Response Time**: < 100ms
- **Uptime**: 99.9%+
- **Lighthouse Score**: 90+

## 🔧 TROUBLESHOOTING

### Common Commands
```bash
# Check authentication
wrangler whoami

# List all resources
wrangler d1 list
wrangler kv:namespace list
wrangler r2 bucket list
wrangler pages project list
wrangler services list

# View logs
wrangler tail computerpos-api
wrangler pages deployment logs pos-frontend
```

### Support Resources
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **Community**: https://community.cloudflare.com/

---

## 📝 NOTES

### Last Updated
- **Date**: [TO_BE_FILLED]
- **Updated By**: [YOUR_NAME]
- **Version**: 2.0.0

### TODO
- [ ] Fill in all resource IDs from Wrangler output
- [ ] Configure custom domain
- [ ] Setup monitoring alerts
- [ ] Add production data
- [ ] Configure backup strategy

---

**🎯 All configuration details for ComputerPOS Pro deployment and management**
