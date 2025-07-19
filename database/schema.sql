-- ComputerPOS Pro - Enhanced Database Schema for Cloudflare D1
-- Optimized for Vietnamese computer hardware stores with AI features
-- Version 2.0 - 2026 Upgrade

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================================================
-- CORE PRODUCT MANAGEMENT
-- ============================================================================

-- Enhanced products table with compatibility specifications
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Cooling', 'Case', 'Peripherals')),
    brand TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    cost_price REAL CHECK (cost_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 5 CHECK (min_stock >= 0),
    description TEXT,
    specifications JSON, -- Store component specs as JSON
    warranty_months INTEGER DEFAULT 12,
    warranty_type TEXT DEFAULT 'local' CHECK (warranty_type IN ('local', 'international')),
    supplier_id INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- ============================================================================
-- COMPONENT COMPATIBILITY SYSTEM
-- ============================================================================

-- Component compatibility rules
CREATE TABLE IF NOT EXISTS compatibility_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component1_category TEXT NOT NULL,
    component2_category TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('socket', 'power', 'physical', 'interface')),
    rule_description TEXT NOT NULL,
    is_critical BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pre-built compatibility combinations
CREATE TABLE IF NOT EXISTS compatibility_combinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product1_id INTEGER NOT NULL,
    product2_id INTEGER NOT NULL,
    compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
    issues JSON, -- Store compatibility issues as JSON
    recommendations JSON, -- Store recommendations as JSON
    verified_by TEXT, -- Staff member who verified
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product1_id) REFERENCES products(id),
    FOREIGN KEY (product2_id) REFERENCES products(id),
    UNIQUE(product1_id, product2_id)
);

-- ============================================================================
-- CUSTOMER MANAGEMENT
-- ============================================================================

-- Enhanced customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    address TEXT,
    city TEXT,
    customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business', 'reseller')),
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    total_spent REAL DEFAULT 0 CHECK (total_spent >= 0),
    total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
    preferences JSON, -- Store customer preferences as JSON
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer build history for AI recommendations
CREATE TABLE IF NOT EXISTS customer_builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    build_name TEXT,
    use_case TEXT, -- gaming, office, content_creation, etc.
    budget REAL,
    components JSON, -- Store build components as JSON
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- ============================================================================
-- SALES & ORDERS SYSTEM
-- ============================================================================

-- Enhanced orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- Format: DH001, DH002, etc.
    customer_id INTEGER,
    staff_id INTEGER,
    order_type TEXT DEFAULT 'sale' CHECK (order_type IN ('sale', 'return', 'exchange', 'warranty')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    subtotal REAL NOT NULL CHECK (subtotal >= 0),
    discount_amount REAL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount REAL DEFAULT 0 CHECK (tax_amount >= 0),
    total REAL NOT NULL CHECK (total >= 0),
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'qr_code', 'credit_card')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
    assembly_required BOOLEAN DEFAULT FALSE,
    assembly_fee REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);

-- Order items with enhanced tracking
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    discount_amount REAL DEFAULT 0 CHECK (discount_amount >= 0),
    total_price REAL NOT NULL CHECK (total_price >= 0),
    serial_numbers JSON, -- Store assigned serial numbers
    warranty_start_date DATE,
    warranty_end_date DATE,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================================
-- STAFF & USER MANAGEMENT
-- ============================================================================

-- Staff management
CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'sales', 'technician')),
    permissions JSON, -- Store permissions as JSON array
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AI & ANALYTICS TABLES
-- ============================================================================

-- AI recommendations cache
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('product', 'build', 'upgrade')),
    input_data JSON NOT NULL,
    recommendations JSON NOT NULL,
    confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
    used BOOLEAN DEFAULT FALSE,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Analytics cache for performance
CREATE TABLE IF NOT EXISTS analytics_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT UNIQUE NOT NULL,
    data JSON NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- VIETNAMESE COMPLIANCE TABLES
-- ============================================================================

-- E-invoice compliance (Thông tư 78/2021/TT-BTC)
CREATE TABLE IF NOT EXISTS einvoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_series TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    customer_tax_code TEXT,
    xml_data TEXT, -- Store XML invoice data
    digital_signature TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'sent', 'cancelled')),
    cqt_code TEXT, -- Mã CQT từ Tổng cục thuế
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ============================================================================
-- SAMPLE DATA FOR VIETNAMESE COMPUTER HARDWARE STORE
-- ============================================================================

-- Insert default staff admin user
INSERT OR IGNORE INTO staff (username, password_hash, full_name, role, permissions)
VALUES (
    'admin',
    '$2b$10$example_hash_here',
    'Administrator',
    'admin',
    '["all"]'
);

-- Insert sample compatibility rules
INSERT OR IGNORE INTO compatibility_rules (component1_category, component2_category, rule_type, rule_description) VALUES
('CPU', 'Motherboard', 'socket', 'CPU socket must match motherboard socket'),
('RAM', 'Motherboard', 'interface', 'RAM type (DDR4/DDR5) must match motherboard support'),
('GPU', 'PSU', 'power', 'PSU wattage must exceed GPU power requirement'),
('CPU', 'PSU', 'power', 'PSU must provide adequate power for CPU TDP');

-- Insert Vietnamese computer hardware products
INSERT OR IGNORE INTO products (name, sku, category, brand, price, stock, description, specifications) VALUES
('Intel Core i7-13700K', 'CPU-I7-13700K', 'CPU', 'Intel', 8500000, 15, 'Bộ vi xử lý Intel thế hệ 13', '{"socket": "LGA1700", "cores": 16, "threads": 24, "tdp": 125}'),
('AMD Ryzen 7 7700X', 'CPU-R7-7700X', 'CPU', 'AMD', 7800000, 12, 'Bộ vi xử lý AMD Ryzen 7000', '{"socket": "AM5", "cores": 8, "threads": 16, "tdp": 105}'),
('NVIDIA GeForce RTX 4080', 'GPU-RTX-4080', 'GPU', 'NVIDIA', 25000000, 8, 'Card đồ họa RTX 4080 16GB', '{"vramSize": 16, "powerRequirement": 320, "length": 336}'),
('ASUS ROG STRIX Z790-E', 'MB-ASUS-Z790', 'Motherboard', 'ASUS', 6800000, 10, 'Bo mạch chủ Z790 chipset', '{"socket": "LGA1700", "ramType": "DDR5", "ramSlots": 4}'),
('Corsair Vengeance DDR5-5600 32GB', 'RAM-32GB-DDR5', 'RAM', 'Corsair', 4500000, 20, 'Bộ nhớ DDR5 32GB', '{"type": "DDR5", "speed": 5600, "capacity": 32}'),
('Samsung 980 PRO 1TB NVMe', 'SSD-980PRO-1TB', 'Storage', 'Samsung', 3200000, 25, 'Ổ cứng SSD NVMe 1TB', '{"interface": "NVMe", "capacity": 1000, "readSpeed": 7000}'),
('Corsair RM850x 850W 80+ Gold', 'PSU-RM850X', 'PSU', 'Corsair', 3800000, 15, 'Nguồn 850W 80+ Gold Modular', '{"wattage": 850, "efficiency": "80+ Gold", "modular": true}'),
('NZXT H7 Flow Mid Tower', 'CASE-H7-FLOW', 'Case', 'NZXT', 2200000, 12, 'Vỏ máy Mid Tower với airflow tối ưu', '{"formFactor": "Mid Tower", "maxGpuLength": 381}');

-- Insert sample customers
INSERT OR IGNORE INTO customers (name, phone, email, address, city, customer_type) VALUES
('Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', '123 Nguyễn Huệ', 'TP.HCM', 'individual'),
('Trần Thị B', '0907654321', 'tranthib@email.com', '456 Trần Hưng Đạo', 'Hà Nội', 'individual'),
('Công ty TNHH ABC', '0281234567', 'contact@abc.com', '789 Lê Lợi', 'TP.HCM', 'business');