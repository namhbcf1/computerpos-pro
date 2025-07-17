// API Client for ComputerPOS Pro
// Complete client functions for Cloudflare Workers integration

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://computerpos-pro-api.bangachieu2.workers.dev' 
  : 'http://localhost:8787';

// Base API client configuration
class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Set authorization token
  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: { ...this.headers, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.message || 'API request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : 'Network error',
        0,
        null
      );
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name_vi: string;
  name_en?: string;
  description_vi?: string;
  description_en?: string;
  category: string;
  brand: string;
  model?: string;
  cost_price: number;
  selling_price: number;
  retail_price?: number;
  supplier_id?: number;
  warranty_period: number;
  weight?: number;
  dimensions?: string;
  status: string;
  quantity?: number;
  reserved_quantity?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  location?: string;
  specifications?: Record<string, any>;
  avg_rating?: number;
  review_count?: number;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone: string;
  type: 'individual' | 'business' | 'vip' | 'wholesale';
  status: 'active' | 'inactive' | 'blacklisted';
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  company_name?: string;
  tax_code?: string;
  representative?: string;
  discount_rate: number;
  credit_limit: number;
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  join_date: string;
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  order_type: 'pos' | 'online' | 'phone';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  subtotal: number;
  vat_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  product?: Product;
}

export interface InventoryItem {
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  location: string;
  last_counted_at?: string;
  product?: Product;
}

export interface InventoryMovement {
  id: number;
  product_id: number;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reason: string;
  reference_type: string;
  reference_id: string;
  notes?: string;
  unit_cost?: number;
  created_at: string;
  created_by: string;
}

// Create API client instance
const apiClient = new APIClient();

// ============================================================================
// PRODUCTS API
// ============================================================================

export const productsAPI = {
  // Get all products with filtering and pagination
  async getProducts(params?: {
    category?: string;
    search?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/api/products', params);
  },

  // Get single product by ID
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/api/products/${id}`);
  },

  // Create new product
  async createProduct(product: Partial<Product>): Promise<ApiResponse<{ id: number; message: string }>> {
    return apiClient.post<{ id: number; message: string }>('/api/products', product);
  },

  // Update product
  async updateProduct(id: number, updates: Partial<Product>): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/api/products/${id}`, updates);
  },

  // Delete product
  async deleteProduct(id: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/products/${id}`);
  },

  // Search products for POS
  async searchForPOS(params: {
    q?: string;
    category?: string;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/api/pos/search', params);
  },

  // Find product by barcode
  async findByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/api/pos/barcode/${barcode}`);
  },
};

// ============================================================================
// CUSTOMERS API
// ============================================================================

export const customersAPI = {
  // Get all customers with filtering and pagination
  async getCustomers(params?: {
    search?: string;
    type?: string;
    status?: string;
    city?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<Customer[]>> {
    return apiClient.get<Customer[]>('/api/customers', params);
  },

  // Get single customer by ID
  async getCustomer(id: number): Promise<ApiResponse<Customer>> {
    return apiClient.get<Customer>(`/api/customers/${id}`);
  },

  // Create new customer
  async createCustomer(customer: Partial<Customer>): Promise<ApiResponse<{ id: number; message: string }>> {
    return apiClient.post<{ id: number; message: string }>('/api/customers', customer);
  },

  // Update customer
  async updateCustomer(id: number, updates: Partial<Customer>): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/api/customers/${id}`, updates);
  },

  // Delete customer
  async deleteCustomer(id: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/api/customers/${id}`);
  },

  // Get customer order history
  async getCustomerOrders(customerId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(`/api/customers/${customerId}/orders`, params);
  },
};

// ============================================================================
// ORDERS API
// ============================================================================

export const ordersAPI = {
  // Get all orders with filtering and pagination
  async getOrders(params?: {
    status?: string;
    payment_status?: string;
    customer_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>('/api/orders', params);
  },

  // Get single order by ID
  async getOrder(id: number): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`/api/orders/${id}`);
  },

  // Create new order
  async createOrder(order: {
    customer_id?: number;
    order_type?: string;
    payment_method?: string;
    discount_amount?: number;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
    created_by?: string;
  }): Promise<ApiResponse<{
    order_id: number;
    order_number: string;
    total_amount: number;
  }>> {
    return apiClient.post('/api/orders', order);
  },

  // Update order
  async updateOrder(id: number, updates: Partial<Order>): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/api/orders/${id}`, updates);
  },

  // Process POS sale (create and complete order immediately)
  async processPOSSale(sale: {
    customer_id?: number;
    payment_method: string;
    discount_amount?: number;
    notes?: string;
    items: Array<{
      product_id: number;
      quantity: number;
    }>;
  }): Promise<ApiResponse<{
    order_id: number;
    order_number: string;
    total_amount: number;
    status: string;
  }>> {
    return apiClient.post('/api/pos/sale', sale);
  },
};

// ============================================================================
// INVENTORY API
// ============================================================================

export const inventoryAPI = {
  // Get inventory with filtering and pagination
  async getInventory(params?: {
    category?: string;
    location?: string;
    status?: 'low_stock' | 'out_of_stock' | 'in_stock';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<InventoryItem[]>> {
    return apiClient.get<InventoryItem[]>('/api/inventory', params);
  },

  // Get single inventory item
  async getInventoryItem(productId: number): Promise<ApiResponse<InventoryItem>> {
    return apiClient.get<InventoryItem>(`/api/inventory/${productId}`);
  },

  // Adjust inventory
  async adjustInventory(adjustment: {
    product_id: number;
    adjustment_type: 'add' | 'subtract' | 'set';
    quantity: number;
    reason?: string;
    reference_type?: string;
    reference_id?: string;
    notes?: string;
    unit_cost?: number;
  }): Promise<ApiResponse<{
    previous_quantity: number;
    new_quantity: number;
    adjustment: number;
  }>> {
    return apiClient.post('/api/inventory/adjust', adjustment);
  },

  // Stock count
  async stockCount(count: {
    product_id: number;
    counted_quantity: number;
    notes?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/api/inventory/count', count);
  },

  // Update inventory settings
  async updateInventorySettings(productId: number, settings: {
    min_stock_level?: number;
    max_stock_level?: number;
    location?: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put(`/api/inventory/${productId}`, settings);
  },

  // Get inventory movements
  async getInventoryMovements(params?: {
    product_id?: number;
    movement_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<InventoryMovement[]>> {
    return apiClient.get<InventoryMovement[]>('/api/inventory/movements', params);
  },

  // Get low stock alerts
  async getLowStockAlerts(): Promise<ApiResponse<Array<{
    id: number;
    sku: string;
    name_vi: string;
    category: string;
    quantity: number;
    min_stock_level: number;
    location: string;
    shortage: number;
    selling_price: number;
  }>>> {
    return apiClient.get('/api/inventory/alerts');
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsAPI = {
  // Get dashboard analytics
  async getDashboardAnalytics(period: '7d' | '30d' | '90d' = '7d'): Promise<ApiResponse<{
    period: string;
    sales: {
      total_orders: number;
      total_revenue: number;
      avg_order_value: number;
    };
    inventory: {
      total_products: number;
      total_stock: number;
      low_stock_count: number;
      total_stock_value: number;
    };
    daily_sales: Array<{
      date: string;
      orders: number;
      revenue: number;
    }>;
    top_products: Array<{
      name_vi: string;
      total_sold: number;
      total_revenue: number;
    }>;
  }>> {
    return apiClient.get('/api/analytics/dashboard', { period });
  },

  // Get sales analytics
  async getSalesAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<any>> {
    return apiClient.get('/api/analytics/sales', params);
  },

  // Get inventory analytics
  async getInventoryAnalytics(params?: {
    category?: string;
    location?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get('/api/analytics/inventory', params);
  },

  // Get product analytics
  async getProductAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.get('/api/analytics/products', params);
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const apiUtils = {
  // Set authentication token for all requests
  setAuthToken: (token: string) => {
    apiClient.setAuthToken(token);
  },

  // Handle API errors consistently
  handleError: (error: unknown): string => {
    if (error instanceof APIError) {
      switch (error.status) {
        case 400:
          return error.data?.message || 'Dữ liệu không hợp lệ';
        case 401:
          return 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        case 403:
          return 'Không có quyền thực hiện thao tác này';
        case 404:
          return 'Không tìm thấy dữ liệu';
        case 409:
          return 'Dữ liệu đã tồn tại hoặc xung đột';
        case 422:
          return 'Dữ liệu không đúng định dạng';
        case 500:
          return 'Lỗi hệ thống. Vui lòng thử lại sau.';
        default:
          return error.message || 'Có lỗi xảy ra';
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Có lỗi không xác định xảy ra';
  },

  // Format API response for display
  formatResponse: <T>(response: ApiResponse<T>) => ({
    data: response.data,
    success: response.success,
    message: response.message,
    pagination: response.pagination,
  }),

  // Build query parameters
  buildParams: (params: Record<string, any>): Record<string, string> => {
    const result: Record<string, string> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result[key] = String(value);
      }
    });
    
    return result;
  },
};

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const bulkAPI = {
  // Bulk product operations
  async bulkUpdateProducts(updates: Array<{
    id: number;
    updates: Partial<Product>;
  }>): Promise<ApiResponse<{ updated: number; errors: any[] }>> {
    return apiClient.post('/api/products/bulk-update', { updates });
  },

  // Bulk inventory adjustments
  async bulkInventoryAdjustment(adjustments: Array<{
    product_id: number;
    adjustment_type: 'add' | 'subtract' | 'set';
    quantity: number;
    reason?: string;
    notes?: string;
  }>): Promise<ApiResponse<{ processed: number; errors: any[] }>> {
    return apiClient.post('/api/inventory/bulk-adjust', { adjustments });
  },

  // Bulk customer operations
  async bulkUpdateCustomers(updates: Array<{
    id: number;
    updates: Partial<Customer>;
  }>): Promise<ApiResponse<{ updated: number; errors: any[] }>> {
    return apiClient.post('/api/customers/bulk-update', { updates });
  },
};

// Export the main API object
export const api = {
  products: productsAPI,
  customers: customersAPI,
  orders: ordersAPI,
  inventory: inventoryAPI,
  analytics: analyticsAPI,
  bulk: bulkAPI,
  utils: apiUtils,
};

// Export default
export default api;