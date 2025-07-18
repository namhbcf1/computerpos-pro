// Simple Cloudflare Worker for ComputerPOS Pro API
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

    // Default response
    return new Response(JSON.stringify({
      message: 'ComputerPOS Pro API',
      version: '1.0.0',
      endpoints: [
        '/api/products',
        '/api/customers', 
        '/api/orders',
        '/api/serials',
        '/api/warranty'
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

  // Mock data for testing
  const mockProducts = [
    { id: 1, name: 'CPU Intel i7-13700K', price: 8500000, category: 'CPU', stock: 15 },
    { id: 2, name: 'GPU RTX 4080', price: 25000000, category: 'GPU', stock: 8 },
    { id: 3, name: 'RAM 32GB DDR5', price: 4500000, category: 'RAM', stock: 20 },
  ];

  const mockCustomers = [
    { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@example.com' },
    { id: 2, name: 'Trần Thị B', phone: '0907654321', email: 'b@example.com' },
  ];

  const mockOrders = [
    { id: 'DH001', customerName: 'Nguyễn Văn A', total: 15000000, status: 'completed' },
    { id: 'DH002', customerName: 'Trần Thị B', total: 25000000, status: 'pending' },
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
      return { 
        success: true, 
        data: [
          { id: 1, serialNumber: 'SN001', productName: 'CPU Intel i7', status: 'available' },
          { id: 2, serialNumber: 'SN002', productName: 'GPU RTX 4080', status: 'sold' },
        ]
      };
      
    case path === '/api/warranty' && method === 'GET':
      return { 
        success: true, 
        data: [
          { id: 1, serialNumber: 'SN001', status: 'active', expiryDate: '2025-12-31' },
        ]
      };

    case path === '/api/financial/stats' && method === 'GET':
      return {
        success: true,
        data: {
          total_revenue: 50000000,
          total_expenses: 35000000,
          net_profit: 15000000,
          profit_margin: 30
        }
      };

    default:
      throw new Error(`Route not found: ${method} ${path}`);
  }
}
