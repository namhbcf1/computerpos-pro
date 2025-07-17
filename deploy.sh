#!/bin/bash

# 🚀 ComputerPOS Pro - Auto Deploy Script
# Tự động deploy lên Cloudflare Workers và Pages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="computerpos-pro"
WORKERS_NAME="computerpos-pro-api"
PAGES_NAME="computerpos-pro"
DB_NAME="computerpos-pro-db"

echo -e "${BLUE}🚀 Starting ComputerPOS Pro Deployment...${NC}"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to log with timestamp
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check prerequisites
log "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists wrangler; then
    log "${RED}❌ Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

if ! command_exists npm; then
    log "${RED}❌ npm not found. Please install Node.js${NC}"
    exit 1
fi

# Check if user is logged in to Cloudflare
log "${YELLOW}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami >/dev/null 2>&1; then
    log "${RED}❌ Not logged in to Cloudflare. Please run: wrangler login${NC}"
    exit 1
fi

log "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies
log "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Create D1 Database if needed
log "${YELLOW}🗄️ Setting up database...${NC}"

# Check if database exists
if ! wrangler d1 list | grep -q "$DB_NAME"; then
    log "${YELLOW}Creating D1 database: $DB_NAME${NC}"
    DB_OUTPUT=$(wrangler d1 create "$DB_NAME")
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+')
    
    log "${GREEN}✅ Database created with ID: $DB_ID${NC}"
    log "${YELLOW}⚠️ Please update wrangler.toml with the database_id: $DB_ID${NC}"
    
    # Wait for user to update wrangler.toml
    read -p "Press Enter after updating wrangler.toml with the database ID..."
else
    log "${GREEN}✅ Database $DB_NAME already exists${NC}"
fi

# Import database schema and seed data
log "${YELLOW}📊 Importing database schema and seed data...${NC}"
if [ -f "./schemas/schema.sql" ]; then
    wrangler d1 execute "$DB_NAME" --file=./schemas/schema.sql --env=production
    log "${GREEN}✅ Schema imported${NC}"
else
    log "${YELLOW}⚠️ Schema file not found at ./schemas/schema.sql${NC}"
fi

if [ -f "./schemas/seed.sql" ]; then
    wrangler d1 execute "$DB_NAME" --file=./schemas/seed.sql --env=production
    log "${GREEN}✅ Seed data imported${NC}"
else
    log "${YELLOW}⚠️ Seed file not found at ./schemas/seed.sql${NC}"
fi

# Build the project
log "${YELLOW}🔨 Building project...${NC}"
npm run build

# Deploy Workers API
log "${YELLOW}⚡ Deploying Workers API...${NC}"
if [ -f "./workers/api.js" ]; then
    wrangler deploy workers/api.js --name="$WORKERS_NAME" --env=production
    log "${GREEN}✅ Workers API deployed successfully${NC}"
else
    log "${RED}❌ Workers API file not found at ./workers/api.js${NC}"
    exit 1
fi

# Create Pages project if it doesn't exist
log "${YELLOW}🌐 Setting up Cloudflare Pages...${NC}"
if ! wrangler pages project list | grep -q "$PAGES_NAME"; then
    log "${YELLOW}Creating Pages project: $PAGES_NAME${NC}"
    wrangler pages project create "$PAGES_NAME"
    log "${GREEN}✅ Pages project created${NC}"
else
    log "${GREEN}✅ Pages project $PAGES_NAME already exists${NC}"
fi

# Deploy to Cloudflare Pages
log "${YELLOW}🌐 Deploying to Cloudflare Pages...${NC}"
if [ -d "./dist" ]; then
    wrangler pages deploy dist --project-name="$PAGES_NAME"
    log "${GREEN}✅ Pages deployed successfully${NC}"
else
    log "${RED}❌ Build directory ./dist not found${NC}"
    exit 1
fi

# Test deployment
log "${YELLOW}🧪 Testing deployment...${NC}"

# Test Workers API
WORKERS_URL="https://$WORKERS_NAME.workers.dev"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$WORKERS_URL/api/health" || echo "000")

if [ "$API_STATUS" = "200" ]; then
    log "${GREEN}✅ Workers API is responding: $WORKERS_URL${NC}"
else
    log "${YELLOW}⚠️ Workers API status: $API_STATUS - $WORKERS_URL${NC}"
fi

# Test Pages
PAGES_URL="https://$PAGES_NAME.pages.dev"
PAGES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PAGES_URL" || echo "000")

if [ "$PAGES_STATUS" = "200" ]; then
    log "${GREEN}✅ Pages is responding: $PAGES_URL${NC}"
else
    log "${YELLOW}⚠️ Pages status: $PAGES_STATUS - $PAGES_URL${NC}"
fi

# Summary
echo ""
echo "=================================="
log "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
log "${BLUE}📊 Deployment Summary:${NC}"
log "Frontend URL: ${GREEN}$PAGES_URL${NC}"
log "API URL: ${GREEN}$WORKERS_URL${NC}"
log "Database: ${GREEN}$DB_NAME${NC}"
echo ""
log "${BLUE}📋 Next Steps:${NC}"
log "1. Update API_BASE_URL in src/lib/api/client.ts if needed"
log "2. Configure custom domain (optional)"
log "3. Set up monitoring and alerts"
log "4. Test all functionality"
echo ""
log "${YELLOW}💡 Useful Commands:${NC}"
log "Monitor logs: ${BLUE}wrangler tail $WORKERS_NAME --env=production${NC}"
log "Check DB: ${BLUE}wrangler d1 execute $DB_NAME --command='SELECT COUNT(*) FROM products;' --env=production${NC}"
log "Pages logs: ${BLUE}wrangler pages deployment list --project-name=$PAGES_NAME${NC}"
echo ""

# Optional: Open URLs in browser
read -p "Open URLs in browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command_exists xdg-open; then
        xdg-open "$PAGES_URL"
        xdg-open "$WORKERS_URL"
    elif command_exists open; then
        open "$PAGES_URL"
        open "$WORKERS_URL"
    else
        log "${YELLOW}Please manually open:${NC}"
        log "Frontend: $PAGES_URL"
        log "API: $WORKERS_URL"
    fi
fi

log "${GREEN}🚀 ComputerPOS Pro deployment complete!${NC}"