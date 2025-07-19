// ComputerPOS Pro - Database Migration Script
// Migrate from mock data to Cloudflare D1 with enhanced schema

import fs from 'fs';
import path from 'path';

export class DatabaseMigrator {
  constructor(db) {
    this.db = db;
  }

  /**
   * Run all migrations to set up the database
   */
  async runMigrations() {
    console.log('🚀 Starting ComputerPOS Pro database migration...');
    
    try {
      // 1. Create tables from schema
      await this.createTables();
      
      // 2. Insert initial data
      await this.insertInitialData();
      
      // 3. Create indexes for performance
      await this.createIndexes();
      
      // 4. Set up triggers
      await this.createTriggers();
      
      // 5. Verify migration
      await this.verifyMigration();
      
      console.log('✅ Database migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create all tables from schema
   */
  async createTables() {
    console.log('📋 Creating database tables...');
    
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.toUpperCase().includes('CREATE TABLE') || 
          statement.toUpperCase().includes('CREATE INDEX')) {
        try {
          await this.db.exec(statement);
          console.log(`  ✓ Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          console.warn(`  ⚠️ Warning: ${error.message}`);
        }
      }
    }
  }

  /**
   * Insert initial data for Vietnamese computer store
   */
  async insertInitialData() {
    console.log('💾 Inserting initial data...');
    
    // Insert staff
    await this.insertStaff();
    
    // Insert products
    await this.insertProducts();
    
    // Insert customers
    await this.insertCustomers();
    
    // Insert compatibility rules
    await this.insertCompatibilityRules();
    
    console.log('  ✓ Initial data inserted');
  }

  async insertStaff() {
    const staff = [
      {
        username: 'admin',
        password_hash: '$2b$10$example_hash_here', // In production, use proper bcrypt
        full_name: 'Administrator',
        email: 'admin@computerpos.vn',
        role: 'admin',
        permissions: JSON.stringify(['all'])
      },
      {
        username: 'sales1',
        password_hash: '$2b$10$example_hash_here',
        full_name: 'Nguyễn Văn Sales',
        email: 'sales1@computerpos.vn',
        role: 'sales',
        permissions: JSON.stringify(['pos', 'customers', 'products:read'])
      },
      {
        username: 'tech1',
        password_hash: '$2b$10$example_hash_here',
        full_name: 'Trần Thị Kỹ Thuật',
        email: 'tech1@computerpos.vn',
        role: 'technician',
        permissions: JSON.stringify(['build', 'inventory', 'warranty'])
      }
    ];

    for (const member of staff) {
      await this.db.prepare(`
        INSERT OR IGNORE INTO staff 
        (username, password_hash, full_name, email, role, permissions)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        member.username,
        member.password_hash,
        member.full_name,
        member.email,
        member.role,
        member.permissions
      ).run();
    }
  }

  async insertProducts() {
    const products = [
      // CPUs
      {
        name: 'Intel Core i9-13900K',
        sku: 'CPU-I9-13900K',
        category: 'CPU',
        brand: 'Intel',
        price: 12500000,
        cost_price: 10000000,
        stock: 8,
        min_stock: 3,
        description: 'Bộ vi xử lý Intel Core i9 thế hệ 13, 24 cores, 32 threads',
        specifications: JSON.stringify({
          socket: 'LGA1700',
          cores: 24,
          threads: 32,
          tdp: 125,
          baseFreq: 3.0,
          boostFreq: 5.8
        }),
        warranty_months: 36
      },
      {
        name: 'AMD Ryzen 9 7900X',
        sku: 'CPU-R9-7900X',
        category: 'CPU',
        brand: 'AMD',
        price: 11800000,
        cost_price: 9500000,
        stock: 6,
        min_stock: 3,
        description: 'Bộ vi xử lý AMD Ryzen 9 7000 series, 12 cores, 24 threads',
        specifications: JSON.stringify({
          socket: 'AM5',
          cores: 12,
          threads: 24,
          tdp: 170,
          baseFreq: 4.7,
          boostFreq: 5.6
        }),
        warranty_months: 36
      },
      
      // GPUs
      {
        name: 'NVIDIA GeForce RTX 4090',
        sku: 'GPU-RTX-4090',
        category: 'GPU',
        brand: 'NVIDIA',
        price: 45000000,
        cost_price: 38000000,
        stock: 3,
        min_stock: 2,
        description: 'Card đồ họa RTX 4090 24GB GDDR6X, flagship gaming',
        specifications: JSON.stringify({
          vramSize: 24,
          vramType: 'GDDR6X',
          powerRequirement: 450,
          length: 336,
          slots: 3,
          outputs: ['HDMI 2.1', 'DisplayPort 1.4a']
        }),
        warranty_months: 36
      },
      {
        name: 'AMD Radeon RX 7900 XTX',
        sku: 'GPU-RX-7900XTX',
        category: 'GPU',
        brand: 'AMD',
        price: 28000000,
        cost_price: 23000000,
        stock: 5,
        min_stock: 2,
        description: 'Card đồ họa RX 7900 XTX 24GB GDDR6, high-end gaming',
        specifications: JSON.stringify({
          vramSize: 24,
          vramType: 'GDDR6',
          powerRequirement: 355,
          length: 324,
          slots: 2.5
        }),
        warranty_months: 24
      },
      
      // Motherboards
      {
        name: 'ASUS ROG MAXIMUS Z790 HERO',
        sku: 'MB-ASUS-Z790-HERO',
        category: 'Motherboard',
        brand: 'ASUS',
        price: 15800000,
        cost_price: 12500000,
        stock: 4,
        min_stock: 2,
        description: 'Bo mạch chủ Z790 cao cấp, hỗ trợ DDR5, PCIe 5.0',
        specifications: JSON.stringify({
          socket: 'LGA1700',
          chipset: 'Z790',
          ramType: 'DDR5',
          ramSlots: 4,
          maxRamCapacity: 128,
          pciSlots: 4,
          m2Slots: 5,
          wifi: 'WiFi 6E',
          ethernet: '2.5Gb'
        }),
        warranty_months: 36
      },
      
      // RAM
      {
        name: 'G.SKILL Trident Z5 DDR5-6000 32GB (2x16GB)',
        sku: 'RAM-GSKILL-DDR5-6000-32GB',
        category: 'RAM',
        brand: 'G.SKILL',
        price: 6800000,
        cost_price: 5200000,
        stock: 15,
        min_stock: 8,
        description: 'Bộ nhớ DDR5-6000 32GB kit, RGB, gaming performance',
        specifications: JSON.stringify({
          type: 'DDR5',
          speed: 6000,
          capacity: 32,
          sticks: 2,
          timings: 'CL36-36-36-96',
          voltage: 1.35,
          rgb: true
        }),
        warranty_months: 60
      }
    ];

    for (const product of products) {
      await this.db.prepare(`
        INSERT OR IGNORE INTO products 
        (name, sku, category, brand, price, cost_price, stock, min_stock, description, specifications, warranty_months)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        product.name,
        product.sku,
        product.category,
        product.brand,
        product.price,
        product.cost_price,
        product.stock,
        product.min_stock,
        product.description,
        product.specifications,
        product.warranty_months
      ).run();
    }
  }

  async insertCustomers() {
    const customers = [
      {
        name: 'Nguyễn Văn Gamer',
        phone: '0901234567',
        email: 'gamer@email.com',
        address: '123 Nguyễn Huệ, Quận 1',
        city: 'TP.HCM',
        customer_type: 'individual',
        preferences: JSON.stringify({
          useCase: 'gaming',
          budget: '30-50 triệu',
          preferredBrands: ['NVIDIA', 'Intel', 'ASUS']
        })
      },
      {
        name: 'Công ty TNHH Thiết Kế ABC',
        phone: '0281234567',
        email: 'contact@abc-design.com',
        address: '456 Lê Lợi, Quận 3',
        city: 'TP.HCM',
        customer_type: 'business',
        preferences: JSON.stringify({
          useCase: 'content_creation',
          budget: '100+ triệu',
          preferredBrands: ['AMD', 'NVIDIA', 'Corsair']
        })
      },
      {
        name: 'Trần Thị Streamer',
        phone: '0907654321',
        email: 'streamer@email.com',
        address: '789 Trần Hưng Đạo, Ba Đình',
        city: 'Hà Nội',
        customer_type: 'individual',
        preferences: JSON.stringify({
          useCase: 'streaming',
          budget: '40-70 triệu',
          preferredBrands: ['AMD', 'NVIDIA']
        })
      }
    ];

    for (const customer of customers) {
      await this.db.prepare(`
        INSERT OR IGNORE INTO customers 
        (name, phone, email, address, city, customer_type, preferences)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
        customer.city,
        customer.customer_type,
        customer.preferences
      ).run();
    }
  }

  async insertCompatibilityRules() {
    const rules = [
      {
        component1_category: 'CPU',
        component2_category: 'Motherboard',
        rule_type: 'socket',
        rule_description: 'CPU socket phải khớp với socket motherboard',
        is_critical: true
      },
      {
        component1_category: 'RAM',
        component2_category: 'Motherboard',
        rule_type: 'interface',
        rule_description: 'Loại RAM (DDR4/DDR5) phải tương thích với motherboard',
        is_critical: true
      },
      {
        component1_category: 'GPU',
        component2_category: 'PSU',
        rule_type: 'power',
        rule_description: 'PSU phải có đủ công suất cho GPU',
        is_critical: true
      },
      {
        component1_category: 'GPU',
        component2_category: 'Case',
        rule_type: 'physical',
        rule_description: 'GPU phải vừa với kích thước case',
        is_critical: true
      }
    ];

    for (const rule of rules) {
      await this.db.prepare(`
        INSERT OR IGNORE INTO compatibility_rules 
        (component1_category, component2_category, rule_type, rule_description, is_critical)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        rule.component1_category,
        rule.component2_category,
        rule.rule_type,
        rule.rule_description,
        rule.is_critical
      ).run();
    }
  }

  async createIndexes() {
    console.log('🔍 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)',
      'CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
      'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)'
    ];

    for (const indexSql of indexes) {
      try {
        await this.db.exec(indexSql);
      } catch (error) {
        console.warn(`Index creation warning: ${error.message}`);
      }
    }
  }

  async createTriggers() {
    console.log('⚡ Creating database triggers...');
    
    // Trigger to update timestamps
    await this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_products_timestamp
      AFTER UPDATE ON products
      BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    await this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_customers_timestamp
      AFTER UPDATE ON customers
      BEGIN
        UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);
  }

  async verifyMigration() {
    console.log('🔍 Verifying migration...');
    
    // Check if tables exist and have data
    const tables = ['products', 'customers', 'staff', 'compatibility_rules'];
    
    for (const table of tables) {
      const result = await this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
      console.log(`  ✓ Table ${table}: ${result.count} records`);
    }
    
    // Verify indexes
    const indexes = await this.db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type = 'index' AND name LIKE 'idx_%'
    `).all();
    
    console.log(`  ✓ Created ${indexes.length} performance indexes`);
  }
}

// Export for use in Cloudflare Worker
export async function runDatabaseMigration(db) {
  const migrator = new DatabaseMigrator(db);
  await migrator.runMigrations();
  return true;
}
