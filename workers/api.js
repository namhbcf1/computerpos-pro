// Cloudflare Workers API for ComputerPOS Pro
// Complete backend API with D1 database integration

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      const response = await handleRoute(path, method, request, env);
      
      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

async function handleRoute(path, method, request, env) {
  // Products API
  if (path.startsWith('/api/products')) {
    return handleProductsAPI(path, method, request, env);
  }
  
  // Inventory API
  if (path.startsWith('/api/inventory')) {
    return handleInventoryAPI(path, method, request, env);
  }
  
  // Orders API
  if (path.startsWith('/api/orders')) {
    return handleOrdersAPI(path, method, request, env);
  }
  
  // Customers API
  if (path.startsWith('/api/customers')) {
    return handleCustomersAPI(path, method, request, env);
  }
  
  // Build Configuration API
  if (path.startsWith('/api/builds')) {
    return handleBuildsAPI(path, method, request, env);
  }
  
  // Analytics API
  if (path.startsWith('/api/analytics')) {
    return handleAnalyticsAPI(path, method, request, env);
  }

  // POS API
  if (path.startsWith('/api/pos')) {
    return handlePOSAPI(path, method, request, env);
  }

  // Reports API
  if (path.startsWith('/api/reports')) {
    return handleReportsAPI(path, method, request, env);
  }

  // Default 404
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// PRODUCTS API
// ============================================================================
async function handleProductsAPI(path, method, request, env) {
  const segments = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (segments.length === 2) {
        // GET /api/products - List all products with filters
        return await getProducts(request, env);
      } else if (segments.length === 3) {
        // GET /api/products/:id - Get single product
        const productId = segments[2];
        return await getProduct(productId, env);
      }
      break;
      
    case 'POST':
      if (segments.length === 2) {
        // POST /api/products - Create new product
        return await createProduct(request, env);
      }
      break;
      
    case 'PUT':
      if (segments.length === 3) {
        // PUT /api/products/:id - Update product
        const productId = segments[2];
        return await updateProduct(productId, request, env);
      }
      break;
      
    case 'DELETE':
      if (segments.length === 3) {
        // DELETE /api/products/:id - Delete product
        const productId = segments[2];
        return await deleteProduct(productId, env);
      }
      break;
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getProducts(request, env) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Extract query parameters
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const inStock = searchParams.get('inStock');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  const sort = searchParams.get('sort') || 'name';
  const order = searchParams.get('order') || 'ASC';
  
  // Build SQL query
  let whereClause = 'WHERE p.status = ?';
  let params = ['active'];
  
  if (category) {
    whereClause += ' AND p.category = ?';
    params.push(category);
  }
  
  if (search) {
    whereClause += ' AND (p.name_vi LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (brand) {
    whereClause += ' AND p.brand = ?';
    params.push(brand);
  }
  
  if (minPrice) {
    whereClause += ' AND p.selling_price >= ?';
    params.push(parseFloat(minPrice));
  }
  
  if (maxPrice) {
    whereClause += ' AND p.selling_price <= ?';
    params.push(parseFloat(maxPrice));
  }
  
  if (inStock === 'true') {
    whereClause += ' AND i.quantity > 0';
  }
  
  // Count total records
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    ${whereClause}
  `;
  
  const countResult = await env.DB.prepare(countQuery).bind(...params).first();
  const total = countResult.total;
  
  // Main query with pagination
  const offset = (page - 1) * limit;
  const query = `
    SELECT 
      p.*,
      i.quantity,
      i.reserved_quantity,
      i.min_stock_level,
      i.location,
      c.name_vi as category_name,
      s.name_vi as supplier_name,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    LEFT JOIN categories c ON p.category = c.code
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    ${whereClause}
    ORDER BY p.${sort} ${order}
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  const result = await env.DB.prepare(query).bind(...params).all();
  
  return new Response(JSON.stringify({
    success: true,
    data: result.results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getProduct(productId, env) {
  const query = `
    SELECT 
      p.*,
      i.quantity,
      i.reserved_quantity,
      i.min_stock_level,
      i.max_stock_level,
      i.location,
      i.last_counted_at,
      c.name_vi as category_name,
      s.name_vi as supplier_name,
      s.contact_email as supplier_email,
      (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    LEFT JOIN categories c ON p.category = c.code
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.id = ?
  `;
  
  const product = await env.DB.prepare(query).bind(productId).first();
  
  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get product specifications
  const specsQuery = `
    SELECT spec_name, spec_value
    FROM product_specifications
    WHERE product_id = ?
  `;
  
  const specsResult = await env.DB.prepare(specsQuery).bind(productId).all();
  product.specifications = specsResult.results.reduce((acc, spec) => {
    acc[spec.spec_name] = spec.spec_value;
    return acc;
  }, {});
  
  // Get recent stock movements
  const movementsQuery = `
    SELECT *
    FROM inventory_movements
    WHERE product_id = ?
    ORDER BY created_at DESC
    LIMIT 10
  `;
  
  const movementsResult = await env.DB.prepare(movementsQuery).bind(productId).all();
  product.recent_movements = movementsResult.results;
  
  return new Response(JSON.stringify({
    success: true,
    data: product
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function createProduct(request, env) {
  const data = await request.json();
  
  // Validate required fields
  const required = ['name_vi', 'sku', 'category', 'cost_price', 'selling_price'];
  for (const field of required) {
    if (!data[field]) {
      return new Response(JSON.stringify({
        error: 'Validation Error',
        message: `Field ${field} is required`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Check if SKU already exists
  const existingProduct = await env.DB.prepare(
    'SELECT id FROM products WHERE sku = ?'
  ).bind(data.sku).first();
  
  if (existingProduct) {
    return new Response(JSON.stringify({
      error: 'Validation Error',
      message: 'SKU already exists'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Generate barcode if not provided
  if (!data.barcode) {
    data.barcode = generateBarcode();
  }
  
  // Insert product
  const insertQuery = `
    INSERT INTO products (
      sku, barcode, name_vi, name_en, description_vi, description_en,
      category, brand, model, cost_price, selling_price, retail_price,
      supplier_id, warranty_period, weight, dimensions, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const result = await env.DB.prepare(insertQuery).bind(
    data.sku,
    data.barcode,
    data.name_vi,
    data.name_en || data.name_vi,
    data.description_vi || '',
    data.description_en || '',
    data.category,
    data.brand || '',
    data.model || '',
    data.cost_price,
    data.selling_price,
    data.retail_price || data.selling_price,
    data.supplier_id || null,
    data.warranty_period || 12,
    data.weight || 0,
    data.dimensions || '',
    'active'
  ).run();
  
  const productId = result.meta.last_row_id;
  
  // Create inventory record
  if (data.initial_quantity > 0) {
    await env.DB.prepare(`
      INSERT INTO inventory (
        product_id, quantity, min_stock_level, max_stock_level, location
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      productId,
      data.initial_quantity || 0,
      data.min_stock_level || 5,
      data.max_stock_level || 100,
      data.location || 'MAIN'
    ).run();
    
    // Record initial stock movement
    await env.DB.prepare(`
      INSERT INTO inventory_movements (
        product_id, movement_type, quantity, reason, reference_type, reference_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      productId,
      'in',
      data.initial_quantity,
      'initial_stock',
      'manual',
      'INIT',
      'Initial inventory setup'
    ).run();
  }
  
  // Add product specifications
  if (data.specifications) {
    for (const [key, value] of Object.entries(data.specifications)) {
      await env.DB.prepare(`
        INSERT INTO product_specifications (product_id, spec_name, spec_value)
        VALUES (?, ?, ?)
      `).bind(productId, key, value).run();
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: { id: productId, message: 'Product created successfully' }
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function updateProduct(productId, request, env) {
  const data = await request.json();
  
  // Check if product exists
  const existingProduct = await env.DB.prepare(
    'SELECT id FROM products WHERE id = ?'
  ).bind(productId).first();
  
  if (!existingProduct) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Build update query dynamically
  const allowedFields = [
    'name_vi', 'name_en', 'description_vi', 'description_en',
    'category', 'brand', 'model', 'cost_price', 'selling_price',
    'retail_price', 'supplier_id', 'warranty_period', 'weight',
    'dimensions', 'status'
  ];
  
  const updates = [];
  const params = [];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }
  
  if (updates.length === 0) {
    return new Response(JSON.stringify({
      error: 'No valid fields to update'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Add updated_at and product ID
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(productId);
  
  const updateQuery = `
    UPDATE products 
    SET ${updates.join(', ')}
    WHERE id = ?
  `;
  
  await env.DB.prepare(updateQuery).bind(...params).run();
  
  // Update specifications if provided
  if (data.specifications) {
    // Delete existing specifications
    await env.DB.prepare(
      'DELETE FROM product_specifications WHERE product_id = ?'
    ).bind(productId).run();
    
    // Insert new specifications
    for (const [key, value] of Object.entries(data.specifications)) {
      await env.DB.prepare(`
        INSERT INTO product_specifications (product_id, spec_name, spec_value)
        VALUES (?, ?, ?)
      `).bind(productId, key, value).run();
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: { message: 'Product updated successfully' }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function deleteProduct(productId, env) {
  // Check if product exists
  const existingProduct = await env.DB.prepare(
    'SELECT id FROM products WHERE id = ?'
  ).bind(productId).first();
  
  if (!existingProduct) {
    return new Response(JSON.stringify({ error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Check if product has any orders
  const hasOrders = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?'
  ).bind(productId).first();
  
  if (hasOrders.count > 0) {
    // Soft delete - mark as discontinued
    await env.DB.prepare(
      'UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind('discontinued', productId).run();
    
    return new Response(JSON.stringify({
      success: true,
      data: { message: 'Product marked as discontinued' }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    // Hard delete
    await env.DB.prepare('DELETE FROM product_specifications WHERE product_id = ?').bind(productId).run();
    await env.DB.prepare('DELETE FROM inventory WHERE product_id = ?').bind(productId).run();
    await env.DB.prepare('DELETE FROM inventory_movements WHERE product_id = ?').bind(productId).run();
    await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run();
    
    return new Response(JSON.stringify({
      success: true,
      data: { message: 'Product deleted successfully' }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ============================================================================
// INVENTORY API
// ============================================================================
async function handleInventoryAPI(path, method, request, env) {
  const segments = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (segments.length === 2) {
        // GET /api/inventory - List inventory with filters
        return await getInventory(request, env);
      } else if (segments.length === 3) {
        if (segments[2] === 'movements') {
          // GET /api/inventory/movements - Get inventory movements
          return await getInventoryMovements(request, env);
        } else if (segments[2] === 'alerts') {
          // GET /api/inventory/alerts - Get low stock alerts
          return await getInventoryAlerts(env);
        } else {
          // GET /api/inventory/:id - Get single inventory item
          const productId = segments[2];
          return await getInventoryItem(productId, env);
        }
      }
      break;
      
    case 'POST':
      if (segments.length === 3) {
        if (segments[2] === 'adjust') {
          // POST /api/inventory/adjust - Adjust inventory
          return await adjustInventory(request, env);
        } else if (segments[2] === 'count') {
          // POST /api/inventory/count - Stock count
          return await stockCount(request, env);
        }
      }
      break;
      
    case 'PUT':
      if (segments.length === 3) {
        // PUT /api/inventory/:id - Update inventory settings
        const productId = segments[2];
        return await updateInventorySettings(productId, request, env);
      }
      break;
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getInventory(request, env) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const category = searchParams.get('category');
  const location = searchParams.get('location');
  const status = searchParams.get('status'); // low_stock, out_of_stock, in_stock
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 20;
  
  let whereClause = 'WHERE p.status = ?';
  let params = ['active'];
  
  if (category) {
    whereClause += ' AND p.category = ?';
    params.push(category);
  }
  
  if (location) {
    whereClause += ' AND i.location LIKE ?';
    params.push(`%${location}%`);
  }
  
  if (search) {
    whereClause += ' AND (p.name_vi LIKE ? OR p.sku LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  if (status) {
    switch (status) {
      case 'low_stock':
        whereClause += ' AND i.quantity <= i.min_stock_level AND i.quantity > 0';
        break;
      case 'out_of_stock':
        whereClause += ' AND i.quantity <= 0';
        break;
      case 'in_stock':
        whereClause += ' AND i.quantity > i.min_stock_level';
        break;
    }
  }
  
  // Count total
  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    ${whereClause}
  `;
  
  const countResult = await env.DB.prepare(countQuery).bind(...params).first();
  const total = countResult.total;
  
  // Main query
  const offset = (page - 1) * limit;
  const query = `
    SELECT 
      p.id,
      p.sku,
      p.name_vi,
      p.category,
      p.brand,
      p.cost_price,
      p.selling_price,
      i.quantity,
      i.reserved_quantity,
      i.min_stock_level,
      i.max_stock_level,
      i.location,
      i.last_counted_at,
      (i.quantity * p.cost_price) as stock_value,
      CASE 
        WHEN i.quantity <= 0 THEN 'out_of_stock'
        WHEN i.quantity <= i.min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    ${whereClause}
    ORDER BY p.name_vi ASC
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  const result = await env.DB.prepare(query).bind(...params).all();
  
  return new Response(JSON.stringify({
    success: true,
    data: result.results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function adjustInventory(request, env) {
  const data = await request.json();
  
  // Validate required fields
  if (!data.product_id || !data.adjustment_type || data.quantity === undefined) {
    return new Response(JSON.stringify({
      error: 'Missing required fields: product_id, adjustment_type, quantity'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get current inventory
  const currentInventory = await env.DB.prepare(
    'SELECT * FROM inventory WHERE product_id = ?'
  ).bind(data.product_id).first();
  
  if (!currentInventory) {
    return new Response(JSON.stringify({ error: 'Product not found in inventory' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  let newQuantity;
  let movementType;
  
  switch (data.adjustment_type) {
    case 'add':
      newQuantity = currentInventory.quantity + data.quantity;
      movementType = 'in';
      break;
    case 'subtract':
      newQuantity = Math.max(0, currentInventory.quantity - data.quantity);
      movementType = 'out';
      break;
    case 'set':
      newQuantity = data.quantity;
      movementType = data.quantity > currentInventory.quantity ? 'in' : 'out';
      break;
    default:
      return new Response(JSON.stringify({
        error: 'Invalid adjustment_type. Must be: add, subtract, or set'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
  }
  
  // Update inventory
  await env.DB.prepare(`
    UPDATE inventory 
    SET quantity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
  `).bind(newQuantity, data.product_id).run();
  
  // Record movement
  const actualMovementQty = Math.abs(newQuantity - currentInventory.quantity);
  await env.DB.prepare(`
    INSERT INTO inventory_movements (
      product_id, movement_type, quantity, reason, reference_type, 
      reference_id, notes, unit_cost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.product_id,
    movementType,
    actualMovementQty,
    data.reason || 'manual_adjustment',
    data.reference_type || 'manual',
    data.reference_id || 'ADJ',
    data.notes || '',
    data.unit_cost || 0
  ).run();
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      previous_quantity: currentInventory.quantity,
      new_quantity: newQuantity,
      adjustment: newQuantity - currentInventory.quantity
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getInventoryAlerts(env) {
  const query = `
    SELECT 
      p.id,
      p.sku,
      p.name_vi,
      p.category,
      i.quantity,
      i.min_stock_level,
      i.location,
      (i.min_stock_level - i.quantity) as shortage,
      p.selling_price
    FROM products p
    JOIN inventory i ON p.id = i.product_id
    WHERE p.status = 'active' 
      AND i.quantity <= i.min_stock_level
    ORDER BY (i.min_stock_level - i.quantity) DESC
    LIMIT 50
  `;
  
  const result = await env.DB.prepare(query).all();
  
  return new Response(JSON.stringify({
    success: true,
    data: result.results
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// ORDERS API
// ============================================================================
async function handleOrdersAPI(path, method, request, env) {
  const segments = path.split('/').filter(Boolean);
  
  switch (method) {
    case 'GET':
      if (segments.length === 2) {
        // GET /api/orders - List orders
        return await getOrders(request, env);
      } else if (segments.length === 3) {
        // GET /api/orders/:id - Get single order
        const orderId = segments[2];
        return await getOrder(orderId, env);
      }
      break;
      
    case 'POST':
      if (segments.length === 2) {
        // POST /api/orders - Create new order
        return await createOrder(request, env);
      }
      break;
      
    case 'PUT':
      if (segments.length === 3) {
        // PUT /api/orders/:id - Update order
        const orderId = segments[2];
        return await updateOrder(orderId, request, env);
      }
      break;
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function createOrder(request, env) {
  const data = await request.json();
  
  // Validate required fields
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return new Response(JSON.stringify({
      error: 'Order must contain at least one item'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Generate order number
  const orderNumber = generateOrderNumber();
  
  // Calculate totals
  let subtotal = 0;
  for (const item of data.items) {
    const product = await env.DB.prepare(
      'SELECT selling_price FROM products WHERE id = ?'
    ).bind(item.product_id).first();
    
    if (!product) {
      return new Response(JSON.stringify({
        error: `Product not found: ${item.product_id}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    subtotal += product.selling_price * item.quantity;
  }
  
  const vatRate = 0.1; // 10% VAT
  const vatAmount = Math.round(subtotal * vatRate);
  const totalAmount = subtotal + vatAmount;
  const discountAmount = data.discount_amount || 0;
  const finalAmount = totalAmount - discountAmount;
  
  // Create order
  const orderResult = await env.DB.prepare(`
    INSERT INTO orders (
      order_number, customer_id, order_type, status, payment_status,
      subtotal, vat_amount, discount_amount, total_amount,
      payment_method, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    orderNumber,
    data.customer_id || null,
    data.order_type || 'pos',
    'pending',
    'pending',
    subtotal,
    vatAmount,
    discountAmount,
    finalAmount,
    data.payment_method || 'cash',
    data.notes || '',
    data.created_by || 'system'
  ).run();
  
  const orderId = orderResult.meta.last_row_id;
  
  // Add order items
  for (const item of data.items) {
    const product = await env.DB.prepare(
      'SELECT selling_price, cost_price FROM products WHERE id = ?'
    ).bind(item.product_id).first();
    
    await env.DB.prepare(`
      INSERT INTO order_items (
        order_id, product_id, quantity, unit_price, unit_cost, total_price
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      item.product_id,
      item.quantity,
      product.selling_price,
      product.cost_price,
      product.selling_price * item.quantity
    ).run();
    
    // Reserve inventory
    await env.DB.prepare(`
      UPDATE inventory 
      SET reserved_quantity = reserved_quantity + ?
      WHERE product_id = ?
    `).bind(item.quantity, item.product_id).run();
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      order_id: orderId,
      order_number: orderNumber,
      total_amount: finalAmount
    }
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// POS API
// ============================================================================
async function handlePOSAPI(path, method, request, env) {
  const segments = path.split('/').filter(Boolean);
  
  if (segments[2] === 'search' && method === 'GET') {
    // GET /api/pos/search - Search products for POS
    return await searchProductsForPOS(request, env);
  }
  
  if (segments[2] === 'sale' && method === 'POST') {
    // POST /api/pos/sale - Process POS sale
    return await processPOSSale(request, env);
  }
  
  if (segments[2] === 'barcode' && method === 'GET') {
    // GET /api/pos/barcode/:code - Find product by barcode
    const barcode = segments[3];
    return await findProductByBarcode(barcode, env);
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function searchProductsForPOS(request, env) {
  const url = new URL(request.url);
  const search = url.searchParams.get('q');
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit')) || 20;
  
  if (!search && !category) {
    return new Response(JSON.stringify({
      error: 'Search query or category is required'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  let whereClause = 'WHERE p.status = ? AND i.quantity > 0';
  let params = ['active'];
  
  if (search) {
    whereClause += ' AND (p.name_vi LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (category) {
    whereClause += ' AND p.category = ?';
    params.push(category);
  }
  
  const query = `
    SELECT 
      p.id,
      p.sku,
      p.barcode,
      p.name_vi,
      p.category,
      p.brand,
      p.selling_price,
      i.quantity,
      i.reserved_quantity,
      (i.quantity - i.reserved_quantity) as available_quantity
    FROM products p
    JOIN inventory i ON p.id = i.product_id
    ${whereClause}
    ORDER BY p.name_vi ASC
    LIMIT ?
  `;
  
  params.push(limit);
  const result = await env.DB.prepare(query).bind(...params).all();
  
  return new Response(JSON.stringify({
    success: true,
    data: result.results
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function processPOSSale(request, env) {
  const data = await request.json();
  
  // This reuses the createOrder function but with POS-specific logic
  data.order_type = 'pos';
  
  // For POS sales, immediately process payment and fulfill
  const orderResponse = await createOrder(request, env);
  const orderData = await orderResponse.json();
  
  if (!orderData.success) {
    return orderResponse;
  }
  
  const orderId = orderData.data.order_id;
  
  // Mark order as completed and paid
  await env.DB.prepare(`
    UPDATE orders 
    SET status = 'completed', payment_status = 'paid', completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(orderId).run();
  
  // Fulfill inventory (move from reserved to sold)
  for (const item of data.items) {
    // Reduce actual inventory
    await env.DB.prepare(`
      UPDATE inventory 
      SET quantity = quantity - ?, reserved_quantity = reserved_quantity - ?
      WHERE product_id = ?
    `).bind(item.quantity, item.quantity, item.product_id).run();
    
    // Record inventory movement
    await env.DB.prepare(`
      INSERT INTO inventory_movements (
        product_id, movement_type, quantity, reason, reference_type, 
        reference_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      item.product_id,
      'out',
      item.quantity,
      'sale',
      'order',
      orderId,
      `POS Sale - Order ${orderData.data.order_number}`
    ).run();
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      order_id: orderId,
      order_number: orderData.data.order_number,
      total_amount: orderData.data.total_amount,
      status: 'completed'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// ANALYTICS API
// ============================================================================
async function handleAnalyticsAPI(path, method, request, env) {
  const segments = path.split('/').filter(Boolean);
  
  if (method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  switch (segments[2]) {
    case 'dashboard':
      return await getDashboardAnalytics(request, env);
    case 'sales':
      return await getSalesAnalytics(request, env);
    case 'inventory':
      return await getInventoryAnalytics(request, env);
    case 'products':
      return await getProductAnalytics(request, env);
  }
  
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getDashboardAnalytics(request, env) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '7d';
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    default:
      startDate.setDate(endDate.getDate() - 7);
  }
  
  // Get sales stats
  const salesQuery = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      AVG(total_amount) as avg_order_value
    FROM orders 
    WHERE created_at >= ? AND created_at <= ? AND status = 'completed'
  `;
  
  const salesStats = await env.DB.prepare(salesQuery)
    .bind(startDate.toISOString(), endDate.toISOString())
    .first();
  
  // Get inventory stats
  const inventoryQuery = `
    SELECT 
      COUNT(*) as total_products,
      SUM(quantity) as total_stock,
      SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END) as low_stock_count,
      SUM(quantity * (SELECT cost_price FROM products WHERE id = inventory.product_id)) as total_stock_value
    FROM inventory 
    JOIN products ON inventory.product_id = products.id 
    WHERE products.status = 'active'
  `;
  
  const inventoryStats = await env.DB.prepare(inventoryQuery).first();
  
  // Get daily sales for chart
  const dailySalesQuery = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      SUM(total_amount) as revenue
    FROM orders 
    WHERE created_at >= ? AND created_at <= ? AND status = 'completed'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  
  const dailySales = await env.DB.prepare(dailySalesQuery)
    .bind(startDate.toISOString(), endDate.toISOString())
    .all();
  
  // Get top products
  const topProductsQuery = `
    SELECT 
      p.name_vi,
      SUM(oi.quantity) as total_sold,
      SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.created_at >= ? AND o.created_at <= ? AND o.status = 'completed'
    GROUP BY p.id, p.name_vi
    ORDER BY total_sold DESC
    LIMIT 10
  `;
  
  const topProducts = await env.DB.prepare(topProductsQuery)
    .bind(startDate.toISOString(), endDate.toISOString())
    .all();
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      period,
      sales: salesStats,
      inventory: inventoryStats,
      daily_sales: dailySales.results,
      top_products: topProducts.results
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `ORD${year}${month}${day}${timestamp}`;
}

function generateBarcode() {
  // Generate EAN-13 barcode
  const prefix = '299'; // Internal use prefix
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  
  // Calculate check digit
  let sum = 0;
  const code = prefix + random;
  
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return code + checkDigit;
}