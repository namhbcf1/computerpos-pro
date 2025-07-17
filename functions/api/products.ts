// functions/api/products.ts
import { ProductService } from '../utils/services/ProductService';
import { validateRequest } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const productService = new ProductService(env.DB, env.CACHE);

      if (path === '/api/products' && method === 'GET') {
        const filters = {
          category: url.searchParams.get('category') || undefined,
          priceMin: url.searchParams.get('priceMin') ? parseInt(url.searchParams.get('priceMin')!) : undefined,
          priceMax: url.searchParams.get('priceMax') ? parseInt(url.searchParams.get('priceMax')!) : undefined,
          inStock: url.searchParams.get('inStock') === 'true',
        };

        const products = await productService.getProducts(filters);
        return new Response(JSON.stringify(products), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.match(/^\/api\/products\/([^\/]+)$/) && method === 'GET') {
        const productId = path.split('/').pop()!;
        const product = await productService.getProductById(productId);
        
        if (!product) {
          return new Response('Product not found', { 
            status: 404, 
            headers: corsHeaders 
          });
        }

        return new Response(JSON.stringify(product), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/products' && method === 'POST') {
        // Chỉ admin mới được tạo sản phẩm
        const authResult = await authMiddleware(request, env);
        if (!authResult.success || authResult.user?.role !== 'admin') {
          return new Response('Unauthorized', { 
            status: 401, 
            headers: corsHeaders 
          });
        }

        const validation = await validateRequest(request, 'createProduct');
        if (!validation.success) {
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const product = await productService.createProduct(validation.data);
        return new Response(JSON.stringify(product), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('API Error:', error);
      return new Response('Internal Server Error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};