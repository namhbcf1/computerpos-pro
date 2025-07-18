const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Mock data for when database is not available
const mockProducts = [
  { id: 1, name: 'Intel Core i5-13400F', name_vi: 'Intel Core i5-13400F', price: 4690000, quantity: 25, sku: 'CPU-INTEL-i5-13400F', warranty_months: 36, description_vi: 'Bộ vi xử lý Intel Core i5 thế hệ 13, 10 nhân 16 luồng', category_name: 'Bộ vi xử lý', brand_name: 'Intel' },
  { id: 2, name: 'Intel Core i7-13700K', name_vi: 'Intel Core i7-13700K', price: 9990000, quantity: 20, sku: 'CPU-INTEL-i7-13700K', warranty_months: 36, description_vi: 'Bộ vi xử lý Intel Core i7 thế hệ 13, 16 nhân 24 luồng', category_name: 'Bộ vi xử lý', brand_name: 'Intel' },
  { id: 3, name: 'AMD Ryzen 5 7600X', name_vi: 'AMD Ryzen 5 7600X', price: 5990000, quantity: 15, sku: 'CPU-AMD-R5-7600X', warranty_months: 36, description_vi: 'Bộ vi xử lý AMD Ryzen 5 thế hệ 7000, 6 nhân 12 luồng', category_name: 'Bộ vi xử lý', brand_name: 'AMD' },
  { id: 5, name: 'ASUS PRIME B760M-A WIFI', name_vi: 'ASUS PRIME B760M-A WIFI', price: 3290000, quantity: 20, sku: 'MB-ASUS-B760M-A-WIFI', warranty_months: 36, description_vi: 'Bo mạch chủ Intel B760, socket LGA1700, Micro ATX', category_name: 'Bo mạch chủ', brand_name: 'ASUS' },
  { id: 9, name: 'Corsair Vengeance LPX 16GB DDR4-3200', name_vi: 'Corsair Vengeance LPX 16GB DDR4-3200', price: 1890000, quantity: 35, sku: 'RAM-CORSAIR-16GB-DDR4-3200', warranty_months: 36, description_vi: 'Bộ nhớ DDR4 16GB (2x8GB) 3200MHz', category_name: 'Bộ nhớ', brand_name: 'Corsair' },
  { id: 13, name: 'ASUS GeForce RTX 4060 DUAL OC', name_vi: 'ASUS GeForce RTX 4060 DUAL OC', price: 9490000, quantity: 15, sku: 'VGA-NVIDIA-RTX4060-ASUS', warranty_months: 36, description_vi: 'Card đồ họa NVIDIA RTX 4060, 8GB GDDR6', category_name: 'Card đồ họa', brand_name: 'ASUS' },
  { id: 17, name: 'Samsung 980 NVMe SSD 1TB', name_vi: 'Samsung 980 NVMe SSD 1TB', price: 2290000, quantity: 40, sku: 'SSD-SAMSUNG-980-1TB', warranty_months: 60, description_vi: 'Ổ cứng SSD NVMe M.2 1TB', category_name: 'Ổ cứng SSD', brand_name: 'Samsung' },
  { id: 25, name: 'Corsair CV550 550W 80+ Bronze', name_vi: 'Corsair CV550 550W 80+ Bronze', price: 1590000, quantity: 25, sku: 'PSU-CORSAIR-CV550-550W', warranty_months: 36, description_vi: 'Nguồn máy tính 550W 80+ Bronze', category_name: 'Nguồn máy tính', brand_name: 'Corsair' },
];

const mockCustomers = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0123456789', email: 'nguyenvana@gmail.com', address: '123 Nguyễn Huệ, Quận 1', city: 'Hồ Chí Minh', customer_type: 'individual' },
  { id: 2, name: 'Trần Thị B', phone: '0987654321', email: 'tranthib@gmail.com', address: '456 Lê Lợi, Quận 3', city: 'Hồ Chí Minh', customer_type: 'individual' },
  { id: 3, name: 'Lê Văn C', phone: '0912345678', email: 'levanc@gmail.com', address: '789 Hai Bà Trưng, Quận 1', city: 'Hồ Chí Minh', customer_type: 'individual' },
];

const mockOrders = [
  { id: 1, order_number: 'DH001', total: 5159000, status: 'completed', created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString(), customer_name: 'Nguyễn Văn A' },
  { id: 2, order_number: 'DH002', total: 17578000, status: 'completed', created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString(), customer_name: 'Trần Thị B' },
  { id: 3, order_number: 'DH003', total: 2519000, status: 'completed', created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString(), customer_name: 'Lê Văn C' },
];

// Database helper functions
async function executeQuery(env, query, params = []) {
  try {
    if (!env.DB) {
      console.warn('Database not available, using mock data');
      return { results: [] };
    }
    
    const stmt = env.DB.prepare(query);
    if (params.length > 0) {
      return await stmt.bind(...params).all();
    }
    return await stmt.all();
  } catch (error) {
    console.error('Database query error:', error);
    return { results: [] };
  }
}

async function executeSingle(env, query, params = []) {
  try {
    if (!env.DB) {
      console.warn('Database not available, using mock data');
      return null;
    }
    
    const stmt = env.DB.prepare(query);
    if (params.length > 0) {
      return await stmt.bind(...params).first();
    }
    return await stmt.first();
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    try {
      // Health check
      if (path === '/api/health') {
        return jsonResponse({
          success: true,
          message: 'POS Backend API is working!',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });
      }
      
      // Products endpoints
      if (path === '/api/products') {
        if (method === 'GET') {
          try {
            const searchParams = url.searchParams;
            const search = searchParams.get('search');
            const lowStock = searchParams.get('low_stock');
            
            let query = `
              SELECT p.id, p.sku, p.barcode, p.name, p.name_vi, p.selling_price as price, 
                     i.quantity, p.warranty_months, p.description_vi,
                     c.name_vi as category_name, b.name as brand_name
              FROM products p
              LEFT JOIN inventory i ON p.id = i.product_id 
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN brands b ON p.brand_id = b.id
              WHERE p.is_active = 1
            `;
            
            const params = [];
            
            if (search) {
              query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`;
              const searchTerm = `%${search}%`;
              params.push(searchTerm, searchTerm, searchTerm);
            }
            
            if (lowStock === 'true') {
              query += ` AND i.quantity <= 10`;
            }
            
            query += ` ORDER BY p.name LIMIT 50`;
            
            const result = await executeQuery(env, query, params);
            let products = result.results || [];
            
            // Fallback to mock data if database is empty or unavailable
            if (products.length === 0 && !env.DB) {
              products = mockProducts;
              
              if (search) {
                products = products.filter(p => 
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  p.sku.toLowerCase().includes(search.toLowerCase())
                );
              }
              
              if (lowStock === 'true') {
                products = products.filter(p => p.quantity <= 10);
              }
            }
            
            return jsonResponse({
              success: true,
              data: products,
              total: products.length,
              message: 'Products loaded successfully'
            });
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error loading products: ' + error.message
            }, 500);
          }
        }
        
        if (method === 'POST') {
          try {
            const body = await request.json();
            const insertQuery = `
              INSERT INTO products (sku, name, name_vi, description_vi, category_id, brand_id, cost_price, selling_price, warranty_months)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await env.DB.prepare(insertQuery)
              .bind(body.sku, body.name, body.name_vi, body.description_vi, body.category_id, body.brand_id, body.cost_price, body.selling_price, body.warranty_months)
              .run();
            
            if (result.success) {
              // Also insert into inventory
              await env.DB.prepare('INSERT INTO inventory (product_id, quantity) VALUES (?, ?)')
                .bind(result.meta.last_row_id, body.quantity || 0)
                .run();
              
              return jsonResponse({
                success: true,
                data: { id: result.meta.last_row_id, ...body },
                message: 'Product created successfully'
              }, 201);
            } else {
              throw new Error('Failed to create product');
            }
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error creating product: ' + error.message
            }, 500);
          }
        }
      }
      
      // Individual product
      if (path.match(/^\/api\/products\/\d+$/)) {
        const id = parseInt(path.split('/').pop());
        
        if (method === 'GET') {
          try {
            const query = `
              SELECT p.*, i.quantity, c.name_vi as category_name, b.name as brand_name
              FROM products p
              LEFT JOIN inventory i ON p.id = i.product_id 
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN brands b ON p.brand_id = b.id
              WHERE p.id = ? AND p.is_active = 1
            `;
            
            const product = await executeSingle(env, query, [id]);
            
            if (!product) {
              return jsonResponse({
                success: false,
                message: 'Product not found'
              }, 404);
            }
            
            return jsonResponse({
              success: true,
              data: product,
              message: 'Product loaded successfully'
            });
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error loading product: ' + error.message
            }, 500);
          }
        }
      }
      
      // Customers endpoints
      if (path === '/api/customers') {
        if (method === 'GET') {
          try {
            const searchParams = url.searchParams;
            const phone = searchParams.get('phone');
            const name = searchParams.get('name');
            
            let query = `
              SELECT id, customer_code, full_name as name, phone, email, address, city, customer_type
              FROM customers 
              WHERE is_active = 1
            `;
            
            const params = [];
            
            if (phone) {
              query += ` AND phone LIKE ?`;
              params.push(`%${phone}%`);
            }
            
            if (name) {
              query += ` AND full_name LIKE ?`;
              params.push(`%${name}%`);
            }
            
            query += ` ORDER BY full_name LIMIT 50`;
            
            const result = await executeQuery(env, query, params);
            let customers = result.results || [];
            
            // Fallback to mock data if database is empty or unavailable
            if (customers.length === 0 && !env.DB) {
              customers = mockCustomers;
              
              if (phone) {
                customers = customers.filter(c => c.phone.includes(phone));
              }
              
              if (name) {
                customers = customers.filter(c => 
                  c.name.toLowerCase().includes(name.toLowerCase())
                );
              }
            }
            
            return jsonResponse({
              success: true,
              data: customers,
              total: customers.length,
              message: 'Customers loaded successfully'
            });
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error loading customers: ' + error.message
            }, 500);
          }
        }
        
        if (method === 'POST') {
          try {
            const body = await request.json();
            const customerCode = `KH${String(Date.now()).slice(-6)}`;
            
            const insertQuery = `
              INSERT INTO customers (customer_code, full_name, phone, email, address, customer_type)
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const result = await env.DB.prepare(insertQuery)
              .bind(customerCode, body.name, body.phone, body.email, body.address, body.customer_type || 'individual')
              .run();
            
            if (result.success) {
              return jsonResponse({
                success: true,
                data: { id: result.meta.last_row_id, customer_code: customerCode, ...body },
                message: 'Customer created successfully'
              }, 201);
            } else {
              throw new Error('Failed to create customer');
            }
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error creating customer: ' + error.message
            }, 500);
          }
        }
      }
      
      // Orders endpoints
      if (path === '/api/orders') {
        if (method === 'GET') {
          try {
            const query = `
              SELECT o.id, o.order_number, o.total_amount as total, o.status, o.created_at,
                     c.full_name as customer_name
              FROM orders o
              LEFT JOIN customers c ON o.customer_id = c.id
              ORDER BY o.created_at DESC
              LIMIT 50
            `;
            
            const result = await executeQuery(env, query);
            let orders = (result.results || []).map(order => ({
              ...order,
              customer: { name: order.customer_name || 'Khách lẻ' }
            }));
            
            // Fallback to mock data if database is empty or unavailable
            if (orders.length === 0 && !env.DB) {
              orders = mockOrders.map(order => ({
                ...order,
                customer: { name: order.customer_name || 'Khách lẻ' }
              }));
            }
            
            return jsonResponse({
              success: true,
              data: orders,
              total: orders.length,
              message: 'Orders loaded successfully'
            });
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error loading orders: ' + error.message
            }, 500);
          }
        }
        
        if (method === 'POST') {
          try {
            const body = await request.json();
            const orderNumber = `DH${String(Date.now()).slice(-8)}`;
            
            // Start transaction
            const insertOrderQuery = `
              INSERT INTO orders (order_number, customer_id, user_id, subtotal, total_amount, status, payment_status)
              VALUES (?, ?, ?, ?, ?, 'pending', 'pending')
            `;
            
            const orderResult = await env.DB.prepare(insertOrderQuery)
              .bind(orderNumber, body.customer_id, 1, body.total, body.total)
              .run();
            
            if (orderResult.success) {
              const orderId = orderResult.meta.last_row_id;
              
              // Insert order items
              for (const item of body.items) {
                await env.DB.prepare(`
                  INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                  VALUES (?, ?, ?, ?, ?)
                `).bind(orderId, item.product_id, item.quantity, item.price || 0, (item.price || 0) * item.quantity).run();
              }
              
              return jsonResponse({
                success: true,
                data: { id: orderId, order_number: orderNumber, ...body },
                message: 'Order created successfully'
              }, 201);
            } else {
              throw new Error('Failed to create order');
            }
          } catch (error) {
            return jsonResponse({
              success: false,
              message: 'Error creating order: ' + error.message
            }, 500);
          }
        }
      }
      
      // Order stats
      if (path === '/api/orders/stats/summary') {
        try {
          const statsQueries = await Promise.all([
            executeSingle(env, 'SELECT COUNT(*) as totalSales FROM orders WHERE status = "completed"'),
            executeSingle(env, 'SELECT COUNT(*) as customers FROM customers WHERE is_active = 1'),
            executeSingle(env, 'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status = "completed"'),
            executeSingle(env, 'SELECT COUNT(*) as products FROM products WHERE is_active = 1')
          ]);
          
          let stats = {
            totalSales: statsQueries[0]?.totalSales || 0,
            customers: statsQueries[1]?.customers || 0,
            revenue: statsQueries[2]?.revenue || 0,
            products: statsQueries[3]?.products || 0
          };
          
          // Fallback to mock stats if database is unavailable
          if (!env.DB || stats.totalSales === 0) {
            stats = {
              totalSales: 3,
              customers: 3,
              revenue: 25256000,
              products: 8
            };
          }
          
          return jsonResponse({
            success: true,
            data: stats,
            message: 'Stats loaded successfully'
          });
        } catch (error) {
          return jsonResponse({
            success: false,
            message: 'Error loading stats: ' + error.message
          }, 500);
        }
      }
      
      // Default 404 response
      return jsonResponse({
        success: false,
        message: 'Endpoint not found',
        path: path,
        method: method
      }, 404);
      
    } catch (error) {
      console.error('API Error:', error);
      return jsonResponse({
        success: false,
        message: 'Internal server error',
        error: error.message
      }, 500);
    }
  }
}; 