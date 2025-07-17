# 🚀 Hướng Dẫn Deploy ComputerPOS Pro lên Netlify

## Phương Pháp 1: Deploy qua Netlify Web Interface (Khuyến nghị)

### Bước 1: Truy cập Netlify
1. Đi tới https://app.netlify.com/
2. Đăng nhập bằng tài khoản GitHub của bạn

### Bước 2: Tạo Site Mới
1. Click "New site from Git"
2. Chọn "GitHub" 
3. Authorize Netlify để truy cập GitHub repositories
4. Chọn repository: `namhbcf1/computerpos-pro`

### Bước 3: Cấu Hình Build Settings
```
Build command: npm run build
Publish directory: dist
```

### Bước 4: Environment Variables (Tùy chọn)
Nếu cần thiết, thêm các environment variables:
- `NODE_VERSION`: 18
- `NPM_VERSION`: 9

### Bước 5: Deploy
1. Click "Deploy site"
2. Netlify sẽ tự động build và deploy
3. Bạn sẽ nhận được URL dạng: `https://random-name.netlify.app`

## Phương Pháp 2: Deploy qua Netlify CLI

### Cài đặt Netlify CLI (đã thực hiện)
```bash
npm install -g netlify-cli
```

### Login và Deploy
```bash
# Login vào Netlify
netlify login

# Deploy lần đầu
netlify deploy --prod --dir=dist

# Hoặc deploy với site name tùy chỉnh
netlify deploy --prod --dir=dist --site=computerpos-pro
```

## 🔧 Cấu Hình Đã Sẵn Sàng

### ✅ Files đã tạo:
- `netlify.toml` - Cấu hình Netlify
- `package.json` - Build scripts
- `dist/` - Thư mục build output

### ✅ Build Configuration:
- Framework: Astro
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18

### ✅ Security Headers:
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: Configured
- Cache-Control: Optimized for static assets

## 🌐 Sau Khi Deploy

### URL Patterns:
- Main site: `https://your-site.netlify.app`
- POS System: `https://your-site.netlify.app/pos`
- Admin Dashboard: `https://your-site.netlify.app/dashboard`
- Customer Management: `https://your-site.netlify.app/customers`
- Product Management: `https://your-site.netlify.app/products`

### Custom Domain (Tùy chọn):
1. Trong Netlify dashboard, đi tới "Domain settings"
2. Click "Add custom domain"
3. Nhập domain của bạn
4. Cấu hình DNS records theo hướng dẫn

## 🔍 Troubleshooting

### Nếu build fails:
1. Kiểm tra Node version (cần 18+)
2. Xóa `node_modules` và chạy `npm install`
3. Chạy `npm run build` locally để test

### Nếu site không load:
1. Kiểm tra build logs trong Netlify dashboard
2. Verify `dist` folder có files
3. Check redirects trong `netlify.toml`

## 📞 Support
- GitHub Issues: https://github.com/namhbcf1/computerpos-pro/issues
- Netlify Docs: https://docs.netlify.com/

---
**Lưu ý**: Project đã được build thành công và sẵn sàng deploy!
