// functions/utils/services/ProductService.ts
export interface ProductFilters {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  }
  
  export class ProductService {
    constructor(
      private db: D1Database,
      private cache: KVNamespace
    ) {}
  
    async getProducts(filters: ProductFilters = {}): Promise<any[]> {
      // Tạo cache key
      const cacheKey = `products:${JSON.stringify(filters)}`;
      
      // Kiểm tra cache trước
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
  
      // Build SQL query
      let sql = `
        SELECT 
          p.*,
          c.name as category_name,
          s.stock_quantity,
          s.reserved_quantity
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN stock s ON p.id = s.product_id
        WHERE p.active = 1
      `;
      
      const params: any[] = [];
  
      if (filters.category) {
        sql += ` AND c.slug = ?`;
        params.push(filters.category);
      }
  
      if (filters.priceMin !== undefined) {
        sql += ` AND p.price >= ?`;
        params.push(filters.priceMin);
      }
  
      if (filters.priceMax !== undefined) {
        sql += ` AND p.price <= ?`;
        params.push(filters.priceMax);
      }
  
      if (filters.inStock) {
        sql += ` AND s.stock_quantity > s.reserved_quantity`;
      }
  
      sql += ` ORDER BY p.created_at DESC`;
  
      const result = await this.db.prepare(sql).bind(...params).all();
      
      const products = result.results.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        price: row.price,
        category: row.category_name,
        stock: (row.stock_quantity || 0) - (row.reserved_quantity || 0),
        specifications: JSON.parse(row.specifications || '{}'),
        images: JSON.parse(row.images || '[]'),
        created_at: row.created_at
      }));
  
      // Cache kết quả 5 phút
      await this.cache.put(cacheKey, JSON.stringify(products), { expirationTtl: 300 });
  
      return products;
    }
  
    async getProductById(id: string): Promise<any | null> {
      const cacheKey = `product:${id}`;
      
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
  
      const result = await this.db.prepare(`
        SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          s.stock_quantity,
          s.reserved_quantity,
          s.warehouse_location
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN stock s ON p.id = s.product_id
        WHERE p.id = ? AND p.active = 1
      `).bind(id).first();
  
      if (!result) return null;
  
      const product = {
        id: result.id,
        name: result.name,
        slug: result.slug,
        description: result.description,
        price: result.price,
        category: {
          name: result.category_name,
          slug: result.category_slug
        },
        stock: {
          available: (result.stock_quantity || 0) - (result.reserved_quantity || 0),
          total: result.stock_quantity || 0,
          reserved: result.reserved_quantity || 0,
          location: result.warehouse_location
        },
        specifications: JSON.parse(result.specifications || '{}'),
        images: JSON.parse(result.images || '[]'),
        compatibility: JSON.parse(result.compatibility || '{}'),
        warranty: {
          period: result.warranty_period,
          type: result.warranty_type,
          provider: result.warranty_provider
        },
        created_at: result.created_at,
        updated_at: result.updated_at
      };
  
      await this.cache.put(cacheKey, JSON.stringify(product), { expirationTtl: 300 });
  
      return product;
    }
  
    async createProduct(data: any): Promise<any> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
  
      await this.db.prepare(`
        INSERT INTO products (
          id, name, slug, description, price, category_id,
          specifications, images, compatibility,
          warranty_period, warranty_type, warranty_provider,
          active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).bind(
        id,
        data.name,
        data.slug,
        data.description || null,
        data.price,
        data.category_id,
        JSON.stringify(data.specifications || {}),
        JSON.stringify(data.images || []),
        JSON.stringify(data.compatibility || {}),
        data.warranty_period || 12,
        data.warranty_type || 'manufacturer',
        data.warranty_provider || 'Chính hãng',
        now,
        now
      ).run();
  
      // Xóa cache liên quan
      await this.cache.delete(`products:*`);
  
      return this.getProductById(id);
    }
  }