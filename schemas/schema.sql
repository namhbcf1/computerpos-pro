-- ComputerPOS Pro Database Schema
-- Optimized for Cloudflare D1 SQLite Database
-- Vietnamese Computer Hardware POS System

-- User Management
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'manager', 'cashier', 'technician')) DEFAULT 'cashier',
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_vi TEXT NOT NULL, -- Vietnamese name
    description TEXT,
    parent_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Brands
CREATE TABLE brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    name_vi TEXT NOT NULL, -- Vietnamese name
    description TEXT,
    description_vi TEXT, -- Vietnamese description
    category_id INTEGER NOT NULL,
    brand_id INTEGER,
    cost_price DECIMAL(15,2) NOT NULL, -- Purchase price in VND
    selling_price DECIMAL(15,2) NOT NULL, -- Selling price in VND
    retail_price DECIMAL(15,2), -- Suggested retail price
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 1000,
    unit TEXT DEFAULT 'cái', -- Vietnamese unit
    weight DECIMAL(10,2), -- Weight in grams
    warranty_months INTEGER DEFAULT 12,
    warranty_type TEXT CHECK(warranty_type IN ('local', 'international', 'none')) DEFAULT 'local',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- Product Specifications (for computer parts)
CREATE TABLE product_specs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    spec_name TEXT NOT NULL,
    spec_value TEXT NOT NULL,
    spec_unit TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Compatibility Matrix
CREATE TABLE product_compatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    compatible_product_id INTEGER NOT NULL,
    compatibility_type TEXT CHECK(compatibility_type IN ('compatible', 'incompatible', 'requires')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (compatible_product_id) REFERENCES products(id)
);

-- Inventory Management
CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    location TEXT DEFAULT 'main', -- Storage location
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- Reserved for orders
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(product_id, location)
);

-- Serial Numbers Tracking
CREATE TABLE serial_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    serial_number TEXT NOT NULL,
    status TEXT CHECK(status IN ('available', 'sold', 'reserved', 'defective')) DEFAULT 'available',
    purchase_date DATE,
    sale_date DATE,
    warranty_expires DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(product_id, serial_number)
);

-- Customers
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    district TEXT,
    ward TEXT,
    postal_code TEXT,
    tax_id TEXT, -- For business customers
    customer_type TEXT CHECK(customer_type IN ('individual', 'business')) DEFAULT 'individual',
    discount_percent DECIMAL(5,2) DEFAULT 0,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    tax_id TEXT,
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders (Sales)
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    user_id INTEGER NOT NULL, -- Cashier
    order_type TEXT CHECK(order_type IN ('sale', 'return', 'exchange')) DEFAULT 'sale',
    status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'partial', 'refunded')) DEFAULT 'pending',
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'transfer', 'qr', 'momo', 'zalopay')) DEFAULT 'cash',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_price DECIMAL(15,2) NOT NULL,
    serial_number TEXT,
    warranty_start_date DATE,
    warranty_end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')) DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    expected_date DATE,
    received_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Purchase Order Items
CREATE TABLE purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    total_cost DECIMAL(15,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Payments
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'transfer', 'qr', 'momo', 'zalopay')) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'VND',
    transaction_id TEXT,
    reference_number TEXT,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- PC Build Configurations
CREATE TABLE pc_builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_name TEXT NOT NULL,
    customer_id INTEGER,
    user_id INTEGER NOT NULL,
    build_type TEXT CHECK(build_type IN ('gaming', 'office', 'workstation', 'server')) DEFAULT 'gaming',
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    total_price DECIMAL(15,2) NOT NULL,
    compatibility_status TEXT CHECK(compatibility_status IN ('compatible', 'warning', 'incompatible')) DEFAULT 'compatible',
    power_consumption INTEGER, -- Watts
    status TEXT CHECK(status IN ('draft', 'quote', 'ordered', 'built', 'delivered')) DEFAULT 'draft',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- PC Build Components
CREATE TABLE pc_build_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    build_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    component_type TEXT CHECK(component_type IN ('cpu', 'motherboard', 'ram', 'storage', 'gpu', 'psu', 'case', 'cooling')) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- For multiple components of same type
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (build_id) REFERENCES pc_builds(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Warranty Claims
CREATE TABLE warranty_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_number TEXT UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    serial_number TEXT,
    order_id INTEGER,
    claim_type TEXT CHECK(claim_type IN ('repair', 'replacement', 'refund')) DEFAULT 'repair',
    issue_description TEXT NOT NULL,
    status TEXT CHECK(status IN ('submitted', 'approved', 'processing', 'completed', 'rejected')) DEFAULT 'submitted',
    estimated_cost DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    repair_notes TEXT,
    submitted_date DATE NOT NULL,
    completed_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Stock Movements
CREATE TABLE stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT CHECK(movement_type IN ('in', 'out', 'adjustment', 'transfer')) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_type TEXT CHECK(reference_type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer')),
    reference_id INTEGER,
    unit_cost DECIMAL(15,2),
    notes TEXT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- System Settings
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Indexes for Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_pc_builds_customer ON pc_builds(customer_id);
CREATE INDEX idx_pc_build_components_build ON pc_build_components(build_id);
CREATE INDEX idx_serial_numbers_product ON serial_numbers(product_id);
CREATE INDEX idx_warranty_claims_customer ON warranty_claims(customer_id);
CREATE INDEX idx_warranty_claims_product ON warranty_claims(product_id);

-- Create Triggers for Automatic Updates
CREATE TRIGGER update_products_timestamp 
    AFTER UPDATE ON products
    FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_customers_timestamp 
    AFTER UPDATE ON customers
    FOR EACH ROW
BEGIN
    UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_orders_timestamp 
    AFTER UPDATE ON orders
    FOR EACH ROW
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_inventory_timestamp 
    AFTER UPDATE ON inventory
    FOR EACH ROW
BEGIN
    UPDATE inventory SET last_updated = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update inventory after order completion
CREATE TRIGGER update_inventory_after_order
    AFTER UPDATE ON orders
    FOR EACH ROW
    WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    UPDATE inventory 
    SET quantity = quantity - (
        SELECT SUM(quantity) 
        FROM order_items 
        WHERE order_id = NEW.id AND product_id = inventory.product_id
    )
    WHERE product_id IN (
        SELECT DISTINCT product_id 
        FROM order_items 
        WHERE order_id = NEW.id
    );
END;

-- Trigger to log stock movements
CREATE TRIGGER log_stock_movement_on_inventory_change
    AFTER UPDATE ON inventory
    FOR EACH ROW
    WHEN NEW.quantity != OLD.quantity
BEGIN
    INSERT INTO stock_movements (
        product_id, 
        movement_type, 
        quantity, 
        reference_type, 
        notes, 
        user_id
    ) VALUES (
        NEW.product_id,
        CASE WHEN NEW.quantity > OLD.quantity THEN 'in' ELSE 'out' END,
        ABS(NEW.quantity - OLD.quantity),
        'adjustment',
        'Inventory adjustment',
        1 -- System user
    );
END;