export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // Handle CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    try {
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Complete API is working!',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Products endpoints
      if (path === '/api/products' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT * FROM products 
          ORDER BY created_at DESC
        `).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: 'Products loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      if (path === '/api/products' && method === 'POST') {
        const body = await request.json();
        const { name, description, price, cost_price, category, supplier_id, min_quantity } = body;
        
        const { results } = await env.DB.prepare(`
          INSERT INTO products (name, description, price, cost_price, category, supplier_id, min_quantity, quantity)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
          RETURNING *
        `).bind(name, description, price, cost_price, category, supplier_id, min_quantity).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: 'Product created successfully'
        }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Product by ID
      if (path.startsWith('/api/products/') && method === 'GET') {
        const id = path.split('/')[3];
        const { results } = await env.DB.prepare(`
          SELECT * FROM products WHERE id = ?
        `).bind(id).all();
        
        if (results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Product not found'
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: 'Product loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Customers endpoints
      if (path === '/api/customers' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT * FROM customers 
          ORDER BY created_at DESC
        `).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: 'Customers loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      if (path === '/api/customers' && method === 'POST') {
        const body = await request.json();
        const { name, phone, email, address } = body;
        
        const { results } = await env.DB.prepare(`
          INSERT INTO customers (name, phone, email, address)
          VALUES (?, ?, ?, ?)
          RETURNING *
        `).bind(name, phone, email, address).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: 'Customer created successfully'
        }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Orders endpoints
      if (path === '/api/orders' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT o.*, c.name as customer_name 
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          ORDER BY o.created_at DESC
        `).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: 'Orders loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      if (path === '/api/orders' && method === 'POST') {
        const body = await request.json();
        const { customer_id, items, total_amount, payment_method, notes } = body;
        
        // Start transaction
        const orderNumber = 'ORD-' + Date.now();
        
        const { results: orderResult } = await env.DB.prepare(`
          INSERT INTO orders (order_number, customer_id, total_amount, payment_method, notes, status)
          VALUES (?, ?, ?, ?, ?, 'completed')
          RETURNING *
        `).bind(orderNumber, customer_id, total_amount, payment_method, notes).all();
        
        const order = orderResult[0];
        
        // Insert order items
        for (const item of items) {
          await env.DB.prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `).bind(order.id, item.product_id, item.quantity, item.unit_price, item.total_price).run();
          
          // Update product quantity
          await env.DB.prepare(`
            UPDATE products 
            SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(item.quantity, item.product_id).run();
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: order,
          message: 'Order created successfully'
        }), {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Dashboard stats
      if (path === '/api/orders/stats/summary' && method === 'GET') {
        const { results: stats } = await env.DB.prepare(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value
          FROM orders 
          WHERE DATE(created_at) = DATE('now')
        `).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: stats[0] || { total_orders: 0, total_revenue: 0, avg_order_value: 0 },
          message: 'Dashboard stats loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Reports endpoints
      if (path === '/api/reports/sales' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            SUM(total_amount) as revenue
          FROM orders 
          WHERE created_at >= DATE('now', '-30 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: 'Sales report loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      if (path === '/api/reports/best-selling' && method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT 
            p.name,
            p.id,
            SUM(oi.quantity) as total_sold,
            SUM(oi.total_price) as total_revenue
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.created_at >= DATE('now', '-30 days')
          GROUP BY p.id, p.name
          ORDER BY total_sold DESC
          LIMIT 10
        `).all();
        
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: 'Best selling products loaded successfully'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Default response
      return new Response(JSON.stringify({
        success: false,
        message: 'Endpoint not found',
        path: path,
        method: method
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
      
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
}; 