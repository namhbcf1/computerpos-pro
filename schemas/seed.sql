-- ComputerPOS Pro - Seed Data
-- Sample data for Vietnamese Computer Hardware POS System

-- Insert default user
INSERT INTO users (username, email, password_hash, full_name, role, phone) VALUES
('admin', 'admin@computerpos.vn', '$2b$12$LQv3c1yqBwlVHpPjrU3BEuVHkjAVxNPWxZPjfQWfBuJ9WnHqrDjqK', 'Quản trị viên', 'admin', '0123456789'),
('cashier1', 'cashier1@computerpos.vn', '$2b$12$LQv3c1yqBwlVHpPjrU3BEuVHkjAVxNPWxZPjfQWfBuJ9WnHqrDjqK', 'Nguyễn Văn A', 'cashier', '0987654321'),
('manager1', 'manager1@computerpos.vn', '$2b$12$LQv3c1yqBwlVHpPjrU3BEuVHkjAVxNPWxZPjfQWfBuJ9WnHqrDjqK', 'Trần Thị B', 'manager', '0912345678');

-- Insert product categories
INSERT INTO categories (name, name_vi, description) VALUES
('CPU', 'Bộ vi xử lý', 'Bộ vi xử lý Intel và AMD'),
('Mainboard', 'Bo mạch chủ', 'Bo mạch chủ các hãng'),
('RAM', 'Bộ nhớ', 'Bộ nhớ DDR4, DDR5'),
('VGA', 'Card đồ họa', 'Card đồ họa NVIDIA, AMD'),
('SSD', 'Ổ cứng SSD', 'Ổ cứng SSD các loại'),
('HDD', 'Ổ cứng HDD', 'Ổ cứng HDD'),
('PSU', 'Nguồn máy tính', 'Nguồn máy tính'),
('Case', 'Vỏ máy tính', 'Vỏ máy tính'),
('Cooling', 'Tản nhiệt', 'Tản nhiệt CPU, case fan');

-- Insert brands
INSERT INTO brands (name, website, description) VALUES
('Intel', 'https://www.intel.com', 'Nhà sản xuất CPU hàng đầu'),
('AMD', 'https://www.amd.com', 'Nhà sản xuất CPU và GPU'),
('NVIDIA', 'https://www.nvidia.com', 'Nhà sản xuất GPU hàng đầu'),
('ASUS', 'https://www.asus.com', 'Nhà sản xuất bo mạch chủ và linh kiện'),
('MSI', 'https://www.msi.com', 'Nhà sản xuất bo mạch chủ và GPU'),
('Gigabyte', 'https://www.gigabyte.com', 'Nhà sản xuất bo mạch chủ'),
('Corsair', 'https://www.corsair.com', 'Nhà sản xuất RAM và nguồn'),
('G.Skill', 'https://www.gskill.com', 'Nhà sản xuất RAM'),
('Kingston', 'https://www.kingston.com', 'Nhà sản xuất RAM và SSD'),
('Samsung', 'https://www.samsung.com', 'Nhà sản xuất SSD và RAM'),
('Western Digital', 'https://www.westerndigital.com', 'Nhà sản xuất HDD và SSD'),
('Seagate', 'https://www.seagate.com', 'Nhà sản xuất HDD'),
('Seasonic', 'https://www.seasonic.com', 'Nhà sản xuất nguồn máy tính'),
('Thermaltake', 'https://www.thermaltake.com', 'Nhà sản xuất vỏ máy và tản nhiệt'),
('Cooler Master', 'https://www.coolermaster.com', 'Nhà sản xuất vỏ máy và tản nhiệt');

-- Insert CPU products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('CPU-INTEL-i5-13400F', '8806194558598', 'Intel Core i5-13400F', 'Intel Core i5-13400F', 'Bộ vi xử lý Intel Core i5 thế hệ 13, 10 nhân 16 luồng', 1, 1, 4200000, 4690000, 4890000, 36),
('CPU-INTEL-i7-13700K', '8806194558604', 'Intel Core i7-13700K', 'Intel Core i7-13700K', 'Bộ vi xử lý Intel Core i7 thế hệ 13, 16 nhân 24 luồng', 1, 1, 8900000, 9990000, 10490000, 36),
('CPU-AMD-R5-7600X', '0730143312851', 'AMD Ryzen 5 7600X', 'AMD Ryzen 5 7600X', 'Bộ vi xử lý AMD Ryzen 5 thế hệ 7000, 6 nhân 12 luồng', 1, 2, 5400000, 5990000, 6290000, 36),
('CPU-AMD-R7-7700X', '0730143312868', 'AMD Ryzen 7 7700X', 'AMD Ryzen 7 7700X', 'Bộ vi xử lý AMD Ryzen 7 thế hệ 7000, 8 nhân 16 luồng', 1, 2, 7200000, 7990000, 8390000, 36);

-- Insert Mainboard products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('MB-ASUS-B760M-A-WIFI', '4711081887157', 'ASUS PRIME B760M-A WIFI', 'ASUS PRIME B760M-A WIFI', 'Bo mạch chủ Intel B760, socket LGA1700, Micro ATX', 2, 4, 2890000, 3290000, 3490000, 36),
('MB-MSI-B760M-PRO-B', '4719072881934', 'MSI PRO B760M-B DDR4', 'MSI PRO B760M-B DDR4', 'Bo mạch chủ Intel B760, socket LGA1700, Micro ATX', 2, 5, 2490000, 2790000, 2990000, 36),
('MB-ASUS-B650M-A-WIFI', '4711081975434', 'ASUS PRIME B650M-A WIFI', 'ASUS PRIME B650M-A WIFI', 'Bo mạch chủ AMD B650, socket AM5, Micro ATX', 2, 4, 3290000, 3690000, 3890000, 36),
('MB-MSI-B650M-PRO-B', '4719072881941', 'MSI PRO B650M-B', 'MSI PRO B650M-B', 'Bo mạch chủ AMD B650, socket AM5, Micro ATX', 2, 5, 2890000, 3190000, 3390000, 36);

-- Insert RAM products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('RAM-CORSAIR-16GB-DDR4-3200', '0843591070849', 'Corsair Vengeance LPX 16GB DDR4-3200', 'Corsair Vengeance LPX 16GB DDR4-3200', 'Bộ nhớ DDR4 16GB (2x8GB) 3200MHz', 3, 7, 1690000, 1890000, 1990000, 36),
('RAM-GSKILL-32GB-DDR4-3200', '4719692004567', 'G.Skill Ripjaws V 32GB DDR4-3200', 'G.Skill Ripjaws V 32GB DDR4-3200', 'Bộ nhớ DDR4 32GB (2x16GB) 3200MHz', 3, 8, 3290000, 3690000, 3890000, 36),
('RAM-CORSAIR-16GB-DDR5-5600', '0843591089553', 'Corsair Vengeance DDR5 16GB 5600MHz', 'Corsair Vengeance DDR5 16GB 5600MHz', 'Bộ nhớ DDR5 16GB (2x8GB) 5600MHz', 3, 7, 2490000, 2790000, 2990000, 36),
('RAM-KINGSTON-32GB-DDR5-5600', '0740617326419', 'Kingston Fury Beast 32GB DDR5-5600', 'Kingston Fury Beast 32GB DDR5-5600', 'Bộ nhớ DDR5 32GB (2x16GB) 5600MHz', 3, 9, 4290000, 4690000, 4990000, 36);

-- Insert VGA products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('VGA-NVIDIA-RTX4060-ASUS', '4711081887164', 'ASUS GeForce RTX 4060 DUAL OC', 'ASUS GeForce RTX 4060 DUAL OC', 'Card đồ họa NVIDIA RTX 4060, 8GB GDDR6', 4, 4, 8490000, 9490000, 9990000, 36),
('VGA-NVIDIA-RTX4070-MSI', '4719072881958', 'MSI GeForce RTX 4070 GAMING X TRIO', 'MSI GeForce RTX 4070 GAMING X TRIO', 'Card đồ họa NVIDIA RTX 4070, 12GB GDDR6X', 4, 5, 14490000, 15990000, 16990000, 36),
('VGA-AMD-RX7600-ASUS', '4711081887171', 'ASUS AMD Radeon RX 7600 DUAL OC', 'ASUS AMD Radeon RX 7600 DUAL OC', 'Card đồ họa AMD RX 7600, 8GB GDDR6', 4, 4, 7490000, 8290000, 8790000, 36),
('VGA-AMD-RX7700XT-MSI', '4719072881965', 'MSI AMD Radeon RX 7700 XT GAMING X TRIO', 'MSI AMD Radeon RX 7700 XT GAMING X TRIO', 'Card đồ họa AMD RX 7700 XT, 12GB GDDR6', 4, 5, 11490000, 12990000, 13690000, 36);

-- Insert SSD products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('SSD-SAMSUNG-980-1TB', '8806092043439', 'Samsung 980 NVMe SSD 1TB', 'Samsung 980 NVMe SSD 1TB', 'Ổ cứng SSD NVMe M.2 1TB', 5, 10, 1990000, 2290000, 2490000, 60),
('SSD-WD-SN570-500GB', '0718037878958', 'WD Blue SN570 NVMe SSD 500GB', 'WD Blue SN570 NVMe SSD 500GB', 'Ổ cứng SSD NVMe M.2 500GB', 5, 11, 1290000, 1490000, 1690000, 60),
('SSD-KINGSTON-NV2-1TB', '0740617326426', 'Kingston NV2 PCIe 4.0 SSD 1TB', 'Kingston NV2 PCIe 4.0 SSD 1TB', 'Ổ cứng SSD NVMe M.2 PCIe 4.0 1TB', 5, 9, 1690000, 1890000, 2090000, 60),
('SSD-SAMSUNG-980PRO-2TB', '8806092043446', 'Samsung 980 PRO NVMe SSD 2TB', 'Samsung 980 PRO NVMe SSD 2TB', 'Ổ cứng SSD NVMe M.2 PCIe 4.0 2TB', 5, 10, 4290000, 4790000, 5190000, 60);

-- Insert HDD products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('HDD-WD-BLUE-1TB', '0718037878965', 'WD Blue 1TB 7200RPM', 'WD Blue 1TB 7200RPM', 'Ổ cứng HDD 1TB 7200RPM SATA 3.5\"', 6, 11, 1090000, 1290000, 1390000, 24),
('HDD-SEAGATE-BARRACUDA-2TB', '0763649094877', 'Seagate Barracuda 2TB 7200RPM', 'Seagate Barracuda 2TB 7200RPM', 'Ổ cứng HDD 2TB 7200RPM SATA 3.5\"', 6, 12, 1890000, 2190000, 2390000, 24),
('HDD-WD-BLACK-4TB', '0718037878972', 'WD Black 4TB 7200RPM', 'WD Black 4TB 7200RPM', 'Ổ cứng HDD 4TB 7200RPM SATA 3.5\"', 6, 11, 3290000, 3690000, 3990000, 60),
('HDD-SEAGATE-IRONWOLF-8TB', '0763649094884', 'Seagate IronWolf 8TB 7200RPM', 'Seagate IronWolf 8TB 7200RPM', 'Ổ cứng HDD 8TB 7200RPM SATA 3.5\" NAS', 6, 12, 5490000, 5990000, 6390000, 36);

-- Insert PSU products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('PSU-CORSAIR-CV550-550W', '0843591089560', 'Corsair CV550 550W 80+ Bronze', 'Corsair CV550 550W 80+ Bronze', 'Nguồn máy tính 550W 80+ Bronze', 7, 7, 1390000, 1590000, 1790000, 36),
('PSU-SEASONIC-FOCUS-650W', '4711173887188', 'Seasonic Focus GX-650 650W 80+ Gold', 'Seasonic Focus GX-650 650W 80+ Gold', 'Nguồn máy tính 650W 80+ Gold Modular', 7, 13, 2490000, 2790000, 2990000, 120),
('PSU-CORSAIR-RM750-750W', '0843591089577', 'Corsair RM750 750W 80+ Gold', 'Corsair RM750 750W 80+ Gold', 'Nguồn máy tính 750W 80+ Gold Modular', 7, 7, 2890000, 3290000, 3490000, 120),
('PSU-SEASONIC-PRIME-850W', '4711173887195', 'Seasonic Prime TX-850 850W 80+ Titanium', 'Seasonic Prime TX-850 850W 80+ Titanium', 'Nguồn máy tính 850W 80+ Titanium Modular', 7, 13, 4490000, 4990000, 5390000, 144);

-- Insert Case products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('CASE-COOLERMASTER-MB511-RGB', '4719512090893', 'Cooler Master MasterBox MB511 RGB', 'Cooler Master MasterBox MB511 RGB', 'Vỏ máy tính Mid Tower ATX RGB', 8, 15, 1490000, 1690000, 1890000, 24),
('CASE-THERMALTAKE-V200-TG', '4717964409157', 'Thermaltake V200 Tempered Glass', 'Thermaltake V200 Tempered Glass', 'Vỏ máy tính Mid Tower ATX kính cường lực', 8, 14, 1890000, 2090000, 2290000, 24),
('CASE-COOLERMASTER-H500-ARGB', '4719512090909', 'Cooler Master MasterCase H500 ARGB', 'Cooler Master MasterCase H500 ARGB', 'Vỏ máy tính Mid Tower ATX ARGB', 8, 15, 2490000, 2790000, 2990000, 24),
('CASE-THERMALTAKE-LEVEL20-MT', '4717964409164', 'Thermaltake Level 20 MT ARGB', 'Thermaltake Level 20 MT ARGB', 'Vỏ máy tính Mid Tower ATX ARGB Premium', 8, 14, 3290000, 3690000, 3890000, 24);

-- Insert Cooling products
INSERT INTO products (sku, barcode, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, retail_price, warranty_months) VALUES
('COOLING-COOLERMASTER-212-LED', '4719512090916', 'Cooler Master Hyper 212 LED', 'Cooler Master Hyper 212 LED', 'Tản nhiệt CPU Air Cooler LED', 9, 15, 690000, 890000, 990000, 24),
('COOLING-THERMALTAKE-UX100-ARGB', '4717964409171', 'Thermaltake UX100 ARGB', 'Thermaltake UX100 ARGB', 'Tản nhiệt CPU Air Cooler ARGB', 9, 14, 890000, 1090000, 1190000, 24),
('COOLING-CORSAIR-H100i-RGB', '0843591089584', 'Corsair H100i RGB PLATINUM', 'Corsair H100i RGB PLATINUM', 'Tản nhiệt CPU AIO 240mm RGB', 9, 7, 2490000, 2790000, 2990000, 60),
('COOLING-THERMALTAKE-FLOE-DX-360', '4717964409188', 'Thermaltake Floe DX 360 ARGB', 'Thermaltake Floe DX 360 ARGB', 'Tản nhiệt CPU AIO 360mm ARGB', 9, 14, 3490000, 3890000, 4190000, 60);

-- Insert inventory for all products
INSERT INTO inventory (product_id, quantity, reserved_quantity)
SELECT id, 
  CASE 
    WHEN category_id = 1 THEN 25  -- CPU
    WHEN category_id = 2 THEN 20  -- Mainboard
    WHEN category_id = 3 THEN 35  -- RAM
    WHEN category_id = 4 THEN 15  -- VGA
    WHEN category_id = 5 THEN 40  -- SSD
    WHEN category_id = 6 THEN 30  -- HDD
    WHEN category_id = 7 THEN 25  -- PSU
    WHEN category_id = 8 THEN 20  -- Case
    WHEN category_id = 9 THEN 30  -- Cooling
  END,
  0
FROM products;

-- Insert sample customers
INSERT INTO customers (customer_code, full_name, phone, email, address, city, customer_type) VALUES
('KH001', 'Nguyễn Văn A', '0123456789', 'nguyenvana@gmail.com', '123 Nguyễn Huệ, Quận 1', 'Hồ Chí Minh', 'individual'),
('KH002', 'Trần Thị B', '0987654321', 'tranthib@gmail.com', '456 Lê Lợi, Quận 3', 'Hồ Chí Minh', 'individual'),
('KH003', 'Lê Văn C', '0912345678', 'levanc@gmail.com', '789 Hai Bà Trưng, Quận 1', 'Hồ Chí Minh', 'individual'),
('KH004', 'Công ty TNHH ABC', '0908765432', 'abc@company.com', '101 Điện Biên Phủ, Quận Bình Thạnh', 'Hồ Chí Minh', 'business'),
('KH005', 'Phạm Thị D', '0945678901', 'phamthid@gmail.com', '202 Võ Văn Tần, Quận 3', 'Hồ Chí Minh', 'individual');

-- Insert sample suppliers
INSERT INTO suppliers (supplier_code, name, contact_person, phone, email, address, city) VALUES
('NCC001', 'Công ty Phân phối Intel Việt Nam', 'Nguyễn Thanh A', '0123456789', 'intel@supplier.vn', '123 Trần Hưng Đạo, Quận 1', 'Hồ Chí Minh'),
('NCC002', 'Công ty Phân phối AMD Việt Nam', 'Trần Văn B', '0987654321', 'amd@supplier.vn', '456 Nguyễn Thị Minh Khai, Quận 3', 'Hồ Chí Minh'),
('NCC003', 'Công ty Phân phối ASUS Việt Nam', 'Lê Thị C', '0912345678', 'asus@supplier.vn', '789 Lê Thánh Tôn, Quận 1', 'Hồ Chí Minh'),
('NCC004', 'Công ty Phân phối MSI Việt Nam', 'Phạm Văn D', '0908765432', 'msi@supplier.vn', '101 Pasteur, Quận 1', 'Hồ Chí Minh'),
('NCC005', 'Công ty Phân phối Corsair Việt Nam', 'Hoàng Thị E', '0945678901', 'corsair@supplier.vn', '202 Cách Mạng Tháng 8, Quận 3', 'Hồ Chí Minh');

-- Insert product specifications
INSERT INTO product_specs (product_id, spec_name, spec_value, spec_unit, display_order) VALUES
-- Intel i5-13400F specs
(1, 'Số nhân', '10', 'nhân', 1),
(1, 'Số luồng', '16', 'luồng', 2),
(1, 'Tốc độ cơ bản', '2.5', 'GHz', 3),
(1, 'Tốc độ tối đa', '4.6', 'GHz', 4),
(1, 'Socket', 'LGA1700', '', 5),
(1, 'TDP', '65', 'W', 6),

-- ASUS B760M-A-WIFI specs
(5, 'Chipset', 'Intel B760', '', 1),
(5, 'Socket', 'LGA1700', '', 2),
(5, 'Form Factor', 'Micro ATX', '', 3),
(5, 'Khe RAM', '4', 'khe', 4),
(5, 'RAM tối đa', '128', 'GB', 5),
(5, 'WiFi', 'WiFi 6', '', 6),

-- Corsair RAM specs
(9, 'Dung lượng', '16', 'GB', 1),
(9, 'Cấu hình', '2x8GB', '', 2),
(9, 'Loại', 'DDR4', '', 3),
(9, 'Tốc độ', '3200', 'MHz', 4),
(9, 'Timing', '16-18-18-36', '', 5),

-- RTX 4060 specs
(13, 'GPU', 'NVIDIA RTX 4060', '', 1),
(13, 'VRAM', '8', 'GB', 2),
(13, 'Loại VRAM', 'GDDR6', '', 3),
(13, 'Bus', '128', 'bit', 4),
(13, 'Boost Clock', '2460', 'MHz', 5);

-- Insert system settings
INSERT INTO settings (key, value, description, category) VALUES
('store_name', 'Cửa Hàng PC Pro', 'Tên cửa hàng', 'store'),
('store_address', '123 Đường ABC, Quận 1, TP.HCM', 'Địa chỉ cửa hàng', 'store'),
('store_phone', '0123.456.789', 'Số điện thoại cửa hàng', 'store'),
('store_email', 'info@pcpro.vn', 'Email cửa hàng', 'store'),
('tax_rate', '10', 'Thuế VAT (%)', 'financial'),
('currency', 'VND', 'Tiền tệ', 'financial'),
('receipt_footer', 'Cảm ơn quý khách đã mua hàng tại PC Pro!', 'Lời cảm ơn trên hóa đơn', 'receipt'),
('warranty_policy', 'Sản phẩm được bảo hành theo chính sách nhà sản xuất', 'Chính sách bảo hành', 'warranty'),
('return_policy', 'Đổi trả trong vòng 7 ngày nếu sản phẩm lỗi', 'Chính sách đổi trả', 'return'),
('min_order_amount', '100000', 'Số tiền đơn hàng tối thiểu (VND)', 'order');

-- Insert sample orders
INSERT INTO orders (order_number, customer_id, user_id, subtotal, tax_amount, total_amount, payment_method, status, payment_status) VALUES
('DH001', 1, 2, 4690000, 469000, 5159000, 'cash', 'completed', 'paid'),
('DH002', 2, 2, 15980000, 1598000, 17578000, 'transfer', 'completed', 'paid'),
('DH003', 3, 2, 2290000, 229000, 2519000, 'cash', 'completed', 'paid'),
('DH004', 4, 2, 12480000, 1248000, 13728000, 'transfer', 'processing', 'pending'),
('DH005', 5, 2, 1890000, 189000, 2079000, 'momo', 'completed', 'paid');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
-- Order 1: Intel i5-13400F
(1, 1, 1, 4690000, 4690000),
-- Order 2: RTX 4070 + RAM
(2, 14, 1, 15990000, 15990000),
-- Order 3: Samsung SSD 1TB
(3, 17, 1, 2290000, 2290000),
-- Order 4: Gaming build components
(4, 2, 1, 9990000, 9990000),
(4, 10, 1, 1890000, 1890000),
(4, 25, 1, 2790000, 2790000),
-- Order 5: Corsair RAM
(5, 9, 1, 1890000, 1890000);

-- Insert payments
INSERT INTO payments (order_id, payment_method, amount, status, processed_at) VALUES
(1, 'cash', 5159000, 'completed', datetime('now', '-2 days')),
(2, 'transfer', 17578000, 'completed', datetime('now', '-1 day')),
(3, 'cash', 2519000, 'completed', datetime('now', '-1 day')),
(5, 'momo', 2079000, 'completed', datetime('now', '-4 hours'));

-- Insert sample PC builds
INSERT INTO pc_builds (build_name, customer_id, user_id, build_type, total_price, compatibility_status, status) VALUES
('Gaming Build RTX 4070', 1, 2, 'gaming', 32500000, 'compatible', 'quote'),
('Office Build Basic', 2, 2, 'office', 15500000, 'compatible', 'completed'),
('Workstation Build', 4, 2, 'workstation', 45000000, 'compatible', 'draft');

-- Insert PC build components
INSERT INTO pc_build_components (build_id, product_id, component_type, quantity, unit_price, total_price) VALUES
-- Gaming Build RTX 4070
(1, 2, 'cpu', 1, 9990000, 9990000),
(1, 6, 'motherboard', 1, 3290000, 3290000),
(1, 11, 'ram', 1, 2790000, 2790000),
(1, 14, 'gpu', 1, 15990000, 15990000),
(1, 17, 'storage', 1, 2290000, 2290000),
(1, 26, 'psu', 1, 2790000, 2790000),
(1, 30, 'case', 1, 1690000, 1690000),
(1, 34, 'cooling', 1, 2790000, 2790000),
-- Office Build Basic
(2, 1, 'cpu', 1, 4690000, 4690000),
(2, 5, 'motherboard', 1, 3290000, 3290000),
(2, 9, 'ram', 1, 1890000, 1890000),
(2, 17, 'storage', 1, 2290000, 2290000),
(2, 25, 'psu', 1, 1590000, 1590000),
(2, 29, 'case', 1, 1690000, 1690000),
(2, 33, 'cooling', 1, 890000, 890000);

-- Insert sample warranty claims
INSERT INTO warranty_claims (claim_number, customer_id, product_id, order_id, issue_description, status, submitted_date) VALUES
('BH001', 1, 13, 1, 'Card đồ họa không hiển thị hình ảnh', 'processing', date('now', '-3 days')),
('BH002', 2, 17, 3, 'SSD không được nhận diện', 'completed', date('now', '-7 days')),
('BH003', 3, 9, 5, 'RAM gây lỗi màn hình xanh', 'submitted', date('now', '-1 day'));

-- Insert sample stock movements
INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, user_id, notes) VALUES
(1, 'in', 50, 'purchase', 1, 'Nhập hàng từ nhà cung cấp'),
(1, 'out', 1, 'sale', 2, 'Bán cho khách hàng'),
(14, 'in', 20, 'purchase', 1, 'Nhập hàng RTX 4070'),
(14, 'out', 1, 'sale', 2, 'Bán RTX 4070'),
(17, 'in', 100, 'purchase', 1, 'Nhập hàng SSD Samsung'),
(17, 'out', 1, 'sale', 2, 'Bán SSD 1TB'),
(9, 'adjustment', -2, 'adjustment', 1, 'Kiểm kê phát hiện thiếu hàng');