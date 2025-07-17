import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: true, // Allow all origins for now
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Helper function để generate code tự động
function generateCode(prefix, existingCodes = []) {
  let number = 1;
  let code;
  do {
    code = `${prefix}${number.toString().padStart(3, '0')}`;
    number++;
  } while (existingCodes.includes(code));
  return code;
}

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'POS API is running on Cloudflare Workers!',
    timestamp: new Date().toISOString(),
    version: '2.0.0 - Full Featured'
  });
});

// ================================
// AUTHENTICATION & USERS API
// ================================

app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({
        success: false,
        message: 'Username và password là bắt buộc'
      }, 400);
    }

    // Simple authentication for demo (in production, use proper password hashing)
    const { results: users } = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').bind(username).all();
    
    if (users.length === 0) {
      return c.json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa'
      }, 401);
    }

    const user = users[0];
    
    // Update last login
    await c.env.DB.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').bind(user.id).run();

    return c.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]')
      },
      message: 'Đăng nhập thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    }, 500);
  }
});

app.get('/api/users', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT id, username, full_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách nhân viên thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhân viên',
      error: error.message
    }, 500);
  }
});

// ================================
// CUSTOMERS API (CRM)
// ================================

app.get('/api/customers', async (c) => {
  try {
    const { search, type } = c.req.query();
    
    let query = 'SELECT * FROM customers WHERE is_active = 1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR code LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (type && type !== 'all') {
      query += ' AND customer_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách khách hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: error.message
    }, 500);
  }
});

app.get('/api/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      }, 404);
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Lấy thông tin khách hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
      error: error.message
    }, 500);
  }
});

app.post('/api/customers', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.name) {
      return c.json({
        success: false,
        message: 'Tên khách hàng là bắt buộc'
      }, 400);
    }

    // Generate customer code if not provided
    if (!data.code) {
      const { results: existingCodes } = await c.env.DB.prepare('SELECT code FROM customers').all();
      data.code = generateCode('CUS', existingCodes.map(r => r.code));
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO customers (code, name, phone, email, address, customer_type, discount_rate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.code,
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.customer_type || 'regular',
      data.discount_rate || 0,
      data.notes || null
    ).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo khách hàng thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo khách hàng',
      error: error.message
    }, 500);
  }
});

// ================================
// SUPPLIERS API
// ================================

app.get('/api/suppliers', async (c) => {
  try {
    const { search } = c.req.query();
    
    let query = 'SELECT * FROM suppliers WHERE is_active = 1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ? OR contact_person LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách nhà cung cấp thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhà cung cấp',
      error: error.message
    }, 500);
  }
});

app.post('/api/suppliers', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.name) {
      return c.json({
        success: false,
        message: 'Tên nhà cung cấp là bắt buộc'
      }, 400);
    }

    // Generate supplier code if not provided
    if (!data.code) {
      const { results: existingCodes } = await c.env.DB.prepare('SELECT code FROM suppliers').all();
      data.code = generateCode('SUP', existingCodes.map(r => r.code));
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO suppliers (code, name, contact_person, phone, email, address, city, tax_code, payment_terms, credit_limit, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.code,
      data.name,
      data.contact_person || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.city || null,
      data.tax_code || null,
      data.payment_terms || '30 ngày',
      data.credit_limit || 0,
      data.notes || null
    ).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo nhà cung cấp thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo nhà cung cấp',
      error: error.message
    }, 500);
  }
});

// ================================
// CATEGORIES API
// ================================

app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY name').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách danh mục thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message
    }, 500);
  }
});

app.post('/api/categories', async (c) => {
  try {
    const { name, description } = await c.req.json();
    
    if (!name) {
      return c.json({
        success: false,
        message: 'Tên danh mục là bắt buộc'
      }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO categories (name, description)
      VALUES (?, ?)
      RETURNING *
    `).bind(name, description || null).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo danh mục thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo danh mục',
      error: error.message
    }, 500);
  }
});

// ================================
// ENHANCED PRODUCTS API
// ================================

app.get('/api/products', async (c) => {
  try {
    const { search, category_id, supplier_id, low_stock } = c.req.query();
    
    let query = `SELECT * FROM products WHERE is_active = 1 OR is_active IS NULL`;
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (low_stock === 'true') {
      query += ' AND quantity <= min_stock';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    }, 500);
  }
});

app.get('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Lấy thông tin sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm',
      error: error.message
    }, 500);
  }
});

app.post('/api/products', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.name || !data.price) {
      return c.json({
        success: false,
        message: 'Tên sản phẩm và giá là bắt buộc'
      }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO products (name, sku, barcode, price, cost_price, quantity, category_id, supplier_id, min_stock, max_stock, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.name,
      data.sku || null,
      data.barcode || null,
      data.price,
      data.cost_price || data.price * 0.7,
      data.quantity || 0,
      data.category_id || null,
      data.supplier_id || null,
      data.min_stock || 10,
      data.max_stock || 1000,
      data.unit || 'cái',
      data.description || null
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo sản phẩm thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    }, 500);
  }
});

app.put('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      UPDATE products 
      SET name = ?, sku = ?, barcode = ?, price = ?, cost_price = ?, quantity = ?, 
          category_id = ?, supplier_id = ?, min_stock = ?, max_stock = ?, unit = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      data.name || existing[0].name,
      data.sku || existing[0].sku,
      data.barcode || existing[0].barcode,
      data.price !== undefined ? data.price : existing[0].price,
      data.cost_price !== undefined ? data.cost_price : existing[0].cost_price,
      data.quantity !== undefined ? data.quantity : existing[0].quantity,
      data.category_id !== undefined ? data.category_id : existing[0].category_id,
      data.supplier_id !== undefined ? data.supplier_id : existing[0].supplier_id,
      data.min_stock !== undefined ? data.min_stock : existing[0].min_stock,
      data.max_stock !== undefined ? data.max_stock : existing[0].max_stock,
      data.unit || existing[0].unit,
      data.description !== undefined ? data.description : existing[0].description,
      id
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    }, 500);
  }
});

app.delete('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    await c.env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    }, 500);
  }
});

// ================================
// ENHANCED ORDERS API
// ================================

app.get('/api/orders', async (c) => {
  try {
    const { page = 1, limit = 20, status, customer_id, user_id } = c.req.query();
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (customer_id) {
      query += ' AND customer_id = ?';
      params.push(customer_id);
    }
    
    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const { results: orders } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Get order items for each order
    for (let order of orders) {
      const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
      order.items = items;
    }
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const countParams = [];
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const { results: countResult } = await c.env.DB.prepare(countQuery).bind(...countParams).all();
    const total = countResult[0].count;

    return c.json({
      success: true,
      data: {
        orders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      message: 'Lấy danh sách đơn hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    }, 500);
  }
});

app.get('/api/orders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results: orders } = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).all();
    
    if (orders.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      }, 404);
    }
    
    const order = orders[0];
    const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(id).all();
    order.items = items;
    
    return c.json({
      success: true,
      data: order,
      message: 'Lấy thông tin đơn hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng',
      error: error.message
    }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    const { customer_id, user_id, items, notes, discount_amount = 0, tax_amount = 0, payment_method = 'cash' } = await c.req.json();
    
    if (!items || items.length === 0) {
      return c.json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm'
      }, 400);
    }

    // Calculate total amount and check stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(item.product_id).all();
      if (products.length === 0) {
        throw new Error(`Không tìm thấy sản phẩm ID: ${item.product_id}`);
      }

      const product = products[0];
      if (product.quantity < item.quantity) {
        throw new Error(`Sản phẩm "${product.name}" không đủ số lượng. Tồn kho: ${product.quantity}, yêu cầu: ${item.quantity}`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
    }

    const total_amount = subtotal - discount_amount + tax_amount;
    const order_number = `DH${Date.now()}`;

    // Create order
    const { results: orderResult } = await c.env.DB.prepare(`
      INSERT INTO orders (order_number, customer_id, user_id, total_amount, discount_amount, tax_amount, payment_method, paid_amount, change_amount, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      order_number,
      customer_id || null,
      user_id || null,
      total_amount,
      discount_amount,
      tax_amount,
      payment_method,
      total_amount, // paid_amount = total_amount for completed orders
      0, // change_amount
      'completed',
      notes || null
    ).all();

    const order = orderResult[0];

    // Create order items and update stock
    for (const item of orderItems) {
      // Insert order item
      await c.env.DB.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        order.id,
        item.product_id,
        item.product_name,
        item.quantity,
        item.price,
        item.subtotal
      ).run();

      // Update product stock
      await c.env.DB.prepare(`
        UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(item.quantity, item.product_id).run();

      // Record inventory transaction
      await c.env.DB.prepare(`
        INSERT INTO inventory_transactions (type, reference_type, reference_id, product_id, quantity_before, quantity_change, quantity_after, sell_price, user_id, notes)
        SELECT 'export', 'sale', ?, ?, quantity + ?, ?, quantity, ?, ?, 'Bán hàng'
        FROM products WHERE id = ?
      `).bind(order.id, item.product_id, item.quantity, -item.quantity, item.price, user_id || null, item.product_id).run();
    }

    // Update customer stats if customer_id provided
    if (customer_id) {
      await c.env.DB.prepare(`
        UPDATE customers 
        SET total_spent = total_spent + ?, visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(total_amount, customer_id).run();
    }

    // Record financial transaction
    await c.env.DB.prepare(`
      INSERT INTO financial_transactions (type, category, amount, description, reference_type, reference_id, customer_id, user_id, payment_method)
      VALUES ('income', 'Bán hàng', ?, ?, 'sale', ?, ?, ?, ?)
    `).bind(
      total_amount,
      `Bán hàng đơn ${order_number}`,
      order.id,
      customer_id || null,
      user_id || null,
      payment_method
    ).run();

    // Get order with items
    const { results: items_result } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
    order.items = items_result;

    return c.json({
      success: true,
      data: order,
      message: 'Tạo đơn hàng thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    }, 500);
  }
});

// ================================
// INVENTORY MANAGEMENT API
// ================================

app.get('/api/inventory/transactions', async (c) => {
  try {
    const { product_id, type, limit = 50 } = c.req.query();
    
    let query = `
      SELECT it.*, p.name as product_name, u.full_name as user_name
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.id
      LEFT JOIN users u ON it.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (product_id) {
      query += ' AND it.product_id = ?';
      params.push(product_id);
    }
    
    if (type && type !== 'all') {
      query += ' AND it.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY it.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy lịch sử giao dịch tồn kho thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy lịch sử giao dịch tồn kho',
      error: error.message
    }, 500);
  }
});

app.post('/api/inventory/adjustment', async (c) => {
  try {
    const { product_id, new_quantity, reason, user_id } = await c.req.json();
    
    if (!product_id || new_quantity === undefined) {
      return c.json({
        success: false,
        message: 'Sản phẩm và số lượng mới là bắt buộc'
      }, 400);
    }

    // Get current product info
    const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(product_id).all();
    if (products.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    const product = products[0];
    const quantity_change = new_quantity - product.quantity;

    // Update product quantity
    await c.env.DB.prepare('UPDATE products SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(new_quantity, product_id).run();

    // Record inventory transaction
    await c.env.DB.prepare(`
      INSERT INTO inventory_transactions (type, reference_type, product_id, quantity_before, quantity_change, quantity_after, user_id, notes)
      VALUES ('adjustment', 'adjustment', ?, ?, ?, ?, ?, ?)
    `).bind(
      product_id,
      product.quantity,
      quantity_change,
      new_quantity,
      user_id || null,
      reason || 'Điều chỉnh tồn kho'
    ).run();

    return c.json({
      success: true,
      message: 'Điều chỉnh tồn kho thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi điều chỉnh tồn kho',
      error: error.message
    }, 500);
  }
});

// ================================
// FINANCIAL TRANSACTIONS API
// ================================

app.get('/api/financial/transactions', async (c) => {
  try {
    const { type, category, limit = 50 } = c.req.query();
    
    let query = `
      SELECT ft.*, c.name as customer_name, s.name as supplier_name, u.full_name as user_name
      FROM financial_transactions ft
      LEFT JOIN customers c ON ft.customer_id = c.id
      LEFT JOIN suppliers s ON ft.supplier_id = s.id
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (type && type !== 'all') {
      query += ' AND ft.type = ?';
      params.push(type);
    }
    
    if (category && category !== 'all') {
      query += ' AND ft.category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY ft.transaction_date DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy lịch sử thu chi thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy lịch sử thu chi',
      error: error.message
    }, 500);
  }
});

app.post('/api/financial/transactions', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.type || !data.category || !data.amount || !data.description) {
      return c.json({
        success: false,
        message: 'Loại, danh mục, số tiền và mô tả là bắt buộc'
      }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO financial_transactions (type, category, amount, description, customer_id, supplier_id, user_id, payment_method, account_number, receipt_number, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.type,
      data.category,
      data.amount,
      data.description,
      data.customer_id || null,
      data.supplier_id || null,
      data.user_id || null,
      data.payment_method || 'cash',
      data.account_number || null,
      data.receipt_number || null,
      data.transaction_date || new Date().toISOString()
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Ghi nhận giao dịch thu chi thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi ghi nhận giao dịch thu chi',
      error: error.message
    }, 500);
  }
});

// ================================
// ADVANCED REPORTS & STATISTICS API
// ================================

app.get('/api/orders/stats/summary', async (c) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Today's stats
    const { results: todayRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE date(created_at) = ?
    `).bind(todayStr).all();
    
    const { results: todayOrders } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE date(created_at) = ?
    `).bind(todayStr).all();
    
    // Total stats
    const { results: totalRevenue } = await c.env.DB.prepare('SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders').all();
    const { results: totalOrders } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').all();
    const { results: totalProducts } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').all();
    const { results: totalCustomers } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM customers WHERE is_active = 1').all();
    
    // Low stock products
    const { results: lowStockProducts } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock AND is_active = 1').all();
    
    // This month revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const { results: monthRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE date(created_at) >= ?
    `).bind(firstDayOfMonth).all();

    return c.json({
      success: true,
      data: {
        today_revenue: todayRevenue[0].revenue || 0,
        today_orders: todayOrders[0].count || 0,
        month_revenue: monthRevenue[0].revenue || 0,
        total_revenue: totalRevenue[0].revenue || 0,
        total_orders: totalOrders[0].count || 0,
        total_products: totalProducts[0].count || 0,
        total_customers: totalCustomers[0].count || 0,
        low_stock_products: lowStockProducts[0].count || 0
      },
      message: 'Lấy thống kê thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    }, 500);
  }
});

app.get('/api/reports/best-selling', async (c) => {
  try {
    const { limit = 10 } = c.req.query();
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        oi.product_name,
        p.sku,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id, oi.product_name, p.sku
      ORDER BY total_sold DESC
      LIMIT ?
    `).bind(parseInt(limit)).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy báo cáo sản phẩm bán chạy thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy báo cáo sản phẩm bán chạy',
      error: error.message
    }, 500);
  }
});

app.get('/api/reports/profit-loss', async (c) => {
  try {
    const { start_date, end_date } = c.req.query();
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date(transaction_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const { results: financialSummary } = await c.env.DB.prepare(`
      SELECT 
        type,
        SUM(amount) as total_amount
      FROM financial_transactions
      ${dateFilter}
      GROUP BY type
    `).bind(...params).all();
    
    let income = 0, expense = 0;
    financialSummary.forEach(item => {
      if (item.type === 'income') income = item.total_amount;
      if (item.type === 'expense') expense = Math.abs(item.total_amount);
    });
    
    return c.json({
      success: true,
      data: {
        income,
        expense,
        profit: income - expense,
        margin: income > 0 ? ((income - expense) / income * 100).toFixed(2) : 0
      },
      message: 'Lấy báo cáo lãi lỗ thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy báo cáo lãi lỗ',
      error: error.message
    }, 500);
  }
});

// ================================
// SERIAL NUMBER MANAGEMENT API
// ================================

// Get all serial numbers for a product
app.get('/api/products/:id/serials', async (c) => {
  try {
    const productId = c.req.param('id');
    const { status = 'available' } = c.req.query();
    
    let query = `
      SELECT ps.*, s.name as supplier_name, p.name as product_name
      FROM product_serials ps
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      LEFT JOIN products p ON ps.product_id = p.id
      WHERE ps.product_id = ?
    `;
    const params = [productId];
    
    if (status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ps.created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách serial',
      error: error.message
    }, 500);
  }
});

// Add new serial numbers to a product
app.post('/api/products/:id/serials', async (c) => {
  try {
    const productId = c.req.param('id');
    const { serials } = await c.req.json();
    
    if (!serials || !Array.isArray(serials) || serials.length === 0) {
      return c.json({
        success: false,
        message: 'Danh sách serial là bắt buộc'
      }, 400);
    }

    // Check if product exists
    const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).all();
    if (products.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    const addedSerials = [];
    
    for (const serialData of serials) {
      if (!serialData.serial_number) {
        continue;
      }

      try {
        const { results } = await c.env.DB.prepare(`
          INSERT INTO product_serials (
            product_id, serial_number, status, condition_grade, 
            purchase_price, warranty_start_date, warranty_end_date,
            supplier_id, location, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `).bind(
          productId,
          serialData.serial_number,
          serialData.status || 'available',
          serialData.condition_grade || 'new',
          serialData.purchase_price || null,
          serialData.warranty_start_date || null,
          serialData.warranty_end_date || null,
          serialData.supplier_id || null,
          serialData.location || null,
          serialData.notes || null
        ).all();

        addedSerials.push(results[0]);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          // Skip duplicate serial numbers
          continue;
        }
        throw error;
      }
    }

    // Update product quantity to match available serials
    await c.env.DB.prepare(`
      UPDATE products SET quantity = (
        SELECT COUNT(*) FROM product_serials 
        WHERE product_id = ? AND status = 'available'
      ), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(productId, productId).run();

    return c.json({
      success: true,
      data: addedSerials,
      message: `Thêm ${addedSerials.length} serial thành công`
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi thêm serial',
      error: error.message
    }, 500);
  }
});

// Update a serial number
app.put('/api/serials/:id', async (c) => {
  try {
    const serialId = c.req.param('id');
    const data = await c.req.json();
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM product_serials WHERE id = ?').bind(serialId).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy serial'
      }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      UPDATE product_serials 
      SET status = ?, condition_grade = ?, purchase_price = ?, 
          warranty_start_date = ?, warranty_end_date = ?,
          supplier_id = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      data.status || existing[0].status,
      data.condition_grade || existing[0].condition_grade,
      data.purchase_price !== undefined ? data.purchase_price : existing[0].purchase_price,
      data.warranty_start_date !== undefined ? data.warranty_start_date : existing[0].warranty_start_date,
      data.warranty_end_date !== undefined ? data.warranty_end_date : existing[0].warranty_end_date,
      data.supplier_id !== undefined ? data.supplier_id : existing[0].supplier_id,
      data.location !== undefined ? data.location : existing[0].location,
      data.notes !== undefined ? data.notes : existing[0].notes,
      serialId
    ).all();

    // Update product quantity if status changed
    if (data.status && data.status !== existing[0].status) {
      await c.env.DB.prepare(`
        UPDATE products SET quantity = (
          SELECT COUNT(*) FROM product_serials 
          WHERE product_id = ? AND status = 'available'
        ), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(existing[0].product_id, existing[0].product_id).run();
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Cập nhật serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi cập nhật serial',
      error: error.message
    }, 500);
  }
});

// Remove a serial number
app.delete('/api/serials/:id', async (c) => {
  try {
    const serialId = c.req.param('id');
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM product_serials WHERE id = ?').bind(serialId).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy serial'
      }, 404);
    }

    await c.env.DB.prepare('DELETE FROM product_serials WHERE id = ?').bind(serialId).run();

    // Update product quantity
    await c.env.DB.prepare(`
      UPDATE products SET quantity = (
        SELECT COUNT(*) FROM product_serials 
        WHERE product_id = ? AND status = 'available'
      ), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(existing[0].product_id, existing[0].product_id).run();

    return c.json({
      success: true,
      message: 'Xóa serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi xóa serial',
      error: error.message
    }, 500);
  }
});

// Sell specific serial numbers (move to sold_serials)
app.post('/api/serials/sell', async (c) => {
  try {
    const { serial_numbers, order_id, customer_id, sold_price, notes } = await c.req.json();
    
    if (!serial_numbers || !Array.isArray(serial_numbers) || serial_numbers.length === 0) {
      return c.json({
        success: false,
        message: 'Danh sách serial cần bán là bắt buộc'
      }, 400);
    }

    const soldSerials = [];
    
    for (const serialNumber of serial_numbers) {
      // Get serial info
      const { results: serials } = await c.env.DB.prepare(`
        SELECT ps.*, p.name as product_name 
        FROM product_serials ps
        LEFT JOIN products p ON ps.product_id = p.id
        WHERE ps.serial_number = ? AND ps.status = 'available'
      `).bind(serialNumber).all();
      
      if (serials.length === 0) {
        continue; // Skip if serial not found or already sold
      }

      const serial = serials[0];

      // Insert into sold_serials
      await c.env.DB.prepare(`
        INSERT INTO sold_serials (
          product_id, serial_number, order_id, customer_id,
          sold_price, warranty_start_date, warranty_end_date,
          condition_at_sale, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        serial.product_id,
        serial.serial_number,
        order_id || null,
        customer_id || null,
        sold_price || 0,
        serial.warranty_start_date,
        serial.warranty_end_date,
        serial.condition_grade,
        notes || null
      ).run();

      // Update serial status to sold
      await c.env.DB.prepare(`
        UPDATE product_serials 
        SET status = 'sold', updated_at = CURRENT_TIMESTAMP 
        WHERE serial_number = ?
      `).bind(serial.serial_number).run();

      soldSerials.push({
        serial_number: serial.serial_number,
        product_name: serial.product_name,
        product_id: serial.product_id
      });
    }

    // Update product quantities for affected products
    const productIds = [...new Set(soldSerials.map(s => s.product_id))];
    for (const productId of productIds) {
      await c.env.DB.prepare(`
        UPDATE products SET quantity = (
          SELECT COUNT(*) FROM product_serials 
          WHERE product_id = ? AND status = 'available'
        ), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(productId, productId).run();
    }

    return c.json({
      success: true,
      data: soldSerials,
      message: `Bán ${soldSerials.length} serial thành công`
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi bán serial',
      error: error.message
    }, 500);
  }
});

// Get sold serial numbers history
app.get('/api/serials/sold', async (c) => {
  try {
    const { product_id, customer_id, limit = 50 } = c.req.query();
    
    let query = `
      SELECT ss.*, p.name as product_name, c.name as customer_name, o.order_number
      FROM sold_serials ss
      LEFT JOIN products p ON ss.product_id = p.id
      LEFT JOIN customers c ON ss.customer_id = c.id
      LEFT JOIN orders o ON ss.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    
    if (product_id) {
      query += ' AND ss.product_id = ?';
      params.push(product_id);
    }
    
    if (customer_id) {
      query += ' AND ss.customer_id = ?';
      params.push(customer_id);
    }
    
    query += ' ORDER BY ss.sold_date DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy lịch sử bán serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy lịch sử bán serial',
      error: error.message
    }, 500);
  }
});

// Search serial numbers across all products
app.get('/api/serials/search', async (c) => {
  try {
    const { q, status = 'all' } = c.req.query();
    
    if (!q) {
      return c.json({
        success: false,
        message: 'Từ khóa tìm kiếm là bắt buộc'
      }, 400);
    }

    let query = `
      SELECT ps.*, p.name as product_name, s.name as supplier_name
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      WHERE ps.serial_number LIKE ?
    `;
    const params = [`%${q}%`];
    
    if (status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ps.created_at DESC LIMIT 50';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Tìm kiếm serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tìm kiếm serial',
      error: error.message
    }, 500);
  }
});

export default app; 