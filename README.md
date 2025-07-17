# 🖥️ ComputerPOS Pro

**Phần Mềm Bán Máy Tính Để Bàn & Linh Kiện Chuyên Nghiệp**

> Hệ thống POS chuyên biệt dành cho cửa hàng máy tính, được xây dựng với Astro và Cloudflare Workers

## 🌟 Tính Năng Chính

### 💻 Quản Lý Sản Phẩm Chuyên Biệt
- **Máy Tính Để Bàn**: PC Gaming, Văn Phòng, Đồ Họa
- **Linh Kiện**: CPU, VGA, RAM, Mainboard, PSU, Case, Cooling
- **Thiết Bị Ngoại Vi**: Bàn phím, chuột, màn hình, loa
- **Kiểm Tra Tương Thích**: Tự động kiểm tra tương thích linh kiện
- **Build Calculator**: Tính toán cấu hình PC tối ưu

### 🛒 Hệ Thống Bán Hàng
- **POS Interface**: Giao diện bán hàng chuyên nghiệp
- **Barcode Scanner**: Quét mã vạch sản phẩm
- **Payment Processing**: Thanh toán VND (tiền mặt, chuyển khoản, QR)
- **Receipt Printing**: In hóa đơn tự động
- **Customer Display**: Màn hình khách hàng

### 📦 Quản Lý Kho Hàng
- **Serial Number Tracking**: Theo dõi số serial riêng biệt
- **Warranty Management**: Quản lý bảo hành chi tiết
- **Stock Alerts**: Cảnh báo hết hàng thông minh
- **Supplier Management**: Quản lý nhà cung cấp
- **Price History**: Lịch sử biến động giá

### 👥 Quản Lý Khách Hàng
- **Customer Profiles**: Hồ sơ khách hàng chi tiết
- **Build History**: Lịch sử build PC
- **Purchase Tracking**: Theo dõi lịch sử mua hàng
- **Warranty Claims**: Xử lý yêu cầu bảo hành
- **Customer Segments**: Phân khúc khách hàng

### 📊 Báo Cáo & Phân Tích
- **Sales Reports**: Báo cáo bán hàng chi tiết
- **Inventory Reports**: Báo cáo tồn kho
- **Brand Analysis**: Phân tích thương hiệu
- **Trend Analysis**: Phân tích xu hướng
- **Profit Analysis**: Phân tích lợi nhuận

## 🏗️ Kiến Trúc Hệ Thống

### Frontend
- **Framework**: Astro với TypeScript
- **Styling**: Tailwind CSS
- **Components**: React components
- **State Management**: Client-side localStorage

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: D1 (SQLite)
- **Cache**: KV Storage
- **File Storage**: R2 Storage
- **API**: RESTful API với TypeScript

### Deployment
- **Hosting**: Cloudflare Pages (Frontend)
- **API**: Cloudflare Workers (Backend)
- **Database**: Cloudflare D1
- **CDN**: Cloudflare CDN
- **SSL**: Automatic HTTPS

## 🚀 Cài Đặt & Triển Khai

### Yêu Cầu Hệ Thống
- Node.js 18+
- npm hoặc yarn
- Tài khoản Cloudflare (miễn phí)
- Git

### Cài Đặt Local

```bash
# Clone repository
git clone <repository-url>
cd computerpos-pro

# Cài đặt dependencies
npm install

# Tạo file environment
cp .env.example .env

# Chạy development server
npm run dev
```

### Triển Khai Production

```bash
# 1. Tạo D1 database
npm run db:create

# 2. Chạy migrations
npm run db:migrate

# 3. Seed dữ liệu mẫu
npm run db:seed

# 4. Deploy Workers
npm run deploy:workers

# 5. Deploy Frontend
npm run deploy:frontend
```

## 📁 Cấu Trúc Thư Mục

```
computerpos-pro/
├── src/
│   ├── components/          # UI Components
│   ├── layouts/            # Page Layouts
│   ├── pages/              # Astro Pages
│   ├── lib/                # Utilities & Types
│   └── styles/             # Global Styles
├── functions/              # Cloudflare Workers
│   ├── api/               # API Endpoints
│   ├── middleware/        # Middleware Functions
│   └── utils/             # Worker Utilities
├── schemas/               # Database Schemas
├── public/                # Static Assets
└── docs/                  # Documentation
```

## 🔧 Cấu Hình

### Environment Variables

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# Database
DATABASE_ID=your-d1-database-id

# Application
APP_NAME=ComputerPOS Pro
APP_URL=https://your-domain.com
APP_ENV=production
```

### Wrangler Configuration

Xem `wrangler.toml` để cấu hình Cloudflare Workers.

## 📚 Tài Liệu

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)
- [Changelog](./docs/CHANGELOG.md)

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.

## 🆘 Hỗ Trợ

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Email**: support@computerpos.com

## 🎯 Roadmap

- [ ] Mobile App (React Native)
- [ ] Advanced Analytics
- [ ] Multi-store Support
- [ ] API Integrations
- [ ] Advanced Reporting

---

**Được phát triển với ❤️ cho cộng đồng cửa hàng máy tính Việt Nam**
