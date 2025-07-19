# 🌐 ComputerPOS Pro - Domain & SSL Setup Guide

Hướng dẫn setup custom domain và SSL certificates cho ComputerPOS Pro.

## 🎯 Domain Options

### Option 1: Free Cloudflare Pages Domain
- **URL**: `https://computerpos-pro.pages.dev`
- **SSL**: Automatic (Let's Encrypt)
- **CDN**: Global Cloudflare network
- **Cost**: FREE
- **Setup Time**: Immediate

### Option 2: Custom Domain (Recommended for Business)
- **Examples**: 
  - `computerpos.pro`
  - `computerpos.vn` 
  - `yourstore.com`
- **SSL**: Automatic (Cloudflare Universal SSL)
- **CDN**: Global Cloudflare network
- **Cost**: Domain registration fee (~$10-15/year)
- **Setup Time**: 5-10 minutes

## 🔧 Custom Domain Setup

### Step 1: Purchase Domain (if needed)

#### Recommended Vietnamese Registrars:
- **Tên Miền Việt**: [tenmien.vn](https://tenmien.vn)
- **iNET**: [inet.vn](https://inet.vn)
- **Nhân Hòa**: [nhanhoa.com](https://nhanhoa.com)

#### International Registrars:
- **Cloudflare Registrar**: [cloudflare.com/products/registrar](https://cloudflare.com/products/registrar)
- **Namecheap**: [namecheap.com](https://namecheap.com)
- **GoDaddy**: [godaddy.com](https://godaddy.com)

### Step 2: Add Domain to Cloudflare Pages

1. **Go to Cloudflare Pages Dashboard**
   - Visit: https://dash.cloudflare.com/pages
   - Select your `computerpos-pro` project

2. **Add Custom Domain**
   - Click **Custom domains** tab
   - Click **Set up a custom domain**
   - Enter your domain: `computerpos.pro`
   - Click **Continue**

3. **DNS Configuration**
   Cloudflare will provide DNS records to add:
   ```
   Type: CNAME
   Name: @ (or your domain)
   Value: computerpos-pro.pages.dev
   TTL: Auto
   ```

### Step 3: Configure DNS at Your Registrar

#### Option A: Use Cloudflare Nameservers (Recommended)
1. **Add Site to Cloudflare**
   - Go to https://dash.cloudflare.com
   - Click **Add a site**
   - Enter your domain
   - Choose **Free** plan
   - Follow DNS scan

2. **Update Nameservers**
   - Copy Cloudflare nameservers (e.g., `ns1.cloudflare.com`)
   - Update at your domain registrar
   - Wait 24-48 hours for propagation

#### Option B: Add CNAME Record Only
1. **Login to Domain Registrar**
2. **Find DNS Management**
3. **Add CNAME Record**:
   ```
   Type: CNAME
   Host: @ (or www)
   Value: computerpos-pro.pages.dev
   TTL: 3600
   ```

### Step 4: Verify Domain Setup

1. **Check DNS Propagation**
   ```bash
   # Check CNAME record
   nslookup computerpos.pro
   
   # Or use online tools:
   # https://dnschecker.org/
   # https://whatsmydns.net/
   ```

2. **Test Domain Access**
   - Visit: `https://computerpos.pro`
   - Should redirect to your site
   - SSL certificate should be valid

## 🔒 SSL Certificate Setup

### Automatic SSL (Recommended)
Cloudflare automatically provides SSL certificates for all domains:

- **Universal SSL**: Free, automatic, covers `example.com` and `www.example.com`
- **Let's Encrypt**: Industry standard, trusted by all browsers
- **Auto-renewal**: Certificates renew automatically
- **A+ Rating**: Highest SSL security rating

### SSL Configuration Options

#### 1. Full (Strict) - Recommended
```
Cloudflare ↔ Origin Server: Encrypted
Browser ↔ Cloudflare: Encrypted
SSL Mode: Full (Strict)
```

#### 2. Flexible (Basic)
```
Cloudflare ↔ Origin Server: Not encrypted
Browser ↔ Cloudflare: Encrypted
SSL Mode: Flexible
```

### Force HTTPS Redirect
1. **Go to Cloudflare Dashboard**
2. **SSL/TLS** → **Edge Certificates**
3. **Always Use HTTPS**: ON
4. **Automatic HTTPS Rewrites**: ON

## ⚡ Performance Optimization

### Cloudflare Settings for ComputerPOS Pro

#### 1. Speed Settings
```
Auto Minify:
- HTML: ON
- CSS: ON
- JavaScript: ON

Brotli Compression: ON
Early Hints: ON
HTTP/2: ON
HTTP/3 (with QUIC): ON
0-RTT Connection Resumption: ON
```

#### 2. Caching Settings
```
Browser Cache TTL: 4 hours
Caching Level: Standard
Always Online: ON
Development Mode: OFF (for production)
```

#### 3. Security Settings
```
Security Level: Medium
Bot Fight Mode: ON
Email Obfuscation: ON
Server-side Excludes: ON
Hotlink Protection: ON
```

## 🌍 Multiple Domain Setup

### Primary Domain: computerpos.pro
```
Type: CNAME
Name: @
Value: computerpos-pro.pages.dev
```

### WWW Subdomain: www.computerpos.pro
```
Type: CNAME
Name: www
Value: computerpos-pro.pages.dev
```

### Redirect Rules
Set up redirects in Cloudflare Pages:
```
www.computerpos.pro → computerpos.pro (301 redirect)
computerpos-pro.pages.dev → computerpos.pro (301 redirect)
```

## 📊 Domain Verification

### DNS Check Commands
```bash
# Check A record
dig computerpos.pro A

# Check CNAME record
dig www.computerpos.pro CNAME

# Check SSL certificate
openssl s_client -connect computerpos.pro:443 -servername computerpos.pro

# Check HTTP headers
curl -I https://computerpos.pro
```

### Online Verification Tools
- **DNS Checker**: https://dnschecker.org/
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **GTmetrix**: https://gtmetrix.com/
- **PageSpeed Insights**: https://pagespeed.web.dev/

## 🔧 Troubleshooting

### Common Issues

#### ❌ Domain Not Resolving
```bash
# Check DNS propagation (can take 24-48 hours)
nslookup computerpos.pro

# Verify CNAME record is correct
# Check nameservers if using Cloudflare
```

#### ❌ SSL Certificate Error
```bash
# Wait for certificate provisioning (5-10 minutes)
# Check SSL mode in Cloudflare (use Full or Flexible)
# Clear browser cache
# Try incognito/private browsing
```

#### ❌ Redirect Loop
```bash
# Check SSL mode (avoid Full if origin doesn't support SSL)
# Verify redirect rules
# Check .htaccess or server configuration
```

#### ❌ Slow Loading
```bash
# Enable Cloudflare optimizations
# Check caching settings
# Verify CDN is working
# Run performance audit
```

## 📈 Monitoring & Analytics

### Cloudflare Analytics
- **Traffic Analytics**: Page views, unique visitors
- **Performance**: Core Web Vitals, load times
- **Security**: Threats blocked, bot traffic
- **Caching**: Cache hit ratio, bandwidth saved

### Google Analytics Setup
```html
<!-- Add to BaseLayout.astro -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Search Console Setup
1. **Go to**: https://search.google.com/search-console
2. **Add Property**: computerpos.pro
3. **Verify Ownership**: DNS TXT record or HTML file
4. **Submit Sitemap**: https://computerpos.pro/sitemap.xml

## 🎯 Production Checklist

### ✅ Domain Setup Complete
- [ ] **Custom domain** configured (computerpos.pro)
- [ ] **DNS records** pointing to Cloudflare Pages
- [ ] **SSL certificate** active and valid
- [ ] **HTTPS redirect** enabled
- [ ] **WWW redirect** configured
- [ ] **Domain verification** completed

### ✅ Performance Optimized
- [ ] **Cloudflare optimizations** enabled
- [ ] **Caching rules** configured
- [ ] **Compression** enabled (Brotli/Gzip)
- [ ] **HTTP/2 & HTTP/3** enabled
- [ ] **Early Hints** enabled

### ✅ Security Configured
- [ ] **SSL/TLS encryption** (Full/Strict mode)
- [ ] **Security headers** configured
- [ ] **Bot protection** enabled
- [ ] **Firewall rules** set (if needed)
- [ ] **Rate limiting** configured

### ✅ Monitoring Setup
- [ ] **Cloudflare Analytics** enabled
- [ ] **Google Analytics** installed
- [ ] **Search Console** verified
- [ ] **Uptime monitoring** configured
- [ ] **Performance alerts** set

## 🎉 Success!

When all checklist items are complete:

### 🌐 Your ComputerPOS Pro is now live at:
- **Primary**: https://computerpos.pro
- **Backup**: https://computerpos-pro.pages.dev

### 📊 Expected Performance:
- **SSL Rating**: A+
- **Page Load**: < 1 second
- **Global CDN**: 200+ locations
- **Uptime**: 99.9%+

### 🔒 Security Features:
- **SSL Certificate**: Valid and trusted
- **HTTPS Everywhere**: Forced encryption
- **DDoS Protection**: Cloudflare shield
- **Bot Protection**: Automatic filtering

---

**🚀 Domain Setup Complete!** ComputerPOS Pro is now accessible via your custom domain with enterprise-grade security and performance! 🌐🔒⚡
