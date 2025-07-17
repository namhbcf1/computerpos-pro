-- Tạo bảng categories (danh mục sản phẩm)
CREATE TABLE categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id TEXT REFERENCES categories(id),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Tạo bảng products (sản phẩm)
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price INTEGER NOT NULL, -- Giá tính bằng VND
    category_id TEXT NOT NULL REFERENCES categories(id),
    brand TEXT,
    model TEXT,
    sku TEXT UNIQUE,
    specifications TEXT, -- JSON string
    images TEXT, -- JSON array of image URLs
    compatibility TEXT, -- JSON object for PC part compatibility
    warranty_period INTEGER DEFAULT 12, -- Tháng
    warranty_type TEXT DEFAULT 'manufacturer',
    warranty_provider TEXT DEFAULT 'Chính hãng',
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Tạo index cho products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(active);

-- Tạo bảng stock (tồn kho)
CREATE TABLE stock (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    product_id TEXT NOT NULL REFERENCES products(id),
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    warehouse_location TEXT,
    last_updated TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_stock_product ON stock(product_id);

-- Tạo bảng customers (khách hàng)
CREATE TABLE customers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    address TEXT,
    customer_type TEXT DEFAULT 'individual', -- individual, business
    tax_code TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Tạo bảng orders (đơn hàng)
CREATE TABLE orders (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT REFERENCES customers(id),
    status TEXT DEFAULT 'pending', -- pending, confirmed, processing, completed, cancelled
    subtotal INTEGER NOT NULL,
    tax_amount INTEGER DEFAULT 0,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);

-- Tạo bảng order_items (chi tiết đơn hàng)
CREATE TABLE order_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL REFERENCES orders(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);