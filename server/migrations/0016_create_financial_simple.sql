-- Simple migration to create financial_transactions table

CREATE TABLE IF NOT EXISTS financial_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  reference_type TEXT CHECK(reference_type IN ('sale', 'purchase', 'other')),
  reference_id INTEGER,
  customer_id INTEGER REFERENCES customers(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  user_id INTEGER REFERENCES users(id),
  payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'bank', 'card', 'other')),
  account_number TEXT,
  receipt_number TEXT,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample financial transactions
INSERT OR IGNORE INTO financial_transactions (type, category, amount, description, payment_method, transaction_date) VALUES
('income', 'sales', 500000, 'Bán hàng ngày 18/07/2025', 'cash', '2025-07-18 10:00:00'),
('expense', 'purchase', 300000, 'Mua hàng từ nhà cung cấp', 'bank', '2025-07-18 09:00:00'),
('income', 'sales', 750000, 'Bán hàng ngày 18/07/2025', 'card', '2025-07-18 14:00:00'),
('expense', 'utilities', 200000, 'Tiền điện tháng 7', 'bank', '2025-07-18 08:00:00');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_financial_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_customer ON financial_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_financial_supplier ON financial_transactions(supplier_id);
