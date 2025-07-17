import express from 'express';
import cors from 'cors';

const app = express();

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Express API is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { results } = await req.env.DB.prepare('SELECT * FROM products LIMIT 10').all();
    
    res.json({
      success: true,
      data: results,
      message: 'Products loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading products',
      error: error.message
    });
  }
});

// Simple customers endpoint
app.get('/api/customers', async (req, res) => {
  try {
    const { results } = await req.env.DB.prepare('SELECT * FROM customers LIMIT 10').all();
    
    res.json({
      success: true,
      data: results,
      message: 'Customers loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading customers',
      error: error.message
    });
  }
});

// Cloudflare Workers handler
export default {
  async fetch(request, env, ctx) {
    // Add database to request
    request.env = env;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
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
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Simple routing
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Express API is running!',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (path === '/api/products') {
        const { results } = await env.DB.prepare('SELECT * FROM products LIMIT 10').all();
        
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

      if (path === '/api/customers') {
        const { results } = await env.DB.prepare('SELECT * FROM customers LIMIT 10').all();
        
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

      // Default response
      return new Response(JSON.stringify({
        success: false,
        message: 'Endpoint not found',
        path: path
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