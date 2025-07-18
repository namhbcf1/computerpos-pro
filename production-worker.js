// ComputerPOS Pro Production API Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://pos-frontend-e1q.pages.dev',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize database if needed
    if (env.DB) {
      await initializeDatabase(env.DB);
    }

    // API Routes
    if (url.pathname.startsWith('/api/')) {
      try {
        const response = await handleApiRequest(request, url, env);
        return new Response(JSON.stringify(response), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message 
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Health check
    return new Response(JSON.stringify({
      message: 'ComputerPOS Pro API - Production',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/products',
        '/api/customers', 
        '/api/orders',
        '/api/serials',
        '/api/warranty',
        '/api/financial/stats'
      ]
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  },
};

async function initializeDatabase(db) {
  try {
    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER DEFAULT 0,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      );

      CREATE TABLE IF NOT EXISTS serial_numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serial_number TEXT UNIQUE NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      CREATE TABLE IF NOT EXISTS warranties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serial_number TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS financial_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data if tables are empty
    const productCount = await db.prepare('SELECT COUNT(*) as count FROM products').first();
    if (productCount.count === 0) {
      await insertSampleData(db);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

async function insertSampleData(db) {
  // Sample products
  await db.exec(`
    INSERT INTO products (name, sku, price, category, stock, description) VALUES
    ('CPU Intel Core i7-13700K', 'CPU-I7-13700K', 8500000, 'CPU', 15, 'Bộ vi xử lý Intel thế hệ 13'),
    ('GPU NVIDIA RTX 4080', 'GPU-RTX-4080', 25000000, 'GPU', 8, 'Card đồ họa RTX 4080 16GB'),
    ('RAM Corsair 32GB DDR5-5600', 'RAM-32GB-DDR5', 4500000, 'RAM', 20, 'Bộ nhớ DDR5 32GB'),
    ('SSD Samsung 980 PRO 1TB', 'SSD-980PRO-1TB', 3200000, 'Storage', 25, 'Ổ cứng SSD NVMe 1TB'),
    ('Motherboard ASUS Z790', 'MB-ASUS-Z790', 6800000, 'Motherboard', 12, 'Bo mạch chủ Z790 chipset');
  `);

  // Sample customers
  await db.exec(`
    INSERT INTO customers (name, phone, email, address) VALUES
    ('Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', 'TP.HCM'),
    ('Trần Thị B', '0907654321', 'tranthib@email.com', 'Hà Nội'),
    ('Lê Văn C', '0912345678', 'levanc@email.com', 'Đà Nẵng');
  `);

  // Sample orders
  await db.exec(`
    INSERT INTO orders (id, customer_id, customer_name, total, status) VALUES
    ('DH001', 1, 'Nguyễn Văn A', 15000000, 'completed'),
    ('DH002', 2, 'Trần Thị B', 25000000, 'pending'),
    ('DH003', 3, 'Lê Văn C', 35000000, 'processing');
  `);

  // Sample serial numbers
  await db.exec(`
    INSERT INTO serial_numbers (serial_number, product_id, product_name, status) VALUES
    ('SN001-CPU-I7', 1, 'CPU Intel Core i7-13700K', 'available'),
    ('SN002-GPU-RTX', 2, 'GPU NVIDIA RTX 4080', 'sold'),
    ('SN003-RAM-32GB', 3, 'RAM Corsair 32GB DDR5', 'warranty');
  `);

  // Sample warranties
  await db.exec(`
    INSERT INTO warranties (serial_number, status, expiry_date) VALUES
    ('SN001-CPU-I7', 'active', '2025-12-31'),
    ('SN002-GPU-RTX', 'active', '2026-06-30'),
    ('SN003-RAM-32GB', 'active', '2025-09-15');
  `);

  // Sample financial data
  await db.exec(`
    INSERT INTO financial_transactions (type, amount, description) VALUES
    ('revenue', 50000000, 'Doanh thu tháng 12'),
    ('expense', 35000000, 'Chi phí nhập hàng'),
    ('revenue', 25000000, 'Doanh thu bán lẻ');
  `);
}

async function handleApiRequest(request, url, env) {
  const method = request.method;
  const path = url.pathname;
  const db = env.DB;

  switch (true) {
    case path === '/api/products' && method === 'GET':
      if (db) {
        const products = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
        return { success: true, data: products.results || [] };
      }
      return { success: true, data: [] };
      
    case path === '/api/customers' && method === 'GET':
      if (db) {
        const customers = await db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
        return { success: true, data: customers.results || [] };
      }
      return { success: true, data: [] };
      
    case path === '/api/orders' && method === 'GET':
      if (db) {
        const orders = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
        return { success: true, data: { orders: orders.results || [] } };
      }
      return { success: true, data: { orders: [] } };
      
    case path === '/api/serials' && method === 'GET':
      if (db) {
        const serials = await db.prepare('SELECT * FROM serial_numbers ORDER BY created_at DESC').all();
        return { success: true, data: serials.results || [] };
      }
      return { success: true, data: [] };
      
    case path === '/api/warranty' && method === 'GET':
      if (db) {
        const warranties = await db.prepare('SELECT * FROM warranties ORDER BY created_at DESC').all();
        return { success: true, data: warranties.results || [] };
      }
      return { success: true, data: [] };

    case path === '/api/financial/stats' && method === 'GET':
      if (db) {
        const revenue = await db.prepare("SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'revenue'").first();
        const expenses = await db.prepare("SELECT SUM(amount) as total FROM financial_transactions WHERE type = 'expense'").first();
        const totalRevenue = revenue?.total || 0;
        const totalExpenses = expenses?.total || 0;
        const netProfit = totalRevenue - totalExpenses;
        
        return {
          success: true,
          data: {
            total_revenue: totalRevenue,
            total_expenses: totalExpenses,
            net_profit: netProfit,
            profit_margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0
          }
        };
      }
      return { success: true, data: { total_revenue: 0, total_expenses: 0, net_profit: 0, profit_margin: 0 } };

    default:
      throw new Error(`Route not found: ${method} ${path}`);
  }
}
