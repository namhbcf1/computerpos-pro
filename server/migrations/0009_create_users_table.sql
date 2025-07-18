-- Migration: Create users table
-- Date: 2024-01-15

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'inventory_staff')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Insert default admin user
INSERT OR IGNORE INTO users (username, full_name, email, role, password, is_active)
VALUES (
    'admin',
    'Quản trị viên hệ thống',
    'admin@posystem.com',
    'admin',
    'password', -- Simple password for demo
    1
);

-- Insert sample users for testing
INSERT OR IGNORE INTO users (username, full_name, email, phone, role, password, is_active)
VALUES
    ('manager01', 'Nguyễn Văn Quản Lý', 'manager@posystem.com', '0902345678', 'manager', 'password', 1),
    ('cashier01', 'Trần Thị Thu Ngân', 'cashier@posystem.com', '0903456789', 'cashier', 'password', 1),
    ('warehouse01', 'Lê Văn Kho', 'warehouse@posystem.com', '0904567890', 'inventory_staff', 'password', 1);