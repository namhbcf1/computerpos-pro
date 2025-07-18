const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import models để khởi tạo relationships
const { sequelize, testConnection } = require('./models');

// Import routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const userRoutes = require('./routes/users');
const financialRoutes = require('./routes/financial');

const app = express();
const PORT = process.env.PORT || 3001;

// Improved CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://pos-frontend-e1q.pages.dev',
        'https://ee4a9511.pos-frontend-e1q.pages.dev'
      ]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/financial', financialRoutes);

// Health check with additional info
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  
  res.json({ 
    success: true, 
    message: 'POS API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus,
      dialect: process.env.DB_DIALECT || 'mysql'
    },
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Improved error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    message: err.message || 'Có lỗi xảy ra trên server',
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err.details || null
    } : undefined,
    requestId: req.id || null
  };
  
  // Log error details
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    statusCode,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  
  res.status(statusCode).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại',
    path: req.originalUrl
  });
});

// Khởi động server with graceful shutdown
async function startServer() {
  try {
    // Test database connection
    const dbStatus = await testConnection();
    if (!dbStatus && process.env.NODE_ENV === 'production') {
      console.error('⚠️ Warning: Starting server despite database connection issues');
    }
    
    // Sync database (tạo bảng nếu chưa có)
    if (dbStatus) {
      await sequelize.sync({ alter: false });
      console.log('✅ Đồng bộ database thành công!');
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 POS API server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
      console.log(`🛒 Orders API: http://localhost:${PORT}/api/orders`);
      console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
      console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
      console.log(`💰 Financial API: http://localhost:${PORT}/api/financial`);
    });

    // Implement graceful shutdown
    const shutdown = async (signal) => {
      console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('🔌 HTTP server closed.');
        // Close database connections
        await sequelize.close();
        console.log('🔌 Database connections closed.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Couldn\'t close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error.message);
    console.error('💡 Kiểm tra lại cấu hình database trong file .env');
    process.exit(1);
  }
}

startServer(); 