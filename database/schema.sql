-- Database schema cho POS System đơn giản
-- Chạy script này để tạo database

CREATE DATABASE IF NOT EXISTS pos_db;
USE pos_db;

-- Bảng sản phẩm
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  category VARCHAR(100) DEFAULT 'General',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng đơn hàng
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE,
  customer_name VARCHAR(255) DEFAULT 'Khách hàng',
  customer_phone VARCHAR(20),
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Thêm một số dữ liệu mẫu
INSERT INTO products (name, sku, barcode, price, quantity, category, description) VALUES
('Coca Cola 330ml', 'CC330', '1234567890123', 15000, 100, 'Nước uống', 'Nước ngọt Coca Cola lon 330ml'),
('Bánh mì thịt nướng', 'BM001', '2345678901234', 25000, 50, 'Thực phẩm', 'Bánh mì thịt nướng truyền thống'),
('Cà phê đen đá', 'CF001', '3456789012345', 20000, 200, 'Đồ uống', 'Cà phê đen đá truyền thống'),
('Nước suối Aquafina 500ml', 'AQ500', '4567890123456', 8000, 150, 'Nước uống', 'Nước suối tinh khiết Aquafina'),
('Bánh ngọt chocolate', 'BN001', '5678901234567', 35000, 30, 'Bánh kẹo', 'Bánh ngọt chocolate cao cấp'); 