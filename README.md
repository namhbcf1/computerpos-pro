# 💻 ComputerPOS Pro

**Phần Mềm Quản Lý Cửa Hàng Máy Tính Hàng Đầu Việt Nam**

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)
[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-ff5d01)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🎯 Giới Thiệu

ComputerPOS Pro là hệ thống POS (Point of Sale) chuyên biệt được thiết kế dành riêng cho cửa hàng bán máy tính và linh kiện tại Việt Nam. Với giao diện hiện đại, tính năng đầy đủ và tuân thủ 100% quy định pháp luật Việt Nam.

### ✨ Tính Năng Nổi Bật

- 🛒 **Hệ Thống Bán Hàng**: Giao diện POS trực quan, hỗ trợ mã vạch, tính tiền tự động
- 📦 **Quản Lý Kho Hàng**: Theo dõi tồn kho real-time, cảnh báo hết hàng
- 👥 **Quản Lý Khách Hàng**: Database khách hàng, lịch sử mua hàng, chương trình loyalty
- 📊 **Báo Cáo & Thống Kê**: Phân tích doanh thu, lợi nhuận, xu hướng kinh doanh
- 🔧 **Hỗ Trợ Build PC**: Kiểm tra tương thích linh kiện, tính toán công suất PSU
- 🇻🇳 **Tuân Thủ Pháp Luật VN**: Hóa đơn điện tử, báo cáo thuế, Thông tư 78/2021

## 🚀 Tech Stack

### Frontend
- **Astro 5+** - Static Site Generator với hybrid rendering
- **TypeScript 5.7+** - Type safety và developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React** - Interactive components (Islands Architecture)

### Backend & Deployment
- **Cloudflare Pages** - Edge hosting với global CDN
- **Cloudflare Workers** - Serverless functions
- **Cloudflare D1** - SQLite database
- **Cloudflare KV** - Key-value storage

### Performance & SEO
- **Static-First Architecture** - Instant loading
- **Server-Side Rendering** - SEO optimization
- **Progressive Enhancement** - Works without JavaScript
- **Mobile-First Design** - Responsive cho mọi device

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm hoặc yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/computerpos-pro.git
cd computerpos-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Deployment
npm run deploy       # Deploy to Cloudflare Pages
npm run cf:deploy    # Deploy with Wrangler CLI

# Code Quality
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

## 📁 Project Structure

```
computerpos-pro/
├── src/
│   ├── pages/           # Astro pages (routes)
│   │   ├── index.astro  # Homepage
│   │   └── pos/         # POS system pages
│   ├── layouts/         # Page layouts
│   ├── components/      # Reusable components
│   │   ├── ui/          # UI components
│   │   ├── pos/         # POS-specific components
│   │   └── islands/     # Interactive React components
│   ├── lib/             # Utilities & business logic
│   │   ├── compatibility/  # Component compatibility engine
│   │   ├── compliance/     # Vietnamese compliance
│   │   └── security/       # Security & performance
│   └── styles/          # Global styles
├── functions/           # Cloudflare Workers
├── database/           # Database schema & migrations
├── public/             # Static assets
└── astro.config.mjs    # Astro configuration
```

## 🌐 Deployment

### Cloudflare Pages (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy via Cloudflare Dashboard**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy!

3. **Custom Domain (Optional)**
   - Add your domain in Cloudflare Pages settings
   - Update DNS records
   - SSL certificates auto-generated

### Manual Deployment

```bash
# Build project
npm run build

# Deploy with Wrangler CLI
npx wrangler pages deploy ./dist
```

## 🇻🇳 Vietnamese Market Features

### Business Compliance
- **Hóa Đơn Điện Tử**: Tuân thủ Thông tư 78/2021/TT-BTC
- **Báo Cáo Thuế**: Tự động tính VAT và báo cáo
- **Mã Số Thuế**: Validation và format chuẩn VN

### Computer Hardware Specialization
- **Component Database**: CPU, GPU, RAM, Motherboard, PSU, etc.
- **Compatibility Checking**: Socket, power, physical constraints
- **PC Building Tools**: Configuration wizard, power calculator
- **Vietnamese Brands**: Support local và international brands

### Pricing & Currency
- **VND Format**: "1.999.000 ₫" formatting
- **Margin Calculation**: Profit analysis by category
- **Bulk Discounts**: Volume pricing for businesses
- **Loyalty Programs**: Bronze, Silver, Gold, Platinum tiers

## 📊 Performance

### Core Web Vitals
- **LCP**: < 1.2s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)  
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

## 🔒 Security

- **Rate Limiting**: Cloudflare-native protection
- **XSS Protection**: Input sanitization
- **SQL Injection**: Parameterized queries
- **CSRF Protection**: Token-based validation
- **SSL/TLS**: End-to-end encryption

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@computerpos.vn
- **Hotline**: 1900-1234
- **Documentation**: [docs.computerpos.vn](https://docs.computerpos.vn)
- **GitHub Issues**: [Report bugs](https://github.com/your-username/computerpos-pro/issues)

## 🎉 Acknowledgments

- **Astro Team** - Amazing static site generator
- **Cloudflare** - Excellent edge platform
- **Vietnamese Developer Community** - Inspiration và feedback
- **Computer Hardware Stores** - Real-world requirements

---

**Made with ❤️ for Vietnamese Computer Hardware Stores**

*ComputerPOS Pro - Phần mềm quản lý cửa hàng máy tính hàng đầu Việt Nam*
