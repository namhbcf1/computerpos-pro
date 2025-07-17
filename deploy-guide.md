# 🚀 Hướng dẫn Deploy ComputerPOS Pro lên Cloudflare

## Bước 1: Chuẩn bị môi trường

### 1.1 Cài đặt Wrangler CLI
```bash
npm install -g wrangler
```

### 1.2 Đăng nhập Cloudflare
```bash
wrangler login
```

### 1.3 Verify đăng nhập
```bash
wrangler whoami
```

## Bước 2: Tạo Database D1

### 2.1 Tạo D1 Database
```bash
wrangler d1 create computerpos-pro-db
```

### 2.2 Lưu Database ID vào wrangler.toml
Sau khi tạo xong, copy database_id và cập nhật vào file `wrangler.toml`:
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "computerpos-pro-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.3 Tạo tables
```bash
# Tạo schema chính
wrangler d1 execute computerpos-pro-db --file=./schemas/schema.sql --env=production

# Import dữ liệu mẫu
wrangler d1 execute computerpos-pro-db --file=./schemas/seed.sql --env=production
```

## Bước 3: Tạo KV Storage (Optional)

### 3.1 Tạo KV Namespace
```bash
wrangler kv:namespace create "CACHE" --env=production
```

### 3.2 Cập nhật wrangler.toml
```toml
[[env.production.kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## Bước 4: Tạo R2 Storage (Optional)

### 4.1 Tạo R2 Bucket
```bash
wrangler r2 bucket create computerpos-assets
```

### 4.2 Cập nhật wrangler.toml
```toml
[[env.production.r2_buckets]]
binding = "ASSETS"
bucket_name = "computerpos-assets"
```

## Bước 5: Deploy Workers API

### 5.1 Build và deploy Workers
```bash
# Deploy Workers API
wrangler deploy workers/api.js --env=production
```

### 5.2 Kiểm tra Workers
```bash
wrangler tail computerpos-pro-api --env=production
```

## Bước 6: Deploy Frontend (Astro)

### 6.1 Build frontend
```bash
npm run build
```

### 6.2 Deploy lên Cloudflare Pages
```bash
# Tạo Pages project
wrangler pages project create computerpos-pro

# Deploy
wrangler pages deploy dist --project-name=computerpos-pro
```

## Bước 7: Cấu hình Domain và DNS

### 7.1 Thêm Custom Domain (Optional)
```bash
# Thêm domain cho Pages
wrangler pages domain add computerpos-pro yourdomain.com

# Thêm domain cho Workers
wrangler route add "api.yourdomain.com/*" computerpos-pro-api --env=production
```

### 7.2 Cấu hình DNS Records
Trong Cloudflare Dashboard, thêm:
- `A record`: `@` → `192.0.2.1` (Proxied)
- `CNAME record`: `api` → `computerpos-pro-api.workers.dev` (Proxied)

## Bước 8: Environment Variables

### 8.1 Cập nhật API Base URL
Trong file `src/lib/api/client.ts`, cập nhật:
```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://computerpos-pro-api.workers.dev' // hoặc 'https://api.yourdomain.com'
  : 'http://localhost:8787';
```

### 8.2 Rebuild và redeploy
```bash
npm run build
wrangler pages deploy dist --project-name=computerpos-pro
```

## Bước 9: Kiểm tra và Test

### 9.1 Test API Endpoints
```bash
# Test health check
curl https://computerpos-pro-api.workers.dev/api/health

# Test products endpoint
curl https://computerpos-pro-api.workers.dev/api/products?limit=5
```

### 9.2 Test Frontend
Truy cập: `https://computerpos-pro.pages.dev` hoặc domain của bạn

## Bước 10: Monitoring và Logs

### 10.1 Xem logs real-time
```bash
wrangler tail computerpos-pro-api --env=production
```

### 10.2 Analytics
- Vào Cloudflare Dashboard
- Chọn Workers & Pages
- Xem metrics và analytics

## 🔧 Scripts hữu ích

### Script deploy complete
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying ComputerPOS Pro..."

# Build frontend
echo "📦 Building frontend..."
npm run build

# Deploy Workers API
echo "⚡ Deploying Workers API..."
wrangler deploy workers/api.js --env=production

# Deploy Pages
echo "🌐 Deploying Pages..."
wrangler pages deploy dist --project-name=computerpos-pro

echo "✅ Deployment complete!"
echo "Frontend: https://computerpos-pro.pages.dev"
echo "API: https://computerpos-pro-api.workers.dev"
```

### Script kiểm tra status
```bash
#!/bin/bash
# check-status.sh

echo "🔍 Checking deployment status..."

# Check Workers
echo "Workers API:"
curl -s -o /dev/null -w "%{http_code}" https://computerpos-pro-api.workers.dev/api/health

# Check Pages
echo "\nPages:"
curl -s -o /dev/null -w "%{http_code}" https://computerpos-pro.pages.dev

echo "\n✅ Status check complete!"
```

## 📋 Checklist Deploy

- [ ] ✅ Cài đặt Wrangler CLI
- [ ] ✅ Đăng nhập Cloudflare  
- [ ] ✅ Tạo D1 Database
- [ ] ✅ Cập nhật database_id trong wrangler.toml
- [ ] ✅ Import database schema và seed data
- [ ] ✅ Deploy Workers API
- [ ] ✅ Build frontend Astro
- [ ] ✅ Deploy lên Cloudflare Pages
- [ ] ✅ Cấu hình API Base URL
- [ ] ✅ Test API endpoints
- [ ] ✅ Test frontend functionality
- [ ] ✅ Cấu hình custom domain (optional)
- [ ] ✅ Kiểm tra logs và monitoring

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **Database connection failed**
   - Kiểm tra database_id trong wrangler.toml
   - Đảm bảo đã import schema

2. **CORS errors**
   - Kiểm tra API_BASE_URL trong client.ts
   - Đảm bảo CORS headers được set trong Workers

3. **Build failed**
   - Xóa node_modules và reinstall
   - Kiểm tra TypeScript errors

4. **403 Forbidden**
   - Kiểm tra Wrangler authentication
   - Đảm bảo có quyền trên Cloudflare account

## 💡 Tips Optimization

1. **Performance:**
   - Enable caching trong KV
   - Sử dụng R2 cho static assets
   - Optimize images

2. **Security:**
   - Thêm rate limiting
   - Validate input data
   - Use environment variables cho secrets

3. **Monitoring:**
   - Set up alerts
   - Monitor error rates
   - Track performance metrics

---

🎉 **Chúc mừng! ComputerPOS Pro đã được deploy thành công lên Cloudflare!**

Frontend: https://computerpos-pro.pages.dev
API: https://computerpos-pro-api.workers.dev

📞 **Hỗ trợ:** Nếu gặp vấn đề, kiểm tra logs với `wrangler tail` hoặc liên hệ support.