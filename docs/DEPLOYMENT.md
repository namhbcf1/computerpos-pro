# 🚀 ComputerPOS Pro Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Cloudflare account with Workers and Pages enabled
- Wrangler CLI installed globally: `npm install -g wrangler`
- Git for version control

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd computerpos-pro
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your actual values:
```bash
# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your-actual-account-id
CLOUDFLARE_API_TOKEN=your-actual-api-token

# Database Configuration
DATABASE_ID=your-d1-database-id
DATABASE_NAME=computerpos_db

# Application Configuration
APP_NAME=ComputerPOS Pro
APP_URL=https://your-domain.pages.dev
APP_ENV=production
```

### 3. Authenticate with Cloudflare

```bash
wrangler login
```

## Database Setup

### 1. Create D1 Database

```bash
# Create production database
wrangler d1 create computerpos_db

# Create development database
wrangler d1 create computerpos_db_dev
```

### 2. Update wrangler.toml

Update the database IDs in `wrangler.toml`:
```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "computerpos_db"
database_id = "your-production-database-id"

[[env.development.d1_databases]]
binding = "DB"
database_name = "computerpos_db_dev"
database_id = "your-development-database-id"
```

### 3. Run Database Migrations

```bash
# Development
npm run db:migrate:dev

# Production
npm run db:migrate:prod
```

### 4. Seed Database (Optional)

```bash
# Development
npm run db:seed:dev

# Production
npm run db:seed:prod
```

## KV and R2 Setup (Optional)

### 1. Create KV Namespaces

```bash
# Production cache
wrangler kv:namespace create "CACHE" --env production

# Development cache
wrangler kv:namespace create "CACHE" --env development
```

### 2. Create R2 Buckets

```bash
# Production assets
wrangler r2 bucket create computerpos-assets

# Development assets
wrangler r2 bucket create computerpos-assets-dev
```

### 3. Update wrangler.toml

Add the KV and R2 IDs to `wrangler.toml`:
```toml
[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-production-kv-id"

[[env.production.r2_buckets]]
binding = "ASSETS"
bucket_name = "computerpos-assets"
```

## Development Deployment

### 1. Start Development Server

```bash
# Start Astro dev server
npm run dev

# In another terminal, start Workers dev server
npm run dev:worker
```

### 2. Test Local Development

- Frontend: http://localhost:4321
- Backend API: http://localhost:8787

## Production Deployment

### 1. Build and Deploy Workers

```bash
# Deploy to production
npm run deploy

# Or deploy to specific environment
npm run deploy:prod
```

### 2. Deploy Frontend to Cloudflare Pages

#### Option A: Automatic Deployment (Recommended)

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

3. Configure environment variables in Cloudflare Pages dashboard:
   ```
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   DATABASE_ID=your-database-id
   APP_ENV=production
   ```

#### Option B: Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name computerpos-pro
```

### 3. Configure Custom Domain (Optional)

1. Go to Cloudflare Pages dashboard
2. Navigate to your project > Custom domains
3. Add your domain and configure DNS

## Post-Deployment Verification

### 1. Health Check

```bash
# Check API health
curl https://your-workers-domain.workers.dev/api/health

# Check frontend
curl https://your-domain.pages.dev
```

### 2. Database Connection Test

```bash
# Test database connection
npm run db:test:prod
```

### 3. Functional Testing

- [ ] Login functionality works
- [ ] Product management works
- [ ] POS interface loads correctly
- [ ] Reports generate successfully
- [ ] Build assistant functions properly

## Monitoring and Maintenance

### 1. Cloudflare Analytics

- Monitor Workers analytics in Cloudflare dashboard
- Set up alerts for errors and performance issues
- Review D1 database usage and performance

### 2. Logging

```bash
# View Workers logs
wrangler tail

# View specific environment logs
wrangler tail --env production
```

### 3. Database Maintenance

```bash
# Backup database
npm run db:backup:prod

# View database size
wrangler d1 info computerpos_db

# Execute SQL queries
wrangler d1 execute computerpos_db --command "SELECT COUNT(*) FROM products"
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check database binding
wrangler d1 list

# Verify database ID in wrangler.toml
# Re-run migrations if needed
npm run db:migrate:prod
```

#### 2. Environment Variable Issues

```bash
# Check environment variables
wrangler secret list

# Update secrets
wrangler secret put CLOUDFLARE_API_TOKEN
```

#### 3. Build Failures

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

#### 4. CORS Issues

- Verify CORS settings in Workers
- Check API endpoints are properly configured
- Ensure frontend and backend domains are correctly set

### Performance Optimization

1. **Enable Caching**:
   - Configure KV for API response caching
   - Use R2 for static asset storage
   - Enable Cloudflare Page Rules for caching

2. **Database Optimization**:
   - Add proper indexes to frequently queried tables
   - Use prepared statements for better performance
   - Monitor query execution times

3. **Frontend Optimization**:
   - Enable Astro's static site generation where possible
   - Optimize images and assets
   - Use code splitting for better loading times

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use Cloudflare Workers secrets for sensitive data
- Rotate API tokens regularly

### 2. Database Security

- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Regular security audits of database access

### 3. API Security

- Implement rate limiting
- Use HTTPS for all communications
- Validate all input data
- Implement proper error handling without exposing sensitive information

## Scaling Considerations

### 1. Database Scaling

- Monitor D1 database limits and usage
- Consider database sharding for large datasets
- Implement proper indexing strategies

### 2. Workers Scaling

- Cloudflare Workers automatically scale
- Monitor CPU time and memory usage
- Optimize code for better performance

### 3. Frontend Scaling

- Use Cloudflare's global CDN
- Implement proper caching strategies
- Consider using Cloudflare Images for image optimization

## Backup and Recovery

### 1. Database Backups

```bash
# Create backup
npm run db:backup:prod

# Restore from backup
npm run db:restore:prod backup-file.sql
```

### 2. Code Backups

- Use Git for version control
- Tag releases for easy rollback
- Maintain separate branches for different environments

### 3. Configuration Backups

- Backup `wrangler.toml` configuration
- Document all environment variables
- Keep records of all Cloudflare resource IDs

## Support and Resources

- **Cloudflare Workers Documentation**: https://developers.cloudflare.com/workers/
- **Cloudflare D1 Documentation**: https://developers.cloudflare.com/d1/
- **Astro Documentation**: https://docs.astro.build/
- **Project Repository**: [GitHub Repository URL]
- **Issue Tracker**: [GitHub Issues URL]

For deployment issues, please check the troubleshooting section first, then create an issue in the project repository with detailed error logs and environment information.
