-- Simple migration to create suppliers table

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  tax_code TEXT,
  payment_terms TEXT,
  credit_limit REAL DEFAULT 0,
  total_debt REAL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample suppliers
INSERT OR IGNORE INTO suppliers (code, name, contact_person, phone, email, address, city, payment_terms) VALUES
('SUP001', 'Công ty TNHH ABC', 'Nguyễn Văn A', '0901234567', 'contact@abc.com', '123 Đường ABC', 'Hồ Chí Minh', '30 ngày'),
('SUP002', 'Nhà phân phối XYZ', 'Trần Thị B', '0902345678', 'info@xyz.com', '456 Đường XYZ', 'Hà Nội', '15 ngày'),
('SUP003', 'Công ty Điện tử DEF', 'Lê Văn C', '0903456789', 'sales@def.com', '789 Đường DEF', 'Đà Nẵng', '45 ngày');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);
