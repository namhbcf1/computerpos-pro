-- Simple migration to create product_serials table

CREATE TABLE IF NOT EXISTS product_serials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'sold', 'reserved', 'defective', 'warranty')),
    condition_grade TEXT DEFAULT 'new' CHECK(condition_grade IN ('new', 'good', 'fair', 'poor')),
    purchase_price REAL,
    sale_price REAL,
    warranty_months INTEGER DEFAULT 12,
    warranty_start_date DATE,
    warranty_end_date DATE,
    notes TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Bảng sold_serials để track serial đã bán
CREATE TABLE IF NOT EXISTS sold_serials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    order_id INTEGER,
    customer_id INTEGER,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    sale_price REAL,
    warranty_start_date DATE,
    warranty_end_date DATE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_serials_product ON product_serials(product_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_serial ON product_serials(serial_number);
CREATE INDEX IF NOT EXISTS idx_product_serials_status ON product_serials(status);
CREATE INDEX IF NOT EXISTS idx_sold_serials_serial ON sold_serials(serial_number);
CREATE INDEX IF NOT EXISTS idx_sold_serials_order ON sold_serials(order_id);
