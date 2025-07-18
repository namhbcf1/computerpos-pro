import axios from 'axios';
import { mockAPI, shouldUseMockAPI } from './mockApi';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8787/api';

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

// Helper function to handle API calls with fallback to mock
const apiCall = async (apiFunction, mockFunction) => {
  if (shouldUseMockAPI()) {
    console.log('Using Mock API');
    return { data: await mockFunction() };
  }

  try {
    return await apiFunction();
  } catch (error) {
    console.warn('API call failed, falling back to mock data:', error.message);
    return { data: await mockFunction() };
  }
};

// ================================
// AUTHENTICATION & USERS API
// ================================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

export const usersAPI = {
  getAll: () => apiCall(
    () => api.get('/users'),
    () => mockAPI.users.getAll()
  ),
  getById: (id) => apiCall(
    () => api.get(`/users/${id}`),
    () => mockAPI.users.getAll().then(res => ({ ...res, data: res.data.find(u => u.id === parseInt(id)) }))
  ),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// ================================
// CUSTOMERS API (CRM)
// ================================

export const customersAPI = {
  getAll: (params = {}) => apiCall(
    () => api.get('/customers', { params }),
    () => mockAPI.customers.getAll()
  ),
  getById: (id) => apiCall(
    () => api.get(`/customers/${id}`),
    () => mockAPI.customers.getAll().then(res => ({ ...res, data: res.data.find(c => c.id === parseInt(id)) }))
  ),
  create: (customerData) => apiCall(
    () => api.post('/customers', customerData),
    () => mockAPI.customers.create(customerData)
  ),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
  getStats: (id) => api.get(`/customers/${id}/stats`),
};

// ================================
// SUPPLIERS API
// ================================

export const suppliersAPI = {
  getAll: (params = {}) => apiCall(
    () => api.get('/suppliers', { params }),
    () => mockAPI.suppliers.getAll()
  ),
  getById: (id) => apiCall(
    () => api.get(`/suppliers/${id}`),
    () => mockAPI.suppliers.getAll().then(res => ({ ...res, data: res.data.find(s => s.id === parseInt(id)) }))
  ),
  create: (supplierData) => apiCall(
    () => api.post('/suppliers', supplierData),
    () => mockAPI.suppliers.create(supplierData)
  ),
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
  getAll: (params = {}) => apiCall(
    () => api.get('/products', { params }),
    () => mockAPI.products.getAll()
  ),
  getById: (id) => apiCall(
    () => api.get(`/products/${id}`),
    () => mockAPI.products.getAll().then(res => ({ ...res, data: res.data.find(p => p.id === parseInt(id)) }))
  ),
  create: (productData) => apiCall(
    () => api.post('/products', productData),
    () => mockAPI.products.create(productData)
  ),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => apiCall(
    () => api.get('/products', { params: { low_stock: 'true' } }),
    () => mockAPI.products.getAll().then(res => ({ ...res, data: res.data.filter(p => p.quantity <= 10) }))
  ),
  searchByBarcode: (barcode) => apiCall(
    () => api.get('/products', { params: { search: barcode } }),
    () => mockAPI.products.getAll().then(res => ({ ...res, data: res.data.filter(p => p.sku?.includes(barcode) || p.name?.includes(barcode)) }))
  ),
};

// ================================
// ENHANCED ORDERS API
// ================================

export const ordersAPI = {
  getAll: (params = {}) => apiCall(
    () => api.get('/orders', { params }),
    () => mockAPI.orders.getAll()
  ),
  getById: (id) => apiCall(
    () => api.get(`/orders/${id}`),
    () => mockAPI.orders.getAll().then(res => ({ ...res, data: res.data.find(o => o.id === parseInt(id)) }))
  ),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: () => apiCall(
    () => api.get('/orders/stats/summary'),
    () => mockAPI.orders.getStats()
  ),
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
  getTransactions: (params = {}) => apiCall(
    () => api.get('/financial/transactions', { params }),
    () => mockAPI.financial.getTransactions()
  ),
  create: (transactionData) => api.post('/financial/transactions', transactionData),
  update: (id, transactionData) => api.put(`/financial/transactions/${id}`, transactionData),
  delete: (id) => api.delete(`/financial/transactions/${id}`),
  getSummary: (params = {}) => apiCall(
    () => api.get('/financial/summary', { params }),
    () => mockAPI.financial.getSummary()
  ),
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
  getBestSelling: (params = {}) => apiCall(
    () => api.get('/reports/best-selling', { params }),
    () => mockAPI.reports.getBestSelling()
  ),
  getProfitLoss: (params = {}) => api.get('/reports/profit-loss', { params }),
  getSalesReport: (params = {}) => apiCall(
    () => api.get('/reports/sales', { params }),
    () => mockAPI.reports.getSales()
  ),
  getInventoryReport: (params = {}) => api.get('/reports/inventory', { params }),
  getCustomerReport: (params = {}) => api.get('/reports/customers', { params }),
  getFinancialSummary: (params = {}) => apiCall(
    () => api.get('/reports/financial-summary', { params }),
    () => mockAPI.financial.getSummary()
  ),
  getDashboardStats: () => apiCall(
    () => api.get('/orders/stats/summary'),
    () => mockAPI.orders.getStats()
  ),
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
  getProductSerials: (productId, params = {}) => apiCall(
    () => api.get(`/products/${productId}/serials`, { params }),
    () => mockAPI.serials.search().then(res => ({ ...res, data: res.data.filter(s => s.product_id === parseInt(productId)) }))
  ),
  addProductSerials: (productId, serials) => api.post(`/products/${productId}/serials`, { serials }),
  updateSerial: (serialId, data) => api.put(`/serials/${serialId}`, data),
  removeSerial: (serialId) => api.delete(`/serials/${serialId}`),
  sellSerials: (data) => api.post('/serials/sell', data),
  getSoldSerials: (params = {}) => apiCall(
    () => api.get('/serials/sold', { params }),
    () => mockAPI.serials.search().then(res => ({ ...res, data: res.data.filter(s => s.status === 'sold') }))
  ),
  searchSerials: (params = {}) => apiCall(
    () => api.get('/serials/search', { params }),
    () => mockAPI.serials.search()
  ),
};

// ================================
// WARRANTY MANAGEMENT API
// ================================

export const warrantyAPI = {
  getAll: (params = {}) => api.get('/warranties', { params }),
  getById: (id) => api.get(`/warranties/${id}`),
  create: (warrantyData) => api.post('/warranties', warrantyData),
  update: (id, warrantyData) => api.put(`/warranties/${id}`, warrantyData),
  delete: (id) => api.delete(`/warranties/${id}`),
  extend: (id, extensionData) => api.post(`/warranties/${id}/extend`, extensionData),
  void: (id, reason) => api.post(`/warranties/${id}/void`, { reason }),

  // Warranty Claims
  getClaims: (params = {}) => api.get('/warranty-claims', { params }),
  getClaimById: (id) => api.get(`/warranty-claims/${id}`),
  createClaim: (claimData) => api.post('/warranty-claims', claimData),
  updateClaim: (id, claimData) => api.put(`/warranty-claims/${id}`, claimData),
  approveClaim: (id, approvalData) => api.post(`/warranty-claims/${id}/approve`, approvalData),
  rejectClaim: (id, rejectionData) => api.post(`/warranty-claims/${id}/reject`, rejectionData),
  completeClaim: (id, completionData) => api.post(`/warranty-claims/${id}/complete`, completionData),

  // Warranty History
  getHistory: (warrantyId) => api.get(`/warranties/${warrantyId}/history`),

  // Statistics
  getStats: () => api.get('/warranties/stats'),
  getExpiringWarranties: (days = 30) => api.get('/warranties/expiring', { params: { days } }),
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
  warranty: warrantyAPI,
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