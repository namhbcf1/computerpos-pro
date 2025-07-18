-- Create serial_numbers table
CREATE TABLE IF NOT EXISTS serial_numbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_number VARCHAR(255) NOT NULL UNIQUE,
  product_id INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'in_stock',
  order_id INTEGER,
  customer_id INTEGER,
  warranty_start_date DATETIME,
  warranty_end_date DATETIME,
  notes TEXT,
  purchase_date DATETIME,
  supplier_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Create index on serial_numbers
CREATE INDEX idx_serial_numbers_product_id ON serial_numbers(product_id);
CREATE INDEX idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX idx_serial_numbers_order_id ON serial_numbers(order_id);
CREATE INDEX idx_serial_numbers_customer_id ON serial_numbers(customer_id);
CREATE INDEX idx_serial_numbers_warranty_end_date ON serial_numbers(warranty_end_date);

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN cost_price DECIMAL(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE products ADD COLUMN vat_rate DECIMAL(5, 2) DEFAULT 10 NOT NULL;
ALTER TABLE products ADD COLUMN reserved_quantity INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 5 NOT NULL;
ALTER TABLE products ADD COLUMN warranty_months INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE products ADD COLUMN condition VARCHAR(20) DEFAULT 'new';
ALTER TABLE products ADD COLUMN is_serialized BOOLEAN DEFAULT 0;
ALTER TABLE products ADD COLUMN track_inventory BOOLEAN DEFAULT 1;
ALTER TABLE products ADD COLUMN last_ordered_at DATETIME;

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN subtotal DECIMAL(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN tax_amount DECIMAL(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cash' NOT NULL;
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'paid' NOT NULL;
ALTER TABLE orders ADD COLUMN amount_paid DECIMAL(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN balance_due DECIMAL(15, 2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN invoice_number VARCHAR(50) UNIQUE;
ALTER TABLE orders ADD COLUMN tax_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Create price history tracking table
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  old_price DECIMAL(15, 2) NOT NULL,
  new_price DECIMAL(15, 2) NOT NULL,
  changed_by INTEGER NOT NULL,
  change_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Create transaction audit table for better compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for improved performance
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id ON audit_logs(entity_type, entity_id); 