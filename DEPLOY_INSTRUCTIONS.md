# 🚀 HƯỚNG DẪN DEPLOY COMPUTERPOS PRO

## 📋 CHUẨN BỊ
Dự án đã được build thành công và sẵn sàng deploy!

## 🐙 UPLOAD LÊN GITHUB

### Bước 1: Tạo Repository trên GitHub
1. Đăng nhập vào GitHub với tài khoản: **namhbcf1**
2. Truy cập: https://github.com/new
3. Tạo repository mới:
   - Repository name: `computerpos-pro`
   - Description: `ComputerPOS Pro - Hệ thống quản lý bán hàng máy tính với Astro + Cloudflare`
   - Chọn **Public**
   - Không check "Add a README file" (vì đã có sẵn)
   - Click **Create repository**

### Bước 2: Push Code lên GitHub
Sau khi tạo repository, chạy lệnh sau trong terminal:

```bash
# Đã có Git repository local sẵn sàng
git remote set-url origin https://github.com/namhbcf1/computerpos-pro.git
git push -u origin master
```

## ☁️ DEPLOY LÊN CLOUDFLARE PAGES

### Bước 1: Đăng nhập Cloudflare
1. Truy cập: https://dash.cloudflare.com/5b62d10947844251d23e0eac532531dd
2. Đăng nhập với email: **Bangachieu2@gmail.com**

### Bước 2: Tạo Cloudflare Pages
1. Trong dashboard Cloudflare, click **Pages** ở sidebar trái
2. Click **Create a project**
3. Chọn **Connect to Git**
4. Authorize GitHub và chọn repository `computerpos-pro`
5. Cấu hình build:
   - **Project name**: `computerpos-pro`
   - **Production branch**: `master`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (để trống)

### Bước 3: Environment Variables (Tùy chọn)
Nếu cần thiết, thêm các environment variables:
- `NODE_VERSION`: `18`
- Các biến khác từ file `.env.example`

### Bước 4: Deploy
Click **Save and Deploy** - Cloudflare sẽ tự động build và deploy!

## 🔧 DEPLOY VỚI WRANGLER CLI (Tùy chọn)

Nếu muốn deploy bằng CLI:

```bash
# Đăng nhập Cloudflare (sẽ mở browser)
wrangler login

# Deploy Pages
wrangler pages deploy dist --project-name computerpos-pro

# Hoặc deploy Workers (nếu cần)
wrangler deploy
```

## 📱 KIỂM TRA DEPLOYMENT

Sau khi deploy thành công:
1. Cloudflare sẽ cung cấp URL dạng: `https://computerpos-pro.pages.dev`
2. Kiểm tra website hoạt động
3. Test các tính năng chính:
   - Dashboard
   - POS System
   - Inventory Management
   - Reports

## 🔗 LIÊN KẾT CUSTOM DOMAIN (Tùy chọn)

Nếu có domain riêng:
1. Trong Cloudflare Pages settings
2. Click **Custom domains**
3. Add domain và cấu hình DNS

## 📊 MONITORING

- Cloudflare Analytics: Theo dõi traffic
- Error logs: Kiểm tra lỗi trong Functions tab
- Performance: Web Vitals trong Analytics

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Repository GitHub đã tạo
- [ ] Code đã push lên GitHub
- [ ] Cloudflare Pages đã setup
- [ ] Build thành công
- [ ] Website accessible
- [ ] Tính năng chính hoạt động

**🎉 Chúc mừng! ComputerPOS Pro đã sẵn sàng phục vụ!**
