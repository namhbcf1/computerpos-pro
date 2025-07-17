import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://pos-backend.bangachieu2.workers.dev/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để log
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ================================
// AUTHENTICATION & USERS API
// ================================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// ================================
// CUSTOMERS API (CRM)
// ================================

export const customersAPI = {
  getAll: (params = {}) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
  getStats: (id) => api.get(`/customers/${id}/stats`),
};

// ================================
// SUPPLIERS API
// ================================

export const suppliersAPI = {
  getAll: (params = {}) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// ================================
// CATEGORIES API
// ================================

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ================================
// ENHANCED PRODUCTS API
// ================================

export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products', { params: { low_stock: 'true' } }),
  searchByBarcode: (barcode) => api.get('/products', { params: { search: barcode } }),
};

// ================================
// ENHANCED ORDERS API
// ================================

export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: () => api.get('/orders/stats/summary'),
};

// ================================
// INVENTORY MANAGEMENT API
// ================================

export const inventoryAPI = {
  getTransactions: (params = {}) => api.get('/inventory/transactions', { params }),
  adjustStock: (adjustmentData) => api.post('/inventory/adjustment', adjustmentData),
  getStockLevels: () => api.get('/inventory/stock-levels'),
  importStock: (importData) => api.post('/inventory/import', importData),
  exportStock: (exportData) => api.post('/inventory/export', exportData),
};

// ================================
// FINANCIAL TRANSACTIONS API
// ================================

export const financialAPI = {
  getTransactions: (params = {}) => api.get('/financial/transactions', { params }),
  create: (transactionData) => api.post('/financial/transactions', transactionData),
  update: (id, transactionData) => api.put(`/financial/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/financial/transactions/${id}`),
  getSummary: (params = {}) => api.get('/financial/summary', { params }),
};

// ================================
// PURCHASE ORDERS API
// ================================

export const purchaseOrdersAPI = {
  getAll: (params = {}) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (orderData) => api.post('/purchase-orders', orderData),
  update: (id, orderData) => api.put(`/purchase-orders/${id}`, orderData),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
  receive: (id, receiveData) => api.post(`/purchase-orders/${id}/receive`, receiveData),
};

// ================================
// REPORTS & ANALYTICS API
// ================================

export const reportsAPI = {
  getBestSelling: (params = {}) => api.get('/reports/best-selling', { params }),
  getProfitLoss: (params = {}) => api.get('/reports/profit-loss', { params }),
  getSalesReport: (params = {}) => api.get('/reports/sales', { params }),
  getInventoryReport: (params = {}) => api.get('/reports/inventory', { params }),
  getCustomerReport: (params = {}) => api.get('/reports/customers', { params }),
  getFinancialSummary: (params = {}) => api.get('/reports/financial-summary', { params }),
  getDashboardStats: () => api.get('/orders/stats/summary'),
};

// ================================
// SETTINGS & CONFIGURATION API
// ================================

export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData),
  getSystemInfo: () => api.get('/health'),
  backup: () => api.post('/backup'),
  restore: (backupData) => api.post('/restore', backupData),
};

// ================================
// SERIAL NUMBER MANAGEMENT API
// ================================

export const serialsAPI = {
  getProductSerials: (productId, params = {}) => api.get(`/products/${productId}/serials`, { params }),
  addProductSerials: (productId, serials) => api.post(`/products/${productId}/serials`, { serials }),
  updateSerial: (serialId, data) => api.put(`/serials/${serialId}`, data),
  removeSerial: (serialId) => api.delete(`/serials/${serialId}`),
  sellSerials: (data) => api.post('/serials/sell', data),
  getSoldSerials: (params = {}) => api.get('/serials/sold', { params }),
  searchSerials: (params = {}) => api.get('/serials/search', { params }),
};

// ================================
// BARCODE & HARDWARE INTEGRATION
// ================================

export const hardwareAPI = {
  generateBarcode: (productId) => api.post(`/hardware/generate-barcode/${productId}`),
  printReceipt: (orderId) => api.post(`/hardware/print-receipt/${orderId}`),
  scanBarcode: (barcode) => api.get(`/hardware/scan-barcode/${barcode}`),
  testPrinter: () => api.post('/hardware/test-printer'),
};

// ================================
// LEGACY API (Backward Compatibility)
// ================================

// Giữ lại các function cũ để không break existing code
export const getProducts = (params) => productsAPI.getAll(params);
export const getProductById = (id) => productsAPI.getById(id);
export const createProduct = (productData) => productsAPI.create(productData);
export const updateProduct = (id, productData) => productsAPI.update(id, productData);
export const deleteProduct = (id) => productsAPI.delete(id);

export const getOrders = (params) => ordersAPI.getAll(params);
export const getOrderById = (id) => ordersAPI.getById(id);
export const createOrder = (orderData) => ordersAPI.create(orderData);

export const getOrderStats = () => ordersAPI.getStats();

// Export default để sử dụng các method API riêng lẻ
export default {
  auth: authAPI,
  users: usersAPI,
  customers: customersAPI,
  suppliers: suppliersAPI,
  categories: categoriesAPI,
  products: productsAPI,
  orders: ordersAPI,
  inventory: inventoryAPI,
  financial: financialAPI,
  purchaseOrders: purchaseOrdersAPI,
  reports: reportsAPI,
  settings: settingsAPI,
  serials: serialsAPI,
  hardware: hardwareAPI,
};

// Export utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const downloadReport = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reports/${reportType}/download`, {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}; 