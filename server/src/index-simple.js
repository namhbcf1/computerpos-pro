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
    message: 'NEW SIMPLE API VERSION 2.0!',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'Test route working!'
  });
});

// Suppliers endpoint
app.get('/api/suppliers', async (c) => {
  try {
    const mockSuppliers = [
      { id: 1, name: 'Công ty TNHH ABC', contact_person: 'Nguyễn Văn A', phone: '0901234567' },
      { id: 2, name: 'Nhà phân phối XYZ', contact_person: 'Trần Thị B', phone: '0902345678' }
    ];
    
    return c.json({
      success: true,
      data: mockSuppliers,
      message: 'Suppliers loaded successfully'
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
      { id: 2, name: 'Intel Core i7-13700K', price: 9990000, quantity: 20 }
    ];
    
    return c.json({
      success: true,
      data: mockProducts,
      message: 'Products loaded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading products: ' + error.message
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
