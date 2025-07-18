---
type: "always_apply"
---

# ComputerPOS Pro - Development Rules & Guidelines

## 🏗️ 1. KIẾN TRÚC & CẤU TRÚC CODE

### 1.1 Astro Framework Rules
- **Static-First Approach**: Tối đa hóa static pages, tối thiểu hóa client-side JavaScript
- **Component Isolation**: Mỗi component phải tự chứa và có thể tái sử dụng
- **TypeScript Mandatory**: Tất cả code phải sử dụng TypeScript với strict mode
- **File Naming**: Sử dụng PascalCase cho components (.astro), camelCase cho utilities (.ts)
- **Import Order**: External libs → Internal libs → Components → Types → Utils

### 1.2 Cloudflare Free Tier Compliance
- **Workers Optimization**: Tối đa 100,000 requests/day - thiết kế API calls hiệu quả
- **D1 Database Limits**: 5GB storage, 25M row reads/day - optimize queries
- **KV Storage Limits**: 100,000 reads, 1,000 writes/day - smart caching strategy
- **R2 Storage Limits**: 10GB/month - optimize file storage và image compression
- **No Server State**: Workers là stateless, tất cả state lưu trong database hoặc client

### 1.3 Code Organization Rules
```
✅ DO: Đặt components theo chức năng (/pos/, /products/, /build/)
❌ DON'T: Đặt components theo loại UI (buttons/, modals/)

✅ DO: Sử dụng typed interfaces cho mọi data structure
❌ DON'T: Sử dụng 'any' type

✅ DO: Chia nhỏ functions, mỗi function một chức năng cụ thể
❌ DON'T: Tạo functions quá lớn (>50 lines)
```

---

## 💻 2. CHUYÊN MÔN MÁY TÍNH & LINH KIỆN

### 2.1 Product Data Integrity
- **Mandatory Fields**: Tất cả sản phẩm PHẢI có: tên, model, brand, giá, specs, compatibility
- **Socket Validation**: CPU/Mainboard socket phải match hoàn toàn
- **Power Calculation**: PSU calculator phải chính xác ±50W
- **Compatibility Matrix**: Maintain compatibility database cho mọi component combination
- **Spec Standardization**: Chuẩn hóa format cho tất cả technical specs
- **Serial Number Tracking**: Bắt buộc cho high-value items (CPU, GPU, Motherboard)
- **Warranty Information**: Thời gian bảo hành, điều kiện, local vs international

### 2.2 CPU (Bộ Vi Xử Lý) Rules
```typescript
interface CPUProduct {
  // Mandatory fields
  brand: 'Intel' | 'AMD';
  series: string;                    // Core i3/i5/i7/i9, Ryzen 3/5/7/9
  model: string;                     // 13700K, 7800X3D
  socket: string;                    // LGA1700, AM5, AM4
  cores: number;                     // Physical cores
  threads: number;                   // Logical threads
  baseClock: number;                 // Base frequency in GHz
  boostClock: number;                // Max boost frequency in GHz
  tdp: number;                       // Thermal Design Power in Watts
  integratedGPU: boolean;            // Has integrated graphics
  overclockSupport: boolean;         // Supports overclocking
  generation: string;                // 13th Gen, Zen 4
  architecture: string;              // Raptor Lake, Zen 4
  
  // Pricing
  priceRetail: number;               // VND
  priceWholesale: number;            // VND
  margin: number;                    // Profit margin %
}
```

### 2.3 Mainboard (Bo Mạch Chủ) Rules
```typescript
interface MainboardProduct {
  // Mandatory fields
  brand: string;                     // ASUS, MSI, Gigabyte, ASRock
  chipset: string;                   // Z790, B650, X670E
  socket: string;                    // Must match CPU socket
  formFactor: 'ATX' | 'Micro-ATX' | 'Mini-ITX' | 'E-ATX';
  ramSlots: number;                  // Number of RAM slots
  maxRamCapacity: number;            // Max RAM in GB
  ramType: 'DDR4' | 'DDR5';
  maxRamSpeed: number;               // Max supported speed
  
  // Expansion slots
  pcieSlotsX16: number;              // Full-length PCIe slots
  pcieSlotsX8: number;               // Half-length PCIe slots
  pcieSlotsX1: number;               // Single-lane PCIe slots
  m2Slots: number;                   // M.2 NVMe slots
  
  // I/O and features
  usbPorts: {
    usb2: number;
    usb3: number;
    usbC: number;
  };
  sataConnectors: number;
  ethernet: 'Gigabit' | '2.5G' | '10G';
  wifi: boolean;
  bluetooth: boolean;
  rgb: boolean;
  overclockSupport: boolean;
}
```

### 2.4 RAM (Bộ Nhớ) Rules
```typescript
interface RAMProduct {
  // Mandatory fields
  type: 'DDR4' | 'DDR5';
  capacity: number;                  // Per stick in GB
  kitSize: number;                   // Number of sticks in kit
  totalCapacity: number;             // Total capacity in GB
  speed: number;                     // Speed in MHz
  
  // Timings
  casLatency: number;                // CL
  tRCD: number;
  tRP: number;
  tRAS: number;
  
  // Features
  profile: 'JEDEC' | 'XMP' | 'DOCP' | 'EXPO';
  voltage: number;                   // Operating voltage
  heatspreader: boolean;
  rgb: boolean;
  
  // Compatibility
  intelSupport: boolean;
  amdSupport: boolean;
  recommendedUse: 'Gaming' | 'Office' | 'Content Creation' | 'Server';
}
```

### 2.5 Storage Rules
```typescript
interface StorageProduct {
  type: 'SSD' | 'HDD';
  interface: 'SATA' | 'NVMe' | 'PCIe';
  formFactor: '2.5"' | '3.5"' | 'M.2 2280' | 'M.2 2242';
  capacity: number;                  // In GB
  
  // Performance (SSD specific)
  readSpeed?: number;                // MB/s
  writeSpeed?: number;               // MB/s
  tbw?: number;                      // Terabytes Written
  controller?: string;               // Controller type
  nandType?: 'TLC' | 'QLC' | 'MLC' | 'SLC';
  
  // Performance (HDD specific)
  rpm?: 5400 | 7200 | 10000;        // Rotational speed
  cache?: number;                    // Cache in MB
  
  // Use cases
  useCase: 'OS Drive' | 'Storage' | 'Gaming' | 'Enterprise' | 'Surveillance';
}
```

### 2.6 VGA (Card Đồ Họa) Rules
```typescript
interface VGAProduct {
  // Core specs
  brand: 'NVIDIA' | 'AMD';
  chipset: string;                   // RTX 4070, RX 7800 XT
  vram: number;                      // VRAM in GB
  vramType: 'GDDR6' | 'GDDR6X';
  memoryBus: number;                 // Memory bus width
  
  // Performance
  baseClock: number;                 // Base clock in MHz
  boostClock: number;                // Boost clock in MHz
  memoryClock: number;               // Memory clock in MHz
  
  // Power and cooling
  tdp: number;                       // Power consumption in Watts
  recommendedPSU: number;            // Minimum PSU wattage
  powerConnectors: string[];         // 8-pin, 6-pin connectors
  
  // Physical
  length: number;                    // Card length in mm
  width: number;                     // Card width in mm
  height: number;                    // Card height in mm
  slots: number;                     // PCI slots occupied
  
  // Features
  rayTracing: boolean;
  dlss?: boolean;                    // NVIDIA only
  fsr?: boolean;                     // AMD only
  
  // Target performance
  targetResolution: '1080p' | '1440p' | '4K';
  targetFramerate: '60fps' | '120fps' | '144fps+';
}
```

### 2.7 PSU (Nguồn Máy Tính) Rules
```typescript
interface PSUProduct {
  // Power specs
  wattage: number;                   // Total wattage
  efficiency: '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | '80+ Titanium';
  modular: 'Non-modular' | 'Semi-modular' | 'Full-modular';
  
  // Connectors
  mainboard24Pin: number;            // 24-pin connectors
  cpu8Pin: number;                   // 8-pin CPU connectors
  cpu4Pin: number;                   // 4-pin CPU connectors
  pcie8Pin: number;                  // 8-pin PCIe connectors
  pcie6Pin: number;                  // 6-pin PCIe connectors
  sata: number;                      // SATA power connectors
  molex: number;                     // Molex connectors
  
  // Physical and features
  fanSize: 120 | 140;                // Fan size in mm
  formFactor: 'ATX' | 'SFX' | 'SFX-L';
  warranty: number;                  // Warranty in years
  
  // Safety and certifications
  protections: string[];             // OVP, UVP, OCP, SCP, OTP
  certifications: string[];          // 80+, CE, FCC
}
```

### 2.8 Case (Vỏ Máy) Rules
```typescript
interface CaseProduct {
  // Size and compatibility
  formFactor: 'Full Tower' | 'Mid Tower' | 'Mini-ITX' | 'Micro-ATX';
  motherboardSupport: string[];      // ATX, Micro-ATX, Mini-ITX
  maxGPULength: number;              // Max GPU length in mm
  maxCPUCoolerHeight: number;        // Max cooler height in mm
  maxPSULength: number;              // Max PSU length in mm
  
  // Drive bays
  drive35Bays: number;               // 3.5" drive bays
  drive25Bays: number;               // 2.5" drive bays
  
  // Expansion and I/O
  expansionSlots: number;            // PCIe expansion slots
  frontUSB: {
    usb2: number;
    usb3: number;
    usbC: number;
  };
  frontAudio: boolean;
  
  // Airflow and cooling
  frontFanSlots: string[];           // 120mm, 140mm slots
  topFanSlots: string[];
  rearFanSlots: string[];
  bottomFanSlots: string[];
  radiatorSupport: string[];         // 240mm, 280mm, 360mm
  
  // Build quality
  material: 'Steel' | 'Aluminum' | 'Tempered Glass';
  sidePanelType: 'Solid' | 'Mesh' | 'Tempered Glass';
  cableManagement: boolean;
  toolless: boolean;
}
```

### 2.9 PC Build Categories Rules
```typescript
// Gaming PC Build Rules
interface GamingPCBuild {
  category: 'gaming';
  subcategory: 'entry-level' | 'mid-range' | 'high-end' | 'enthusiast';
  targetResolution: '1080p' | '1440p' | '4K';
  targetFramerate: '60fps' | '120fps' | '144fps+';
  rayTracingRequired: boolean;
  vr Ready: boolean;
  streaming: boolean;
  rgb: boolean;
  
  // Component priorities
  gpuBudgetPercent: number;          // 40-60% of total budget
  cpuGpuRatio: 'balanced' | 'gpu-focused' | 'cpu-focused';
}

// Office PC Build Rules
interface OfficePCBuild {
  category: 'office';
  subcategory: 'basic' | 'productivity' | 'workstation';
  multiMonitorSupport: number;       // Number of monitors
  storageType: 'SSD-only' | 'Hybrid' | 'HDD-primary';
  integratedGraphics: boolean;
  upgradeability: 'limited' | 'moderate' | 'extensive';
  energyEfficiency: 'standard' | 'high';
  
  // Business requirements
  tpmRequired: boolean;
  secureBootRequired: boolean;
  enterpriseFeatures: boolean;
}

// Content Creation PC Build Rules
interface CreationPCBuild {
  category: 'content-creation';
  workload: 'video-editing' | 'photo-editing' | '3d-rendering' | 'streaming' | 'mixed';
  ramRequirement: number;            // Minimum RAM in GB
  storageSpeed: 'standard' | 'high' | 'extreme';
  colorAccuracy: boolean;
  cpuCores: 'priority-high';         // CPU cores are priority
  
  // Professional requirements
  eccMemorySupport: boolean;
  professionalGPU: boolean;
  redundantStorage: boolean;
}
```

### 2.10 Build Validation Rules
```typescript
interface ComprehensiveBuildValidation {
  // Hardware compatibility
  socketCompatibility: boolean;      // CPU ↔ Motherboard
  ramTypeCompatibility: boolean;     // DDR4/DDR5 match
  ramCapacityCheck: boolean;         // Total <= motherboard max
  ramSpeedSupport: boolean;          // Speed supported by motherboard
  
  // Power requirements
  totalPowerDraw: number;           // Total system power draw
  psuWattageCheck: boolean;         // PSU >= total power + 20% headroom
  psuConnectorCheck: boolean;       // All required connectors available
  
  // Physical compatibility
  gpuClearanceCheck: boolean;       // GPU fits in case
  cpuCoolerClearanceCheck: boolean; // Cooler height fits in case
  ramClearanceCheck: boolean;       // RAM fits under cooler
  storageBayCheck: boolean;         // Enough storage bays
  
  // Performance validation
  cpuGpuBalance: 'balanced' | 'cpu-bottleneck' | 'gpu-bottleneck';
  coolingAdequacy: 'adequate' | 'marginal' | 'insufficient';
  psuEfficiencyCheck: '80+' | 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Warnings and recommendations
  bottleneckWarnings: string[];
  upgradeRecommendations: string[];
  performanceEstimates: {
    gaming1080p?: number;           // FPS estimate
    gaming1440p?: number;
    gaming4k?: number;
    renderScore?: number;           // Rendering performance score
  };
}
```

---

## 🎨 3. UI/UX DESIGN RULES

### 3.1 Vietnamese UI Standards
- **Currency**: Chỉ hiển thị VND, format: "1.999.000 ₫"
- **Date Format**: DD/MM/YYYY hoặc DD tháng MM năm YYYY
- **Language**: 100% tiếng Việt, không mixed English-Vietnamese
- **Typography**: Sans-serif fonts, readable cho technical specs
- **Color Coding**: 
  - ✅ Xanh lá: Compatible, In Stock, Profitable
  - ❌ Đỏ: Incompatible, Out of Stock, Loss
  - ⚠️ Vàng: Warning, Low Stock, Manual Check Required
  - 🔵 Xanh dương: Information, Premium Products
  - 🟡 Cam: Gaming Products, High Performance

### 3.2 POS Interface Design Rules
```typescript
interface POSInterfaceRules {
  // Main POS Screen Layout
  productGrid: {
    maxColumns: 6;                  // Max 6 products per row
    minTouchTarget: 44;             // 44px minimum touch target
    quickAccessRows: 2;             // Top 2 rows for popular items
    categoryFilters: 'top' | 'left'; // Category filter position
  };
  
  // Shopping Cart Design
  cart: {
    position: 'right' | 'bottom';   // Cart position
    alwaysVisible: boolean;         // Cart always visible
    maxItems: 50;                   // Max items in cart
    realTimeCalculation: boolean;   // Real-time price updates
    compatibilityCheck: 'live';     // Live compatibility checking
  };
  
  // Search and Filter Interface
  search: {
    debounceTime: 300;              // Search debounce in ms
    maxResults: 50;                 // Max search results shown
    searchFields: ['name', 'model', 'brand', 'sku'];
    filterTypes: ['brand', 'category', 'priceRange', 'inStock'];
  };
}
```

### 3.3 Product Display Rules
```typescript
interface ProductDisplayRules {
  // Product Card Design
  productCard: {
    imageRatio: '1:1' | '4:3';     // Image aspect ratio
    maxNameLength: 60;              // Max characters in product name
    keySpecsCount: 3;               // Max key specs shown
    priceProminence: 'large';       // Price display size
    stockIndicator: 'badge' | 'text';
    compatibilityIndicator: boolean; // Show compatibility status
  };
  
  // Product Detail Page
  productDetail: {
    imageGallery: 'carousel' | 'grid';
    specificationTable: boolean;   // Always show full specs table
    compatibilitySection: boolean; // Dedicated compatibility section
    relatedProducts: number;       // Number of related products (max 8)
    buildSuggestions: boolean;      // Show suggested PC builds
  };
  
  // Build Configurator Interface
  buildConfigurator: {
    layout: 'sidebar' | 'tabs';     // Component selection layout
    realTimePricing: boolean;       // Real-time price updates
    compatibilityWarnings: 'modal' | 'inline' | 'sidebar';
    performanceEstimate: boolean;   // Show performance estimates
    powerCalculation: boolean;      // Show power consumption
    saveConfig: boolean;            // Allow saving configurations
  };
}
```

### 3.4 Vietnamese Business UI Elements
```typescript
interface VietnameseBusinessUI {
  // Invoice and Receipt Layout
  invoice: {
    vatDisplay: 'included' | 'separate' | 'both';
    companyInfo: {
      name: string;
      address: string;
      taxCode: string;
      hotline: string;
    };
    paymentMethods: [
      'Tiền mặt',
      'Chuyển khoản',
      'QR Code',
      'Thẻ ATM',
      'Trả góp'
    ];
  };
  
  // Customer Information
  customer: {
    requiredFields: ['name', 'phone'];
    optionalFields: ['email', 'address', 'company'];
    loyaltyProgram: boolean;
    segmentation: [
      'Gamer',
      'Văn phòng', 
      'Content Creator',
      'Học sinh/Sinh viên',
      'Doanh nghiệp'
    ];
  };
  
  // Staff Interface
  staff: {
    roleBasedAccess: boolean;
    performanceTracking: boolean;
    commissionCalculation: boolean;
    scheduleManagement: boolean;
  };
}
```

### 3.5 Mobile Responsive Rules
```typescript
interface MobileRules {
  // Breakpoints (using Tailwind)
  breakpoints: {
    sm: '640px';                    // Small devices
    md: '768px';                    // Medium devices  
    lg: '1024px';                   // Large devices
    xl: '1280px';                   // Extra large devices
  };
  
  // Touch Interface
  touch: {
    minTouchTarget: 44;             // 44px minimum
    gestureSupport: ['swipe', 'pinch', 'tap'];
    hapticFeedback: boolean;        // Vibration feedback
  };
  
  // Mobile POS Interface
  mobilePOS: {
    singleColumnLayout: boolean;    // Single column on mobile
    expandableCart: boolean;        // Expandable cart drawer
    quickActions: ['search', 'scan', 'cart', 'customer'];
    swipeGestures: {
      addToCart: 'swipe-right';
      viewDetails: 'tap';
      removeItem: 'swipe-left';
    };
  };
}
```

---

## ⚡ 4. PERFORMANCE & OPTIMIZATION (CLOUDFLARE FREE TIER)

### 4.1 Cloudflare Free Tier Limits & Optimization
```typescript
interface CloudflareLimits {
  workers: {
    requestsPerDay: 100000;         // 100k requests/day limit
    cpuTimePerRequest: 10;          // 10ms CPU time limit
    memoryLimit: 128;               // 128MB memory limit
    
    optimization: {
      batchDatabaseQueries: boolean; // Batch multiple queries
      cacheApiResponses: boolean;    // Cache in KV storage
      minimizeWorkerCalls: boolean;  // Use static pages when possible
      asyncProcessing: boolean;      // Use queues for heavy tasks
    };
  };
  
  d1Database: {
    storageLimit: 5;                // 5GB storage limit
    rowReadsPerDay: 25000000;       // 25M row reads/day
    rowWritesPerDay: 100000;        // 100k row writes/day
    
    optimization: {
      indexing: 'aggressive';        // Index all foreign keys
      queryOptimization: boolean;    // Optimize queries for minimal reads
      dataArchiving: boolean;        // Archive old data
      batchWrites: boolean;          // Batch multiple writes
    };
  };
  
  kvStorage: {
    readsPerDay: 100000;           // 100k reads/day
    writesPerDay: 1000;            // 1k writes/day
    storageLimit: 1;               // 1GB storage limit
    
    optimization: {
      cacheStrategy: 'intelligent';  // Cache frequently accessed data
      ttlManagement: boolean;        // Proper TTL for different data types
      compressionEnabled: boolean;   // Compress large values
    };
  };
  
  r2Storage: {
    storageLimit: 10;              // 10GB/month
    classAOperations: 1000000;     // 1M operations/month
    
    optimization: {
      imageOptimization: boolean;    // WebP format, compression
      cdnCaching: boolean;          // Cache static assets
      lazyLoading: boolean;         // Load images on demand
    };
  };
  
  bandwidth: {
    limitPerMonth: 100;            // 100GB/month
    
    optimization: {
      staticFirst: boolean;         // Maximize static content
      minification: boolean;        // Minify CSS, JS
      compression: boolean;         // Gzip/Brotli compression
    };
  };
}
```

### 4.2 Static-First Architecture Rules
```typescript
interface StaticFirstRules {
  // Astro Static Generation
  astroConfig: {
    output: 'static' | 'hybrid';    // Prefer static where possible
    adapter: '@astrojs/cloudflare'; // Cloudflare adapter
    prerender: boolean;             // Prerender static pages
    
    staticPages: [
      'product catalogs',           // Product listing pages
      'category pages',             // Category browsing
      'product detail pages',       // Individual product pages
      'documentation',              // Help and docs
      'about/contact pages'         // Company info
    ];
    
    dynamicPages: [
      'POS interface',              // Real-time POS system
      'inventory management',       // Admin functions
      'reports dashboard',          // Dynamic reports
      'user authentication'        // Auth-protected pages
    ];
  };
  
  // Client-Side State Management
  clientState: {
    storage: 'localStorage' | 'sessionStorage';
    stateManagement: 'nanostores' | 'zustand';
    
    localData: [
      'shopping cart',              // Cart persistence
      'user preferences',           // UI preferences
      'recent searches',            // Search history
      'build configurations',       // Saved PC builds
      'offline product cache'       // Basic product info
    ];
  };
  
  // Caching Strategy
  caching: {
    productData: {
      ttl: 3600;                   // 1 hour for product data
      storage: 'KV';
      invalidation: 'manual';       // Manual cache invalidation
    };
    
    compatibilityMatrix: {
      ttl: 86400;                  // 24 hours for compatibility data
      storage: 'KV';
      invalidation: 'scheduled';    // Daily updates
    };
    
    userSessions: {
      ttl: 1800;                   // 30 minutes for sessions
      storage: 'KV';
      encryption: boolean;          // Encrypt sensitive data
    };
  };
}
```

### 4.3 Database Optimization Rules
```typescript
interface DatabaseOptimization {
  // Query Optimization
  queries: {
    indexStrategy: {
      primaryKeys: boolean;         // All tables have primary keys
      foreignKeys: boolean;         // Index all foreign key columns
      searchFields: boolean;        // Index searchable fields
      compositeIndexes: boolean;    // Multi-column indexes for complex queries
    };
    
    queryPatterns: {
      pagination: 'LIMIT/OFFSET';   // Use pagination for large results
      joins: 'minimize';            // Minimize JOIN operations
      aggregation: 'cache';         // Cache aggregated results
      fullTextSearch: 'separate';   // Separate search index
    };
    
    dataTypes: {
      prices: 'INTEGER';            // Store VND as integers (no decimals)
      timestamps: 'ISO8601';        // ISO8601 timestamp format
      boolean: 'INTEGER';           // SQLite boolean as 0/1
      json: 'TEXT';                 // JSON as TEXT in SQLite
    };
  };
  
  // Data Lifecycle Management
  lifecycle: {
    archiving: {
      oldOrders: 365;               // Archive orders after 1 year
      auditLogs: 90;                // Archive logs after 90 days
      reportData: 180;              // Archive reports after 6 months
    };
    
    cleanup: {
      temporaryData: 24;            // Clean temp data after 24 hours
      sessions: 30;                 // Clean expired sessions after 30 days
      cacheData: 7;                 // Clean old cache after 7 days
    };
  };
}
```

### 4.4 API Performance Rules
```typescript
interface APIPerformanceRules {
  // Request Optimization
  requests: {
    batchingEnabled: boolean;       // Batch multiple API calls
    compressionEnabled: boolean;    // Gzip response compression
    cachingHeaders: boolean;        // Proper cache headers
    
    rateLimiting: {
      perUser: 1000;               // 1000 requests per user per hour
      perEndpoint: 100;            // 100 requests per endpoint per minute
      burstAllowance: 10;          // 10 request burst allowance
    };
  };
  
  // Response Optimization  
  responses: {
    pagination: {
      defaultLimit: 20;            // Default 20 items per page
      maxLimit: 100;               // Maximum 100 items per page
      totalCountOptional: boolean; // Don't always calculate total count
    };
    
    fieldSelection: boolean;       // Allow field selection in API
    dataCompression: boolean;      // Compress large responses
    errorHandling: 'structured';   // Structured error responses
  };
  
  // Background Processing
  backgroundTasks: {
    reportGeneration: 'queue';     // Queue heavy report generation
    inventorySync: 'scheduled';    // Scheduled inventory synchronization
    dataBackup: 'automated';       // Automated backup tasks
    analytics: 'batched';          // Batch analytics processing
  };
}
```

### 4.5 Frontend Performance Rules
```typescript
interface FrontendPerformanceRules {
  // Asset Optimization
  assets: {
    images: {
      format: 'webp' | 'avif';     // Modern image formats
      quality: 85;                 // 85% quality for balance
      lazyLoading: boolean;        // Lazy load below-fold images
      placeholder: 'blur' | 'skeleton';
    };
    
    javascript: {
      bundleSplitting: boolean;    // Split bundles by route
      treeShaking: boolean;        // Remove unused code
      minification: boolean;       // Minify production code
      compression: 'brotli';       // Brotli compression
    };
    
    css: {
      purging: boolean;            // Remove unused CSS
      criticalCSS: boolean;        // Inline critical CSS
      preloading: boolean;         // Preload important CSS
    };
  };
  
  // Loading Performance
  loading: {
    // Core Web Vitals targets
    firstContentfulPaint: 1.5;    // < 1.5s FCP
    largestContentfulPaint: 2.5;   // < 2.5s LCP
    firstInputDelay: 100;          // < 100ms FID
    cumulativeLayoutShift: 0.1;    // < 0.1 CLS
    
    // Loading strategies
    preloading: ['fonts', 'critical-css', 'hero-images'];
    prefetching: ['next-page', 'likely-pages'];
    lazyLoading: ['below-fold-images', 'unused-components'];
  };
  
  // Progressive Enhancement
  progressiveEnhancement: {
    coreExperience: 'html-css';    // Works without JavaScript
    enhancedExperience: 'javascript'; // Enhanced with JavaScript
    offlineSupport: 'basic';       // Basic offline functionality
    
    gracefulDegradation: boolean;  // Degrade gracefully on errors
    featureDetection: boolean;     // Detect browser features
    polyfills: 'minimal';          // Minimal polyfills only
  };
}
```

---

## 🔒 5. BẢO MẬT & QUYỀN RIÊNG TƯ

### 5.1 Data Security Rules
- **Authentication**: JWT tokens với 24h expiry
- **Authorization**: Role-based access control (Admin, Staff, Viewer)
- **Data Encryption**: Sensitive data encrypted at rest và in transit
- **Audit Logging**: Log tất cả price changes, inventory adjustments, user actions
- **Input Validation**: Sanitize tất cả user inputs, validate against schemas

### 5.2 Financial Data Protection
- **Price Data**: Encrypt wholesale prices, margin calculations
- **Customer Data**: GDPR-compliant data handling
- **Transaction Logs**: Immutable logging cho tất cả sales transactions
- **Backup Strategy**: Daily encrypted backups với 30-day retention

### 5.3 Access Control Matrix
```typescript
type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

interface PermissionMatrix {
  'admin': ['*'];                           // Full access
  'manager': ['read:*', 'write:products', 'write:customers', 'read:reports'];
  'staff': ['read:products', 'write:orders', 'read:customers'];
  'viewer': ['read:products', 'read:inventory'];
}
```

---

## 📊 6. QUẢN LÝ DỮ LIỆU

### 6.1 Database Design Rules
- **Normalization**: 3NF minimum, denormalize chỉ khi performance requires
- **Indexing**: Index cho tất cả foreign keys và search fields
- **Data Types**: Sử dụng appropriate data types (DECIMAL cho prices, không FLOAT)
- **Constraints**: Enforce data integrity với database constraints
- **Migrations**: All schema changes qua versioned migrations

### 6.2 Product Data Management
```sql
-- Required product table structure
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  price_retail DECIMAL(12,0) NOT NULL,  -- VND
  price_wholesale DECIMAL(12,0),        -- VND
  specifications JSON NOT NULL,
  compatibility_info JSON,
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT CHECK (stock_status IN ('in-stock', 'low-stock', 'out-of-stock')),
  warranty_months INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 Inventory Tracking Rules
- **Serial Numbers**: Track cho high-value items (CPU, GPU, Motherboard)
- **Batch Tracking**: Group products theo supplier batch
- **FIFO Rule**: First In, First Out cho inventory movement
- **Stock Alerts**: Auto-alert khi stock < minimum threshold
- **Movement Logging**: Log tất cả stock changes với timestamp và user

---

## 🔧 7. COMPATIBILITY & VALIDATION

### 7.1 Component Compatibility Rules
```typescript
interface CompatibilityRules {
  // CPU ↔ Motherboard
  cpuMotherboard: {
    socketMatch: boolean;           // Must match exactly
    chipsetSupport: boolean;        // CPU supported by chipset
    biosVersion?: string;           // BIOS version requirements
  };
  
  // RAM ↔ Motherboard  
  ramMotherboard: {
    ddrTypeMatch: boolean;          // DDR4/DDR5 compatibility
    maxCapacityCheck: boolean;      // Total capacity <= motherboard max
    speedSupport: boolean;          // Speed supported by motherboard
    slotsAvailable: boolean;        // Physical slots available
  };
  
  // GPU ↔ System
  gpuSystem: {
    psuWattageCheck: boolean;       // PSU >= GPU + system requirements
    physicalClearance: boolean;     // GPU fits in case
    pcieLanes: boolean;             // Sufficient PCIe lanes
  };
  
  // Cooling Requirements
  cooling: {
    cpuTdpCheck: boolean;           // Cooler TDP >= CPU TDP
    caseAirflow: boolean;           // Adequate case ventilation
    clearanceCheck: boolean;        // Cooler fits in case
  };
}
```

### 7.2 Build Validation Workflow
1. **Component Selection**: Validate mỗi component addition
2. **Real-time Validation**: Show compatibility status instantly
3. **Warning System**: Progressive warnings (info → warning → error)
4. **Suggestion Engine**: Suggest compatible alternatives
5. **Final Validation**: Complete system check before checkout

### 7.3 Performance Estimation
- **Gaming Performance**: FPS estimates cho popular games
- **Workstation Performance**: Render times, encode speeds
- **Power Consumption**: Wattage under load và idle
- **Thermal Estimates**: Temperature ranges under typical loads

---

## 🇻🇳 8. LOCALIZATION (VIETNAM)

### 8.1 Currency & Pricing
- **Primary Currency**: VND only
- **Price Format**: "1.999.000 ₫" (period separators)
- **Tax Display**: VAT included in displayed prices
- **Margin Calculation**: Support both markup và margin percentages
- **Exchange Rates**: USD to VND for import pricing (daily updates)

### 8.2 Vietnamese Business Rules
- **Invoice Compliance**: E-invoice standards theo Thông tư 78/2021/TT-BTC
- **VAT Rates**: 10% standard, 8% for certain products
- **Warranty Terms**: Vietnamese consumer protection law compliance
- **Return Policy**: 7-day return policy theo Luật Bảo vệ quyền lợi người tiêu dùng
- **Business Hours**: Support Vietnamese business hour formats

### 8.3 Language Standards
```typescript
// Standardized terminology
const VIETNAMESE_TERMS = {
  // Hardware
  'CPU': 'Bộ vi xử lý',
  'GPU/VGA': 'Card đồ họa', 
  'RAM': 'Bộ nhớ',
  'Motherboard': 'Bo mạch chủ',
  'PSU': 'Nguồn máy tính',
  'Storage': 'Ổ cứng',
  'Case': 'Vỏ máy',
  'Cooling': 'Tản nhiệt',
  
  // Business
  'Stock': 'Tồn kho',
  'Warranty': 'Bảo hành',
  'Receipt': 'Hóa đơn',
  'Customer': 'Khách hàng',
  'Staff': 'Nhân viên',
} as const;
```

---

## 🚀 9. DEPLOYMENT & INFRASTRUCTURE

### 9.1 Cloudflare Deployment Rules
```yaml
# Required environment setup
environments:
  development:
    workers: unlimited invocations locally
    d1: local SQLite database
    kv: local key-value storage
    
  production:
    workers: respect free tier limits
    d1: single production database
    kv: production cache storage
    pages: static asset hosting
```

### 9.2 CI/CD Pipeline Rules
- **Testing**: Unit tests required trước khi merge
- **Build Optimization**: Bundle size < 500KB per route
- **Database Migrations**: Auto-run migrations on deployment
- **Environment Validation**: Validate environment variables
- **Rollback Strategy**: Auto-rollback on critical errors

### 9.3 Monitoring & Alerting
- **Error Tracking**: Log application errors với stack traces
- **Performance Monitoring**: Track Core Web Vitals
- **Business Metrics**: Daily sales, inventory levels, user activity
- **Uptime Monitoring**: 99.9% uptime target
- **Alert Thresholds**: Define alert rules cho critical metrics

---

## 🧪 10. TESTING STANDARDS

### 10.1 Unit Testing Rules
```typescript
// Required test coverage
interface TestCoverage {
  utils: 100%;              // All utility functions
  compatibility: 100%;      // All compatibility logic
  calculations: 100%;       // Price, power, performance calculations
  components: 80%;          // UI components
  integrations: 70%;        // API integrations
}
```

### 10.2 Integration Testing
- **Database Operations**: Test all CRUD operations
- **API Endpoints**: Test all Worker endpoints
- **Build Validation**: Test complete build workflows
- **Payment Processing**: Test payment flows end-to-end
- **Inventory Management**: Test stock operations

### 10.3 E2E Testing Scenarios
```typescript
const E2E_SCENARIOS = [
  'complete_pc_build_purchase',      // Full build → checkout flow
  'component_compatibility_check',   // Compatibility validation
  'inventory_management_workflow',   // Stock updates → alerts
  'customer_purchase_history',       // Customer journey tracking
  'staff_daily_operations',         // POS daily workflows
  'admin_reporting_dashboard',      // Management reporting
] as const;
```

---

## 📋 11. CODE REVIEW CHECKLIST

### 11.1 Pre-Merge Requirements
- [ ] TypeScript compilation without errors
- [ ] All tests passing (unit + integration)
- [ ] Performance impact assessed
- [ ] Security review completed
- [ ] Accessibility check performed
- [ ] Mobile responsiveness verified
- [ ] Vietnamese localization verified
- [ ] Database migration tested

### 11.2 Code Quality Standards
- [ ] Functions have clear, descriptive names
- [ ] Complex logic has inline comments
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Loading states handled
- [ ] Edge cases considered
- [ ] Performance optimized
- [ ] Security best practices followed

---

## 🎯 12. BUSINESS LOGIC RULES - COMPUTER STORE SPECIALIZED

### 12.1 POS System Business Rules
```typescript
interface POSBusinessRules {
  // Sales Transaction Rules
  sales: {
    // Component compatibility checking during sale
    compatibilityValidation: {
      mandatory: boolean;           // Must check compatibility before sale
      warningLevel: 'block' | 'warn' | 'allow';
      overridePermission: 'manager' | 'admin';
    };
    
    // PC Build sales
    buildSales: {
      assemblyService: {
        feeStructure: 'flat' | 'percentage' | 'tiered';
        baseFee: number;            // Base assembly fee in VND
        complexityMultiplier: number; // Multiplier for complex builds
        testingIncluded: boolean;   // Include testing in assembly
        warrantyPeriod: number;     // Assembly warranty in months
      };
      
      componentWiseSale: {
        individualWarranty: boolean; // Each component has separate warranty
        bulkDiscount: boolean;      // Discount for buying multiple components
        compatibilityGuarantee: boolean; // Guarantee compatibility
      };
    };
    
    // Pricing rules
    pricing: {
      dynamicPricing: boolean;      // Price changes based on stock/demand
      competitorPriceMatch: boolean; // Match competitor prices
      loyaltyDiscounts: {
        enabled: boolean;
        tiers: ['bronze', 'silver', 'gold', 'platinum'];
        discountPercentage: number[]; // Discount for each tier
      };
      
      bulkPricing: {
        enabled: boolean;
        thresholds: number[];       // Quantity thresholds
        discounts: number[];        // Discount percentages
      };
    };
  };
  
  // Customer segmentation and targeting
  customerSegmentation: {
    gamer: {
      characteristics: ['high-end GPU', 'RGB preference', 'performance-focused'];
      targetProducts: ['RTX 4080+', 'high-refresh monitors', 'mechanical keyboards'];
      marketingApproach: 'performance-focused';
      averageOrderValue: number;   // Expected AOV in VND
    };
    
    office: {
      characteristics: ['budget-conscious', 'reliability-focused', 'bulk-orders'];
      targetProducts: ['business PCs', 'productivity monitors', 'office peripherals'];
      marketingApproach: 'cost-efficiency';
      contractTerms: boolean;      // Support contract terms
    };
    
    contentCreator: {
      characteristics: ['workstation-grade', 'color-accuracy', 'high-memory'];
      targetProducts: ['Quadro/Radeon Pro', 'high-res monitors', 'professional audio'];
      marketingApproach: 'professional-tools';
      consultationRequired: boolean; // Require technical consultation
    };
    
    student: {
      characteristics: ['budget-limited', 'portable', 'educational-discount'];
      targetProducts: ['entry-level builds', 'laptops', 'basic peripherals'];
      marketingApproach: 'value-proposition';
      educationalDiscount: number; // Discount percentage
    };
  };
}
```

### 12.2 Inventory Management Business Rules
```typescript
interface InventoryBusinessRules {
  // Stock level management
  stockManagement: {
    // Minimum stock levels by category
    minimumStockLevels: {
      cpu: number;                  // Minimum CPU units in stock
      gpu: number;                  // Minimum GPU units in stock
      ram: number;                  // Minimum RAM kits in stock
      storage: number;              // Minimum storage units in stock
      motherboard: number;          // Minimum motherboard units
      psu: number;                  // Minimum PSU units
      case: number;                 // Minimum case units
      cooling: number;              // Minimum cooling units
    };
    
    // Reorder points and quantities
    reorderRules: {
      leadTime: number;             // Supplier lead time in days
      safetyStock: number;          // Safety stock percentage
      economicOrderQuantity: boolean; // Use EOQ calculation
      seasonalAdjustment: boolean;  // Adjust for seasonal patterns
    };
    
    // ABC analysis for inventory prioritization
    abcAnalysis: {
      aItems: {                     // High-value, low-volume
        percentage: 20;
        stockTurns: 12;             // Expected stock turns per year
        serviceLevel: 99;           // Target service level percentage
      };
      bItems: {                     // Medium-value, medium-volume
        percentage: 30;
        stockTurns: 8;
        serviceLevel: 95;
      };
      cItems: {                     // Low-value, high-volume
        percentage: 50;
        stockTurns: 4;
        serviceLevel: 90;
      };
    };
  };
  
  // Supplier management
  supplierManagement: {
    // Supplier evaluation criteria
    evaluation: {
      priceCompetitiveness: number; // Weight in evaluation (0-1)
      deliveryReliability: number;  // Weight in evaluation (0-1)
      productQuality: number;       // Weight in evaluation (0-1)
      paymentTerms: number;         // Weight in evaluation (0-1)
      technicalSupport: number;     // Weight in evaluation (0-1)
    };
    
    // Purchase order automation
    poAutomation: {
      autoGenerate: boolean;        // Auto-generate POs
      approvalRequired: boolean;    // Require approval for POs
      approvalThreshold: number;    // Approval threshold in VND
      preferredSuppliers: string[]; // List of preferred suppliers
    };
  };
  
  // Warranty and RMA management
  warrantyManagement: {
    warrantyTypes: {
      local: {
        period: number;             // Local warranty period in months
        coverage: 'full' | 'limited';
        replacementPolicy: 'immediate' | 'repair-first';
      };
      international: {
        period: number;             // International warranty period
        coverage: 'manufacturer';
        processingTime: number;     // Processing time in days
      };
    };
    
    rmaProcess: {
      customerInitiated: boolean;   // Customers can initiate RMA
      staffValidation: boolean;     // Staff must validate RMA
      advanceReplacement: boolean;  // Offer advance replacement
      shippingCoverage: 'customer' | 'store' | 'manufacturer';
    };
  };
}
```

### 12.3 Build Configuration Business Rules
```typescript
interface BuildConfigurationRules {
  // Compatibility matrix management
  compatibilityMatrix: {
    // CPU-Motherboard compatibility
    cpuMotherboard: {
      socketMatching: 'strict';     // Strict socket matching
      chipsetValidation: boolean;   // Validate chipset compatibility
      biosRequirements: boolean;    // Check BIOS requirements
      generationSupport: boolean;   // Check generation support
    };
    
    // Memory compatibility
    memoryCompatibility: {
      speedValidation: boolean;     // Validate memory speed support
      capacityLimits: boolean;      // Check capacity limits
      timingOptimization: boolean;  // Suggest optimal timings
      dualChannelOptimization: boolean; // Optimize for dual channel
    };
    
    // Power supply calculations
    powerCalculations: {
      baseSystemPower: number;      // Base system power consumption
      cpuPowerMultiplier: number;   // CPU power multiplier
      gpuPowerAddition: number;     // GPU power addition
      peripheralPower: number;      // Peripheral power consumption
      efficiencyLoss: number;       // PSU efficiency loss percentage
      safetyMargin: number;         // Safety margin percentage
    };
  };
  
  // Build templates and presets
  buildTemplates: {
    gaming: {
      budgetRanges: ['entry', 'mid-range', 'high-end', 'enthusiast'];
      performanceTargets: {
        entry: { resolution: '1080p', fps: 60, settings: 'medium' };
        midRange: { resolution: '1440p', fps: 60, settings: 'high' };
        highEnd: { resolution: '1440p', fps: 144, settings: 'ultra' };
        enthusiast: { resolution: '4K', fps: 60, settings: 'ultra' };
      };
    };
    
    productivity: {
      workloads: ['office', 'content-creation', 'development', 'design'];
      specifications: {
        office: { ram: '8-16GB', storage: 'SSD', gpu: 'integrated' };
        contentCreation: { ram: '32GB+', storage: 'fast-SSD', gpu: 'professional' };
        development: { ram: '16-32GB', storage: 'SSD', gpu: 'mid-range' };
        design: { ram: '32GB+', storage: 'SSD+HDD', gpu: 'high-end' };
      };
    };
  };
  
  // Performance estimation
  performanceEstimation: {
    gamingPerformance: {
      benchmarkDatabase: boolean;   // Use benchmark database for estimates
      gameSpecificFPS: boolean;     // Game-specific FPS estimates
      settingsOptimization: boolean; // Suggest optimal game settings
      futureProofing: boolean;      // Consider future game requirements
    };
    
    workstationPerformance: {
      renderingScores: boolean;     // Rendering performance scores
      compressionTimes: boolean;    // Video compression estimates
      compilationTimes: boolean;    // Code compilation estimates
      multitaskingCapability: boolean; // Multitasking performance
    };
  };
}
```

### 12.4 Pricing Strategy Business Rules
```typescript
interface PricingStrategyRules {
  // Margin management
  marginManagement: {
    // Category-based margins
    categoryMargins: {
      cpu: { min: 5, target: 12, max: 20 };        // CPU margins in percentage
      gpu: { min: 8, target: 15, max: 25 };        // GPU margins
      motherboard: { min: 10, target: 18, max: 30 }; // Motherboard margins
      memory: { min: 12, target: 20, max: 35 };    // Memory margins
      storage: { min: 15, target: 25, max: 40 };   // Storage margins
      psu: { min: 10, target: 20, max: 35 };       // PSU margins
      case: { min: 20, target: 30, max: 50 };      // Case margins
      peripherals: { min: 25, target: 40, max: 60 }; // Peripheral margins
    };
    
    // Dynamic margin adjustment
    dynamicPricing: {
      stockLevelImpact: boolean;    // Adjust margins based on stock levels
      demandBasedPricing: boolean;  // Adjust based on demand
      competitorTracking: boolean;  // Track competitor prices
      seasonalAdjustments: boolean; // Seasonal price adjustments
    };
  };
  
  // Promotional pricing
  promotionalPricing: {
    // Bundle deals
    bundles: {
      cpuMotherboardCombo: number;  // Discount for CPU+Motherboard combo
      completeSystemBundle: number; // Discount for complete system
      peripheralBundle: number;     // Discount for peripheral bundles
      upgradeBundle: number;        // Discount for upgrade bundles
    };
    
    // Loyalty program
    loyaltyProgram: {
      pointsEarningRate: number;    // Points per VND spent
      pointsRedemptionRate: number; // VND value per point
      tierBenefits: {
        bronze: { discount: 2, specialOffers: false };
        silver: { discount: 5, specialOffers: true };
        gold: { discount: 8, specialOffers: true };
        platinum: { discount: 12, specialOffers: true };
      };
    };
    
    // Seasonal promotions
    seasonalPromotions: {
      backToSchool: { period: 'July-August', discount: 10 };
      blackFriday: { period: 'November', discount: 15 };
      newYear: { period: 'December-January', discount: 12 };
      gaming: { period: 'ongoing', discount: 8 };
    };
  };
}
```

---

## ⚠️ 13. ERROR HANDLING & VALIDATION

### 13.1 Error Categories
```typescript
type ErrorType = 
  | 'ValidationError'       // Input validation failures
  | 'CompatibilityError'   // Component compatibility issues  
  | 'InventoryError'       // Stock-related errors
  | 'PaymentError'         // Payment processing failures
  | 'SystemError'          // Infrastructure/system errors
  | 'BusinessLogicError';  // Business rule violations
```

### 13.2 User-Friendly Error Messages
- **Vietnamese Language**: Tất cả error messages bằng tiếng Việt
- **Actionable**: Provide clear next steps cho users
- **Context-Aware**: Include relevant context information
- **Graceful Degradation**: System continues functioning with limited features
- **Recovery Suggestions**: Suggest ways to resolve the error

---

## 📊 14. REPORTING & ANALYTICS

### 14.1 Required Reports
```typescript
interface ReportTypes {
  daily: [
    'sales_summary',
    'inventory_movements', 
    'top_selling_products',
    'low_stock_alerts'
  ];
  
  weekly: [
    'sales_trends',
    'customer_segments',
    'build_analysis',
    'staff_performance'
  ];
  
  monthly: [
    'financial_summary',
    'inventory_turnover',
    'customer_retention',
    'market_analysis'
  ];
}
```

### 14.2 Key Performance Indicators
- **Sales Metrics**: Revenue, units sold, average order value
- **Inventory Metrics**: Turnover rate, carrying costs, stockouts
- **Customer Metrics**: Acquisition cost, lifetime value, retention rate
- **Operational Metrics**: Order processing time, build accuracy rate
- **Financial Metrics**: Gross margin, net profit, cash flow

---

## 🔄 15. MAINTENANCE & UPDATES

### 15.1 Regular Maintenance Tasks
- **Daily**: Database cleanup, log rotation, backup verification
- **Weekly**: Performance review, security scan, dependency updates
- **Monthly**: Full system backup, compatibility database update
- **Quarterly**: Security audit, performance optimization, feature review

### 15.2 Update Procedures
- **Product Data**: Weekly updates cho new products và price changes
- **Compatibility Matrix**: Monthly updates cho new component releases
- **Software Dependencies**: Monthly security và feature updates
- **Database Schema**: Versioned migrations với rollback capability

---

## 📁 17. COMPONENT STRUCTURE & ORGANIZATION RULES

### 17.1 Astro Component Architecture
```typescript
interface ComponentStructureRules {
  // Component Categories và Organization
  componentCategories: {
    // UI Components (src/components/ui/)
    ui: {
      purpose: 'reusable basic UI elements';
      examples: ['Button', 'Input', 'Modal', 'Card', 'Table'];
      rules: {
        props: 'typed interfaces only';
        styling: 'Tailwind classes only';
        behavior: 'minimal JavaScript';
        accessibility: 'ARIA compliant';
      };
    };
    
    // Layout Components (src/components/layout/)
    layout: {
      purpose: 'page structure và navigation';
      examples: ['Header', 'Sidebar', 'Footer', 'Navigation'];
      rules: {
        responsive: 'mobile-first design';
        navigation: 'keyboard accessible';
        seo: 'semantic HTML structure';
        performance: 'critical CSS inlined';
      };
    };
    
    // Feature Components (src/components/pos/, /products/, etc.)
    feature: {
      purpose: 'business logic components';
      examples: ['POSInterface', 'ProductCard', 'BuildConfigurator'];
      rules: {
        isolation: 'self-contained functionality';
        dataFlow: 'props down, events up';
        stateManagement: 'local state preferred';
        apiIntegration: 'through lib/api functions';
      };
    };
  };
  
  // File Naming Conventions
  fileNaming: {
    components: 'PascalCase.astro';        // ProductCard.astro
    utils: 'camelCase.ts';                 // formatCurrency.ts
    types: 'camelCase.ts';                 // productTypes.ts
    pages: 'kebab-case.astro';             // product-detail.astro
    directories: 'kebab-case';             // /pc-build/
  };
  
  // Import/Export Rules
  importExport: {
    order: [
      '// External libraries',
      '// Internal libraries', 
      '// Components',
      '// Types',
      '// Utils'
    ];
    exports: 'default export for components';
    namedExports: 'for utilities and types';
  };
}
```

### 17.2 Page Structure Rules (src/pages/)
```typescript
interface PageStructureRules {
  // Static Pages (Astro static generation)
  staticPages: {
    productCatalog: {
      path: '/products/index.astro';
      generation: 'static';
      data: 'getStaticProps from JSON/API';
      caching: 'CDN cached';
      updates: 'build-time only';
    };
    
    productDetail: {
      path: '/products/[id].astro';
      generation: 'static with getStaticPaths';
      data: 'individual product data';
      seo: 'product-specific meta tags';
      performance: 'image optimization';
    };
    
    categories: {
      path: '/products/categories.astro';
      generation: 'static';
      data: 'category hierarchy';
      filters: 'client-side filtering';
      navigation: 'breadcrumb navigation';
    };
  };
  
  // Dynamic Pages (Server-side rendering)
  dynamicPages: {
    posInterface: {
      path: '/pos/index.astro';
      generation: 'server';
      authentication: 'required';
      realtime: 'WebSocket/polling';
      state: 'client-side management';
    };
    
    inventory: {
      path: '/inventory/[...page].astro';
      generation: 'server';
      authorization: 'role-based';
      data: 'real-time database queries';
      pagination: 'server-side pagination';
    };
    
    reports: {
      path: '/reports/[type].astro';
      generation: 'server';
      computation: 'background processing';
      export: 'PDF/Excel generation';
      caching: 'short-term cache';
    };
  };
  
  // Layout Application
  layoutUsage: {
    dashboard: 'DashboardLayout.astro';    // Admin pages
    pos: 'POSLayout.astro';                // POS interface
    public: 'BaseLayout.astro';            // Public pages
    auth: 'AuthLayout.astro';              // Login/register
    print: 'PrintLayout.astro';            // Printable pages
    mobile: 'MobileLayout.astro';          // Mobile-specific
  };
}
```

### 17.3 Data Layer Organization (src/lib/)
```typescript
interface DataLayerRules {
  // API Client Functions (src/lib/api/)
  apiClient: {
    structure: {
      products: 'product CRUD operations';
      customers: 'customer management';
      orders: 'order processing';
      inventory: 'stock management';
      auth: 'authentication flow';
      reports: 'report generation';
      build: 'PC build operations';
    };
    
    conventions: {
      errorHandling: 'consistent error types';
      authentication: 'token-based auth';
      caching: 'response caching where appropriate';
      typescript: 'fully typed responses';
    };
  };
  
  // State Management (src/lib/store/)
  stateManagement: {
    cartState: {
      storage: 'localStorage';
      persistence: 'across sessions';
      validation: 'real-time compatibility';
      sync: 'cross-tab synchronization';
    };
    
    userState: {
      storage: 'sessionStorage';
      security: 'no sensitive data';
      preferences: 'UI preferences only';
      timeout: 'auto-logout on inactivity';
    };
    
    buildState: {
      storage: 'localStorage';
      versioning: 'configuration versioning';
      sharing: 'shareable configurations';
      validation: 'compatibility checking';
    };
  };
  
  // Type Definitions (src/lib/types/)
  typeDefinitions: {
    organization: {
      product: 'all product-related types';
      customer: 'customer management types';
      order: 'order processing types';
      inventory: 'inventory management types';
      build: 'PC build configuration types';
      common: 'shared utility types';
    };
    
    conventions: {
      interfaces: 'PascalCase naming';
      enums: 'SCREAMING_SNAKE_CASE';
      unions: 'descriptive names';
      generics: 'single letter or descriptive';
    };
  };
  
  // Utility Functions (src/lib/utils/)
  utilities: {
    formatting: {
      currency: 'VND formatting';
      date: 'Vietnamese date formats';
      numbers: 'technical specifications';
      text: 'product name formatting';
    };
    
    validation: {
      inputs: 'form input validation';
      compatibility: 'component compatibility';
      business: 'business rule validation';
      security: 'security validations';
    };
    
    constants: {
      categories: 'product categories';
      brands: 'supported brands';
      specifications: 'technical specifications';
      defaults: 'default values';
    };
  };
}
```

### 17.4 Backend Structure Rules (functions/)
```typescript
interface BackendStructureRules {
  // Cloudflare Workers Organization
  workerStructure: {
    // API Workers (functions/api/)
    apiWorkers: {
      auth: 'authentication và authorization';
      products: 'product management endpoints';
      customers: 'customer management endpoints';
      orders: 'order processing endpoints';
      inventory: 'inventory management endpoints';
      reports: 'report generation endpoints';
      build: 'PC build configuration endpoints';
      payments: 'payment processing endpoints';
    };
    
    // Middleware (functions/middleware/)
    middleware: {
      auth: 'JWT token validation';
      cors: 'cross-origin request handling';
      validation: 'input validation schemas';
      logging: 'request/response logging';
      rateLimit: 'rate limiting implementation';
    };
    
    // Utilities (functions/utils/)
    utilities: {
      database: 'D1 database helpers';
      storage: 'R2 storage operations';
      cache: 'KV cache management';
      queue: 'background job processing';
      constants: 'worker-specific constants';
    };
  };
  
  // Database Schema (schemas/)
  databaseSchema: {
    migrations: {
      naming: '001_descriptive_name.sql';
      versioning: 'sequential numbering';
      rollback: 'include rollback scripts';
      testing: 'test migrations locally';
    };
    
    tables: {
      products: 'comprehensive product data';
      customers: 'customer information';
      orders: 'order processing';
      inventory: 'stock management';
      builds: 'PC build configurations';
      users: 'staff và admin users';
      audit: 'audit trails';
    };
    
    indexing: {
      performance: 'index for query performance';
      foreignKeys: 'index all foreign keys';
      search: 'full-text search indexes';
      reporting: 'indexes for reporting queries';
    };
  };
}
```

### 17.5 Asset Organization Rules (public/)
```typescript
interface AssetOrganizationRules {
  // Image Assets (public/images/)
  imageAssets: {
    products: {
      structure: '/products/{category}/{sku}/';
      naming: '{sku}-{variant}-{size}.webp';
      sizes: ['thumbnail', 'medium', 'large', 'zoom'];
      optimization: 'WebP format, multiple sizes';
    };
    
    brands: {
      structure: '/brands/';
      naming: '{brand-slug}-logo.webp';
      variants: ['light', 'dark', 'color', 'mono'];
      sizes: ['small', 'medium', 'large'];
    };
    
    ui: {
      structure: '/icons/';
      naming: 'descriptive-name.svg';
      format: 'SVG for scalability';
      optimization: 'optimized SVGs';
    };
  };
  
  // Documentation (public/docs/)
  documentation: {
    userManuals: 'staff training materials';
    apiDocs: 'API documentation';
    technical: 'technical specifications';
    legal: 'terms, privacy policy';
  };
  
  // Configuration Files
  configFiles: {
    astroConfig: {
      file: 'astro.config.mjs';
      purpose: 'Astro framework configuration';
      adapter: '@astrojs/cloudflare';
      optimization: 'build optimization settings';
    };
    
    wranglerConfig: {
      file: 'wrangler.toml';
      purpose: 'Cloudflare Workers configuration';
      environments: 'dev, staging, production';
      bindings: 'D1, KV, R2 bindings';
    };
    
    tailwindConfig: {
      file: 'tailwind.config.mjs';
      purpose: 'Tailwind CSS configuration';
      customization: 'color scheme, spacing, fonts';
      plugins: 'additional Tailwind plugins';
    };
  };
}
```

## 🇻🇳 8. LOCALIZATION (VIETNAM) - COMPREHENSIVE

### 8.1 Currency & Financial Compliance
```typescript
interface VietnameseFinancialRules {
  // Currency handling
  currency: {
    primaryCurrency: 'VND';
    displayFormat: '1.999.000 ₫';        // Period as thousands separator
    storageFormat: 'INTEGER';            // Store as integer (no decimals)
    exchangeRate: {
      usdToVnd: 'daily-update';          // Update USD to VND daily
      source: 'vietcombank' | 'sbv';     // Exchange rate source
    };
  };
  
  // VAT and Tax Compliance
  vatCompliance: {
    standardRate: 10;                    // 10% standard VAT rate
    reducedRate: 8;                      // 8% for certain products
    exemptions: ['educational-software', 'books'];
    calculation: 'inclusive';            // VAT included in display price
    reporting: 'monthly';               // Monthly VAT reporting
  };
  
  // E-Invoice Compliance (Thông tư 78/2021/TT-BTC)
  eInvoice: {
    mandatory: boolean;                  // E-invoice mandatory
    format: 'XML';                       // XML format required
    sequence: 'continuous';              // Continuous numbering
    storage: 'cloud-backup';             // Cloud storage required
    retention: 10;                       // 10 year retention period
    
    requiredFields: [
      'invoice-number',                  // Số hóa đơn
      'invoice-date',                    // Ngày hóa đơn
      'seller-info',                     // Thông tin người bán
      'buyer-info',                      // Thông tin người mua
      'items-detail',                    // Chi tiết hàng hóa
      'tax-calculation',                 // Tính thuế
      'total-amount'                     // Tổng tiền
    ];
  };
}
```

### 8.2 Business Registration Compliance
```typescript
interface BusinessComplianceRules {
  // Business registration requirements
  businessRegistration: {
    businessLicense: 'required';         // Giấy phép kinh doanh
    taxCode: 'required';                 // Mã số thuế
    socialInsurance: 'required';         // Bảo hiểm xã hội
    fireInsurance: 'recommended';        // Bảo hiểm cháy nổ
  };
  
  // Import/Export regulations
  importRegulations: {
    importLicense: 'category-dependent'; // Giấy phép nhập khẩu
    customsDeclaration: 'required';      // Tờ khai hải quan
    qualityInspection: 'electronics';    // Kiểm tra chất lượng
    warrantyRequirements: 'local-service'; // Yêu cầu bảo hành
  };
  
  // Consumer protection compliance
  consumerProtection: {
    returnPolicy: {
      period: 7;                         // 7 days return period
      condition: 'original-packaging';   // Condition requirements
      exceptions: ['software', 'opened-software'];
    };
    
    warrantyPolicy: {
      minimumPeriod: 12;                 // 12 months minimum warranty
      localService: 'required';          // Local warranty service
      documentation: 'vietnamese';       // Vietnamese documentation
    };
    
    priceDisplay: {
      vatInclusive: boolean;             // VAT inclusive pricing
      noHiddenFees: boolean;             // No hidden fees
      priceChange: 'notify-customer';    // Price change notification
    };
  };
}
```

### 8.3 Vietnamese Language Standards
```typescript
interface VietnameseLanguageRules {
  // Technical terminology standardization
  technicalTerms: {
    // Hardware components
    cpu: 'Bộ vi xử lý (CPU)';
    gpu: 'Card đồ họa (GPU/VGA)';
    motherboard: 'Bo mạch chủ (Mainboard)';
    memory: 'Bộ nhớ (RAM)';
    storage: 'Ổ cứng (Storage)';
    psu: 'Nguồn máy tính (PSU)';
    case: 'Vỏ máy tính (Case)';
    cooling: 'Hệ thống tản nhiệt';
    
    // Business terms
    invoice: 'Hóa đơn';
    receipt: 'Biên lai';
    warranty: 'Bảo hành';
    customer: 'Khách hàng';
    staff: 'Nhân viên';
    inventory: 'Tồn kho';
    supplier: 'Nhà cung cấp';
    order: 'Đơn hàng';
    
    // POS terms
    sale: 'Bán hàng';
    return: 'Trả hàng';
    exchange: 'Đổi hàng';
    discount: 'Giảm giá';
    payment: 'Thanh toán';
    cash: 'Tiền mặt';
    transfer: 'Chuyển khoản';
    installment: 'Trả góp';
  };
  
  // Date and time formatting
  dateTimeFormat: {
    shortDate: 'dd/mm/yyyy';             // 25/12/2024
    longDate: 'dd tháng mm năm yyyy';    // 25 tháng 12 năm 2024
    time: 'HH:mm';                       // 14:30
    dateTime: 'dd/mm/yyyy HH:mm';        // 25/12/2024 14:30
    
    dayNames: [
      'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư',
      'Thứ năm', 'Thứ sáu', 'Thứ bảy'
    ];
    
    monthNames: [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
  };
  
  // Address formatting
  addressFormat: {
    structure: [
      'số nhà/tên đường',              // House number/street name
      'phường/xã',                     // Ward/commune
      'quận/huyện',                    // District
      'tỉnh/thành phố'                 // Province/city
    ];
    example: '123 Nguyễn Văn Linh, Phường Tân Thuận Đông, Quận 7, TP.HCM';
  };
}
```

### 8.4 Payment Methods (Vietnam Specific)
```typescript
interface VietnamesePaymentMethods {
  // Cash payments
  cash: {
    denominations: [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500];
    changeCalculation: 'automatic';
    counterfeitDetection: 'manual-check';
  };
  
  // Bank transfers
  bankTransfer: {
    majorBanks: [
      'Vietcombank', 'BIDV', 'VietinBank', 'Agribank',
      'Techcombank', 'MB Bank', 'ACB', 'VPBank'
    ];
    transferTypes: ['same-bank', 'inter-bank', 'internet-banking'];
    verificationRequired: boolean;
  };
  
  // QR Code payments
  qrPayments: {
    vietQR: {
      standard: 'VietQR';               // Vietnamese QR standard
      supported: boolean;
      integration: 'bank-api';
    };
    
    eWallets: {
      momo: { supported: boolean; commission: number };
      zalopay: { supported: boolean; commission: number };
      vnpay: { supported: boolean; commission: number };
      grabpay: { supported: boolean; commission: number };
    };
  };
  
  // Card payments
  cardPayments: {
    domesticCards: {
      napas: 'supported';               // NAPAS network
      commission: number;               // Commission percentage
      onlineVerification: boolean;
    };
    
    internationalCards: {
      visa: 'supported';
      mastercard: 'supported';
      jcb: 'supported';
      commission: number;
    };
  };
  
  // Installment payments
  installmentPayments: {
    creditCards: {
      supportedBanks: ['Sacombank', 'Techcombank', 'VPBank'];
      minAmount: 3000000;               // Minimum amount for installment
      terms: [3, 6, 9, 12, 18, 24];    // Available terms in months
    };
    
    financialServices: {
      homeCredit: { supported: boolean; maxAmount: 50000000 };
      kredivo: { supported: boolean; maxAmount: 30000000 };
      muadee: { supported: boolean; maxAmount: 20000000 };
    };
  };
}
```

---

## 🚀 18. DEVELOPMENT WORKFLOW & DEPLOYMENT

### 18.1 Development Environment Setup
```bash
# Required tools và setup
development_setup: {
  # Node.js environment
  nodejs: "v18.0.0+";                   # Minimum Node.js version
  packageManager: "npm" | "yarn" | "pnpm";
  
  # Cloudflare tools
  wrangler: "latest";                   # Cloudflare Wrangler CLI
  cloudflareAccount: "required";        # Cloudflare account
  
  # Development database
  localD1: "wrangler d1 create";        # Local D1 database
  seedData: "npm run db:seed";          # Seed development data
  
  # Environment variables
  envFile: ".env.local";                # Local environment file
  requiredVars: [
    "DATABASE_URL",                     # D1 database URL
    "KV_NAMESPACE",                     # KV storage namespace  
    "R2_BUCKET",                        # R2 storage bucket
    "JWT_SECRET",                       # JWT signing secret
    "WEBHOOK_SECRET"                    # Webhook secret
  ];
}
```

### 18.2 Build and Deployment Pipeline
```typescript
interface DeploymentPipeline {
  // Build process
  buildProcess: {
    staticGeneration: 'astro build';    # Generate static pages
    workerBuild: 'wrangler publish';    # Deploy workers
    assetOptimization: 'automatic';     # Optimize images, CSS, JS
    bundleAnalysis: 'report';           # Bundle size analysis
  };
  
  // Environment progression
  environments: {
    development: {
      database: 'local-d1';
      workers: 'local-dev';
      assets: 'local-server';
      debug: 'enabled';
    };
    
    staging: {
      database: 'staging-d1';
      workers: 'staging-workers';
      assets: 'staging-pages';
      testing: 'automated';
    };
    
    production: {
      database: 'production-d1';
      workers: 'production-workers';
      assets: 'production-pages';
      monitoring: 'enabled';
    };
  };
  
  // Deployment checklist
  deploymentChecklist: [
    'run-tests',                        # All tests pass
    'check-performance',                # Performance benchmarks
    'validate-migrations',              # Database migrations
    'security-scan',                    # Security vulnerability scan
    'dependency-audit',                 # Dependency security audit
    'backup-database',                  # Backup production database
    'deploy-workers',                   # Deploy worker functions
    'deploy-frontend',                  # Deploy static frontend
    'verify-deployment',                # Post-deployment verification
    'update-documentation'              # Update deployment docs
  ];
}
```

### 18.3 Quality Assurance Rules
```typescript
interface QualityAssuranceRules {
  // Code quality gates
  codeQuality: {
    typescript: 'strict-mode';          # TypeScript strict mode
    linting: 'eslint-recommended';      # ESLint rules
    formatting: 'prettier';             # Prettier code formatting
    testing: 'vitest';                  # Vitest for unit testing
    coverage: 85;                       # Minimum test coverage percentage
  };
  
  // Performance benchmarks
  performance: {
    buildTime: 120;                     # Max build time in seconds
    bundleSize: 500;                    # Max bundle size in KB
    firstContentfulPaint: 1.5;         # Max FCP in seconds
    largestContentfulPaint: 2.5;       # Max LCP in seconds
    cumulativeLayoutShift: 0.1;        # Max CLS score
  };
  
  // Security requirements
  security: {
    dependencyAudit: 'automated';       # Automated dependency scanning
    secretScanning: 'enabled';          # Git secret scanning
    inputValidation: 'mandatory';       # Input validation required
    outputEncoding: 'mandatory';        # Output encoding required
    authenticationTimeout: 30;          # Session timeout in minutes
  };
  
  // Accessibility standards
  accessibility: {
    wcagLevel: 'AA';                    # WCAG 2.1 AA compliance
    keyboardNavigation: 'full';         # Full keyboard navigation
    screenReader: 'compatible';         # Screen reader compatibility
    colorContrast: 4.5;                 # Minimum color contrast ratio
    focusManagement: 'logical';         # Logical focus management
  };
}
```

### 18.4 Monitoring and Maintenance
```typescript
interface MonitoringRules {
  // Application monitoring
  monitoring: {
    uptime: {
      target: 99.9;                     # 99.9% uptime target
      checks: 'global';                 # Global uptime monitoring
      alerts: 'immediate';              # Immediate alert on downtime
    };
    
    performance: {
      responseTime: 500;                # Max response time in ms
      errorRate: 1;                     # Max error rate percentage
      throughput: 1000;                 # Requests per minute capacity
    };
    
    business: {
      salesTracking: 'real-time';       # Real-time sales monitoring
      inventoryAlerts: 'automated';     # Automated stock alerts
      userActivity: 'tracked';          # User activity monitoring
    };
  };
  
  // Maintenance schedule
  maintenance: {
    daily: [
      'backup-verification',            # Verify daily backups
      'log-analysis',                   # Analyze application logs
      'performance-check'               # Performance metrics review
    ];
    
    weekly: [
      'security-updates',               # Security updates review
      'dependency-updates',             # Dependency updates
      'database-optimization'           # Database performance optimization
    ];
    
    monthly: [
      'full-backup-test',               # Full backup restoration test
      'security-audit',                 # Security audit
      'performance-optimization',       # Performance tuning
      'documentation-update'            # Documentation updates
    ];
  };
}
```

---

## 📋 19. FINAL CHECKLIST & SUMMARY

### 19.1 Pre-Development Checklist
- [ ] Cloudflare account setup với Workers, Pages, D1, KV, R2
- [ ] GitHub repository tạo với proper branching strategy
- [ ] Development environment configured với Astro + TypeScript
- [ ] Wrangler CLI installed và authenticated
- [ ] Local D1 database created và seeded với sample data
- [ ] Environment variables configured cho tất cả environments
- [ ] Component library design system established
- [ ] Vietnamese localization resources prepared
- [ ] Business logic specifications reviewed và approved

### 19.2 Core Development Principles
1. **Static-First Architecture**: Tối đa hóa static pages để leverage Cloudflare free tier
2. **Component Modularity**: Mỗi component tự chứa và có thể tái sử dụng
3. **TypeScript Strict Mode**: Tất cả code phải type-safe
4. **Performance-First**: Mọi optimization hướng tới Core Web Vitals
5. **Vietnamese-Optimized**: Tối ưu hoàn toàn cho thị trường Việt Nam
6. **Business-Focused**: Mọi feature phải phục vụ business goals rõ ràng
7. **Cloudflare-Native**: Tận dụng tối đa Cloudflare ecosystem
8. **Security-Conscious**: Bảo mật được ưu tiên từ đầu
9. **Accessibility-Compliant**: WCAG 2.1 AA compliance
10. **Future-Proof**: Thiết kế cho scalability và maintainability

### 19.3 Success Metrics
- **Performance**: < 2s page load, 99.9% uptime
- **Business**: Increase sales efficiency by 40%
- **User Experience**: < 3 clicks to complete any major task
- **Cost**: 100% free operation within Cloudflare limits
- **Quality**: > 85% test coverage, zero critical security issues
- **Compliance**: 100% Vietnamese business law compliance

Những quy tắc này đảm bảo ComputerPOS Pro được phát triển một cách chuyên nghiệp, hiệu quả và phù hợp hoàn toàn với thị trường cửa hàng máy tính Việt Nam.