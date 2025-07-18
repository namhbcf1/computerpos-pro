import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'FRESH NEW API WORKING PERFECTLY!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Suppliers endpoint
app.get('/api/suppliers', async (c) => {
  try {
    const mockSuppliers = [
      { id: 1, code: 'SUP001', name: 'Công ty TNHH ABC', contact_person: 'Nguyễn Văn A', phone: '0901234567', email: 'contact@abc.com' },
      { id: 2, code: 'SUP002', name: 'Nhà phân phối XYZ', contact_person: 'Trần Thị B', phone: '0902345678', email: 'info@xyz.com' },
      { id: 3, code: 'SUP003', name: 'Công ty Điện tử DEF', contact_person: 'Lê Văn C', phone: '0903456789', email: 'sales@def.com' }
    ];
    
    return c.json({
      success: true,
      data: mockSuppliers,
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

// Products endpoint
app.get('/api/products', async (c) => {
  try {
    const mockProducts = [
      { id: 1, name: 'Intel Core i5-13400F', price: 4690000, quantity: 25, sku: 'CPU-INTEL-i5-13400F' },
      { id: 2, name: 'Intel Core i7-13700K', price: 9990000, quantity: 20, sku: 'CPU-INTEL-i7-13700K' },
      { id: 3, name: 'AMD Ryzen 5 7600X', price: 5990000, quantity: 15, sku: 'CPU-AMD-R5-7600X' },
      { id: 4, name: 'ASUS PRIME B760M-A WIFI', price: 3290000, quantity: 20, sku: 'MB-ASUS-B760M-A-WIFI' },
      { id: 5, name: 'Corsair Vengeance LPX 16GB DDR4-3200', price: 1890000, quantity: 35, sku: 'RAM-CORSAIR-16GB-DDR4-3200' }
    ];
    
    return c.json({
      success: true,
      data: mockProducts,
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

// Customers endpoint
app.get('/api/customers', async (c) => {
  try {
    const mockCustomers = [
      { id: 1, name: 'Nguyễn Văn A', phone: '0123456789', email: 'nguyenvana@gmail.com', address: '123 Nguyễn Huệ, Quận 1' },
      { id: 2, name: 'Trần Thị B', phone: '0987654321', email: 'tranthib@gmail.com', address: '456 Lê Lợi, Quận 3' },
      { id: 3, name: 'Lê Văn C', phone: '0912345678', email: 'levanc@gmail.com', address: '789 Hai Bà Trưng, Quận 1' }
    ];
    
    return c.json({
      success: true,
      data: mockCustomers,
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

// Orders endpoint
app.get('/api/orders', async (c) => {
  try {
    const mockOrders = [
      { id: 1, order_number: 'DH001', total_amount: 5159000, status: 'completed', created_at: new Date().toISOString(), customer: { name: 'Nguyễn Văn A' } },
      { id: 2, order_number: 'DH002', total_amount: 17578000, status: 'completed', created_at: new Date().toISOString(), customer: { name: 'Trần Thị B' } },
      { id: 3, order_number: 'DH003', total_amount: 2519000, status: 'pending', created_at: new Date().toISOString(), customer: { name: 'Lê Văn C' } }
    ];
    
    return c.json({
      success: true,
      data: mockOrders,
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

// Order stats
app.get('/api/orders/stats/summary', async (c) => {
  try {
    const mockStats = {
      totalSales: 25,
      customers: 15,
      revenue: 125000000,
      products: 50
    };
    
    return c.json({
      success: true,
      data: mockStats,
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

// Financial transactions endpoint
app.get('/api/financial/transactions', async (c) => {
  try {
    const mockTransactions = [
      { id: 1, type: 'income', category: 'sales', amount: 500000, description: 'Bán hàng ngày 18/07/2025', transaction_date: new Date().toISOString() },
      { id: 2, type: 'expense', category: 'purchase', amount: 300000, description: 'Mua hàng từ nhà cung cấp', transaction_date: new Date().toISOString() },
      { id: 3, type: 'income', category: 'sales', amount: 750000, description: 'Bán hàng ngày 18/07/2025', transaction_date: new Date().toISOString() }
    ];
    
    return c.json({
      success: true,
      data: mockTransactions,
      message: 'Lấy danh sách giao dịch thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách giao dịch',
      error: error.message
    }, 500);
  }
});

// Users endpoint
app.get('/api/users', async (c) => {
  try {
    const mockUsers = [
      { id: 1, username: 'admin', full_name: 'Administrator', email: 'admin@pos.com', role: 'admin', is_active: true },
      { id: 2, username: 'staff1', full_name: 'Nhân viên 1', email: 'staff1@pos.com', role: 'staff', is_active: true },
      { id: 3, username: 'staff2', full_name: 'Nhân viên 2', email: 'staff2@pos.com', role: 'staff', is_active: true }
    ];
    
    return c.json({
      success: true,
      data: mockUsers,
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

// Serial numbers search endpoint
app.get('/api/serials/search', async (c) => {
  try {
    const mockSerials = [
      { id: 1, serial_number: 'SN001234567890', product_name: 'Intel Core i5-13400F', status: 'available', condition: 'new' },
      { id: 2, serial_number: 'SN001234567891', product_name: 'Intel Core i7-13700K', status: 'sold', condition: 'new' }
    ];
    
    return c.json({
      success: true,
      data: mockSerials,
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

// Reports endpoints
app.get('/api/reports/sales', async (c) => {
  try {
    const mockSalesData = [
      { date: '2025-07-18', revenue: 5000000, orders: 10 },
      { date: '2025-07-17', revenue: 3500000, orders: 7 },
      { date: '2025-07-16', revenue: 4200000, orders: 8 }
    ];
    
    return c.json({
      success: true,
      data: mockSalesData,
      message: 'Lấy báo cáo bán hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy báo cáo bán hàng',
      error: error.message
    }, 500);
  }
});

app.get('/api/reports/best-selling', async (c) => {
  try {
    const mockBestSelling = [
      { product_name: 'Intel Core i5-13400F', total_sold: 15, revenue: 70350000 },
      { product_name: 'Corsair Vengeance LPX 16GB', total_sold: 12, revenue: 22680000 }
    ];
    
    return c.json({
      success: true,
      data: mockBestSelling,
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

app.get('/api/reports/financial-summary', async (c) => {
  try {
    const mockFinancialSummary = {
      total_income: 15000000,
      total_expense: 8000000,
      net_profit: 7000000,
      profit_margin: 46.67
    };
    
    return c.json({
      success: true,
      data: mockFinancialSummary,
      message: 'Lấy tóm tắt tài chính thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy tóm tắt tài chính',
      error: error.message
    }, 500);
  }
});

// Catch-all route
app.all('*', (c) => {
  return c.json({
    success: false,
    message: 'Endpoint not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

export default app;
