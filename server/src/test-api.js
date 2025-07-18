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
    message: 'TEST API VERSION 3.0 WORKING!',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'Test route working from new file!'
  });
});

// Suppliers endpoint
app.get('/api/suppliers', async (c) => {
  try {
    const mockSuppliers = [
      { id: 1, name: 'Công ty TNHH ABC', contact_person: 'Nguyễn Văn A', phone: '0901234567' },
      { id: 2, name: 'Nhà phân phối XYZ', contact_person: 'Trần Thị B', phone: '0902345678' },
      { id: 3, name: 'Công ty Điện tử DEF', contact_person: 'Lê Văn C', phone: '0903456789' }
    ];
    
    return c.json({
      success: true,
      data: mockSuppliers,
      message: 'Suppliers loaded successfully from TEST API'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading suppliers: ' + error.message
    }, 500);
  }
});

// Products endpoint
app.get('/api/products', async (c) => {
  try {
    const mockProducts = [
      { id: 1, name: 'Intel Core i5-13400F', price: 4690000, quantity: 25 },
      { id: 2, name: 'Intel Core i7-13700K', price: 9990000, quantity: 20 },
      { id: 3, name: 'AMD Ryzen 5 7600X', price: 5990000, quantity: 15 }
    ];
    
    return c.json({
      success: true,
      data: mockProducts,
      message: 'Products loaded successfully from TEST API'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading products: ' + error.message
    }, 500);
  }
});

// Customers endpoint
app.get('/api/customers', async (c) => {
  try {
    const mockCustomers = [
      { id: 1, name: 'Nguyễn Văn A', phone: '0123456789', email: 'nguyenvana@gmail.com' },
      { id: 2, name: 'Trần Thị B', phone: '0987654321', email: 'tranthib@gmail.com' }
    ];
    
    return c.json({
      success: true,
      data: mockCustomers,
      message: 'Customers loaded successfully from TEST API'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading customers: ' + error.message
    }, 500);
  }
});

// Financial transactions endpoint
app.get('/api/financial/transactions', async (c) => {
  try {
    const mockTransactions = [
      { id: 1, type: 'income', amount: 500000, description: 'Bán hàng ngày 18/07/2025' },
      { id: 2, type: 'expense', amount: 300000, description: 'Mua hàng từ nhà cung cấp' }
    ];
    
    return c.json({
      success: true,
      data: mockTransactions,
      message: 'Financial transactions loaded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading financial transactions: ' + error.message
    }, 500);
  }
});

// Users endpoint
app.get('/api/users', async (c) => {
  try {
    const mockUsers = [
      { id: 1, username: 'admin', full_name: 'Administrator', role: 'admin' },
      { id: 2, username: 'staff1', full_name: 'Nhân viên 1', role: 'staff' }
    ];
    
    return c.json({
      success: true,
      data: mockUsers,
      message: 'Users loaded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading users: ' + error.message
    }, 500);
  }
});

// Catch-all route
app.all('*', (c) => {
  return c.json({
    success: false,
    message: 'Endpoint not found in TEST API',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

export default app;
