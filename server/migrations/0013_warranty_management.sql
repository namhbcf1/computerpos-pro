-- Migration: Warranty Management System
-- Date: 2025-07-18

-- Bảng quản lý bảo hành
CREATE TABLE IF NOT EXISTS warranties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warranty_code TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    serial_number TEXT NOT NULL,
    customer_id INTEGER,
    order_id INTEGER,
    warranty_type TEXT NOT NULL DEFAULT 'manufacturer' CHECK(warranty_type IN ('manufacturer', 'store', 'extended')),
    warranty_period_months INTEGER NOT NULL DEFAULT 12,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'expired', 'claimed', 'void')),
    terms_conditions TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Bảng yêu cầu bảo hành
CREATE TABLE IF NOT EXISTS warranty_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_number TEXT UNIQUE NOT NULL,
    warranty_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    claim_type TEXT NOT NULL CHECK(claim_type IN ('repair', 'replace', 'refund')),
    issue_description TEXT NOT NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
    resolution TEXT,
    cost REAL DEFAULT 0,
    technician_notes TEXT,
    customer_notes TEXT,
    images TEXT, -- JSON array of image URLs
    documents TEXT, -- JSON array of document URLs
    processed_by INTEGER, -- user_id
    processed_date DATE,
    completed_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warranty_id) REFERENCES warranties(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Bảng lịch sử bảo hành
CREATE TABLE IF NOT EXISTS warranty_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warranty_id INTEGER NOT NULL,
    claim_id INTEGER,
    action_type TEXT NOT NULL CHECK(action_type IN ('created', 'extended', 'claimed', 'repaired', 'replaced', 'expired', 'voided')),
    description TEXT NOT NULL,
    performed_by INTEGER,
    performed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    old_values TEXT, -- JSON of old values
    new_values TEXT, -- JSON of new values
    FOREIGN KEY (warranty_id) REFERENCES warranties(id),
    FOREIGN KEY (claim_id) REFERENCES warranty_claims(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Cập nhật bảng product_serials để liên kết với warranty
ALTER TABLE product_serials ADD COLUMN warranty_id INTEGER REFERENCES warranties(id);

-- Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_warranties_code ON warranties(warranty_code);
CREATE INDEX IF NOT EXISTS idx_warranties_serial ON warranties(serial_number);
CREATE INDEX IF NOT EXISTS idx_warranties_product ON warranties(product_id);
CREATE INDEX IF NOT EXISTS idx_warranties_customer ON warranties(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_dates ON warranties(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_number ON warranty_claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty ON warranty_claims(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_customer ON warranty_claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_date ON warranty_claims(claim_date);

CREATE INDEX IF NOT EXISTS idx_warranty_history_warranty ON warranty_history(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_history_claim ON warranty_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_warranty_history_date ON warranty_history(performed_date);

-- Trigger để tự động tạo warranty khi bán sản phẩm có serial
CREATE TRIGGER IF NOT EXISTS create_warranty_on_sale
AFTER UPDATE OF status ON product_serials
WHEN NEW.status = 'sold' AND OLD.status = 'available'
BEGIN
    INSERT INTO warranties (
        warranty_code,
        product_id,
        serial_number,
        customer_id,
        order_id,
        warranty_type,
        warranty_period_months,
        start_date,
        end_date,
        status
    )
    SELECT 
        'WR' || strftime('%Y%m%d', 'now') || '-' || printf('%06d', NEW.id),
        NEW.product_id,
        NEW.serial_number,
        (SELECT customer_id FROM orders WHERE id = (
            SELECT order_id FROM sold_serials WHERE serial_number = NEW.serial_number LIMIT 1
        )),
        (SELECT order_id FROM sold_serials WHERE serial_number = NEW.serial_number LIMIT 1),
        'manufacturer',
        COALESCE(NEW.warranty_months, 12),
        COALESCE(NEW.warranty_start_date, date('now')),
        date(COALESCE(NEW.warranty_start_date, date('now')), '+' || COALESCE(NEW.warranty_months, 12) || ' months'),
        'active'
    WHERE NOT EXISTS (
        SELECT 1 FROM warranties WHERE serial_number = NEW.serial_number
    );
END;

-- Trigger để ghi lịch sử warranty
CREATE TRIGGER IF NOT EXISTS warranty_history_trigger
AFTER UPDATE ON warranties
FOR EACH ROW
BEGIN
    INSERT INTO warranty_history (
        warranty_id,
        action_type,
        description,
        old_values,
        new_values
    )
    VALUES (
        NEW.id,
        CASE 
            WHEN OLD.status != NEW.status THEN 'status_changed'
            ELSE 'updated'
        END,
        'Warranty updated: ' || 
        CASE 
            WHEN OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
            ELSE 'General update'
        END,
        json_object('status', OLD.status, 'end_date', OLD.end_date),
        json_object('status', NEW.status, 'end_date', NEW.end_date)
    );
END;
