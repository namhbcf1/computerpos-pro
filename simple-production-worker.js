// ComputerPOS Pro - Simple Production API Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers for production
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
      message: 'ComputerPOS Pro API - Production Ready',
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

async function handleApiRequest(request, url, env) {
  const method = request.method;
  const path = url.pathname;

  // Production sample data (will be replaced with real database later)
  const mockProducts = [
    { id: 1, name: 'CPU Intel Core i7-13700K', sku: 'CPU-I7-13700K', price: 8500000, category: 'CPU', stock: 15, description: 'Bộ vi xử lý Intel thế hệ 13' },
    { id: 2, name: 'GPU NVIDIA RTX 4080', sku: 'GPU-RTX-4080', price: 25000000, category: 'GPU', stock: 8, description: 'Card đồ họa RTX 4080 16GB' },
    { id: 3, name: 'RAM Corsair 32GB DDR5-5600', sku: 'RAM-32GB-DDR5', price: 4500000, category: 'RAM', stock: 20, description: 'Bộ nhớ DDR5 32GB' },
    { id: 4, name: 'SSD Samsung 980 PRO 1TB', sku: 'SSD-980PRO-1TB', price: 3200000, category: 'Storage', stock: 25, description: 'Ổ cứng SSD NVMe 1TB' },
    { id: 5, name: 'Motherboard ASUS Z790', sku: 'MB-ASUS-Z790', price: 6800000, category: 'Motherboard', stock: 12, description: 'Bo mạch chủ Z790 chipset' },
  ];

  const mockCustomers = [
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@email.com', address: 'TP.HCM' },
    { id: 2, name: 'Trần Thị B', phone: '0907654321', email: 'tranthib@email.com', address: 'Hà Nội' },
    { id: 3, name: 'Lê Văn C', phone: '0912345678', email: 'levanc@email.com', address: 'Đà Nẵng' },
    { id: 4, name: 'Phạm Thị D', phone: '0923456789', email: 'phamthid@email.com', address: 'Cần Thơ' },
  ];

  const mockOrders = [
    { id: 'DH001', customer_id: 1, customerName: 'Nguyễn Văn A', total: 15000000, status: 'completed', created_at: '2024-01-15T10:30:00Z' },
    { id: 'DH002', customer_id: 2, customerName: 'Trần Thị B', total: 25000000, status: 'pending', created_at: '2024-01-16T14:20:00Z' },
    { id: 'DH003', customer_id: 3, customerName: 'Lê Văn C', total: 35000000, status: 'processing', created_at: '2024-01-17T09:15:00Z' },
    { id: 'DH004', customer_id: 4, customerName: 'Phạm Thị D', total: 12000000, status: 'completed', created_at: '2024-01-18T16:45:00Z' },
  ];

  const mockSerials = [
    { id: 1, serialNumber: 'SN001-CPU-I7', product_id: 1, productName: 'CPU Intel Core i7-13700K', status: 'available' },
    { id: 2, serialNumber: 'SN002-GPU-RTX', product_id: 2, productName: 'GPU NVIDIA RTX 4080', status: 'sold' },
    { id: 3, serialNumber: 'SN003-RAM-32GB', product_id: 3, productName: 'RAM Corsair 32GB DDR5', status: 'warranty' },
    { id: 4, serialNumber: 'SN004-SSD-1TB', product_id: 4, productName: 'SSD Samsung 980 PRO 1TB', status: 'available' },
  ];

  const mockWarranties = [
    { id: 1, serialNumber: 'SN001-CPU-I7', status: 'active', expiry_date: '2025-12-31' },
    { id: 2, serialNumber: 'SN002-GPU-RTX', status: 'active', expiry_date: '2026-06-30' },
    { id: 3, serialNumber: 'SN003-RAM-32GB', status: 'active', expiry_date: '2025-09-15' },
    { id: 4, serialNumber: 'SN004-SSD-1TB', status: 'active', expiry_date: '2025-11-20' },
  ];

  // Route handling
  switch (true) {
    case path === '/api/products' && method === 'GET':
      return { success: true, data: mockProducts };
      
    case path === '/api/customers' && method === 'GET':
      return { success: true, data: mockCustomers };
      
    case path === '/api/orders' && method === 'GET':
      return { success: true, data: { orders: mockOrders } };
      
    case path === '/api/serials' && method === 'GET':
      return { success: true, data: mockSerials };
      
    case path === '/api/warranty' && method === 'GET':
      return { success: true, data: mockWarranties };

    case path === '/api/financial/stats' && method === 'GET':
      const totalRevenue = 87000000; // Sum of completed orders
      const totalExpenses = 60000000; // Estimated expenses
      const netProfit = totalRevenue - totalExpenses;
      
      return {
        success: true,
        data: {
          total_revenue: totalRevenue,
          total_expenses: totalExpenses,
          net_profit: netProfit,
          profit_margin: ((netProfit / totalRevenue) * 100).toFixed(2)
        }
      };

    // Additional endpoints for comprehensive API
    case path === '/api/dashboard/stats' && method === 'GET':
      return {
        success: true,
        data: {
          totalProducts: mockProducts.length,
          totalCustomers: mockCustomers.length,
          totalOrders: mockOrders.length,
          totalRevenue: 87000000,
          lowStockProducts: mockProducts.filter(p => p.stock < 10).length,
          pendingOrders: mockOrders.filter(o => o.status === 'pending').length
        }
      };

    case path === '/api/suppliers' && method === 'GET':
      return {
        success: true,
        data: [
          { id: 1, name: 'Intel Vietnam', contact: 'intel@vietnam.com', phone: '0281234567' },
          { id: 2, name: 'NVIDIA Partner', contact: 'nvidia@partner.com', phone: '0287654321' },
          { id: 3, name: 'Corsair Distributor', contact: 'corsair@dist.com', phone: '0289876543' },
        ]
      };

    default:
      throw new Error(`Route not found: ${method} ${path}`);
  }
}
