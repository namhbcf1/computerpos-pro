// Mock API service for testing when backend is not available

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockSuppliers = [
  { id: 1, code: 'SUP001', name: 'Công ty TNHH ABC', contact_person: 'Nguyễn Văn A', phone: '0901234567', email: 'contact@abc.com', is_active: true },
  { id: 2, code: 'SUP002', name: 'Nhà phân phối XYZ', contact_person: 'Trần Thị B', phone: '0902345678', email: 'info@xyz.com', is_active: true },
  { id: 3, code: 'SUP003', name: 'Công ty Điện tử DEF', contact_person: 'Lê Văn C', phone: '0903456789', email: 'sales@def.com', is_active: true }
];

const mockProducts = [
  { id: 1, name: 'Intel Core i5-13400F', price: 4690000, quantity: 25, sku: 'CPU-INTEL-i5-13400F', warranty_months: 36 },
  { id: 2, name: 'Intel Core i7-13700K', price: 9990000, quantity: 20, sku: 'CPU-INTEL-i7-13700K', warranty_months: 36 },
  { id: 3, name: 'AMD Ryzen 5 7600X', price: 5990000, quantity: 15, sku: 'CPU-AMD-R5-7600X', warranty_months: 36 },
  { id: 4, name: 'ASUS PRIME B760M-A WIFI', price: 3290000, quantity: 20, sku: 'MB-ASUS-B760M-A-WIFI', warranty_months: 36 },
  { id: 5, name: 'Corsair Vengeance LPX 16GB DDR4-3200', price: 1890000, quantity: 35, sku: 'RAM-CORSAIR-16GB-DDR4-3200', warranty_months: 36 }
];

const mockCustomers = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0123456789', email: 'nguyenvana@gmail.com', address: '123 Nguyễn Huệ, Quận 1', city: 'Hồ Chí Minh' },
  { id: 2, name: 'Trần Thị B', phone: '0987654321', email: 'tranthib@gmail.com', address: '456 Lê Lợi, Quận 3', city: 'Hồ Chí Minh' },
  { id: 3, name: 'Lê Văn C', phone: '0912345678', email: 'levanc@gmail.com', address: '789 Hai Bà Trưng, Quận 1', city: 'Hồ Chí Minh' }
];

const mockOrders = [
  { id: 1, order_number: 'DH001', total_amount: 5159000, status: 'completed', created_at: new Date().toISOString(), customer: { name: 'Nguyễn Văn A' } },
  { id: 2, order_number: 'DH002', total_amount: 17578000, status: 'completed', created_at: new Date().toISOString(), customer: { name: 'Trần Thị B' } },
  { id: 3, order_number: 'DH003', total_amount: 2519000, status: 'pending', created_at: new Date().toISOString(), customer: { name: 'Lê Văn C' } }
];

const mockUsers = [
  { id: 1, username: 'admin', full_name: 'Administrator', email: 'admin@pos.com', role: 'admin', is_active: true },
  { id: 2, username: 'staff1', full_name: 'Nhân viên 1', email: 'staff1@pos.com', role: 'staff', is_active: true },
  { id: 3, username: 'staff2', full_name: 'Nhân viên 2', email: 'staff2@pos.com', role: 'staff', is_active: true }
];

const mockFinancialTransactions = [
  { id: 1, type: 'income', category: 'sales', amount: 500000, description: 'Bán hàng ngày 18/07/2025', transaction_date: new Date().toISOString() },
  { id: 2, type: 'expense', category: 'purchase', amount: 300000, description: 'Mua hàng từ nhà cung cấp', transaction_date: new Date().toISOString() },
  { id: 3, type: 'income', category: 'sales', amount: 750000, description: 'Bán hàng ngày 18/07/2025', transaction_date: new Date().toISOString() }
];

const mockSerials = [
  { id: 1, serial_number: 'SN001234567890', product_name: 'Intel Core i5-13400F', status: 'available', condition: 'new', product_id: 1 },
  { id: 2, serial_number: 'SN001234567891', product_name: 'Intel Core i7-13700K', status: 'sold', condition: 'new', product_id: 2 },
  { id: 3, serial_number: 'SN001234567892', product_name: 'AMD Ryzen 5 7600X', status: 'available', condition: 'new', product_id: 3 }
];

// Mock API functions
export const mockAPI = {
  // Health check
  health: async () => {
    await delay(100);
    return {
      success: true,
      message: 'Mock API is working!',
      timestamp: new Date().toISOString()
    };
  },

  // Suppliers
  suppliers: {
    getAll: async () => {
      await delay(200);
      return {
        success: true,
        data: mockSuppliers,
        message: 'Lấy danh sách nhà cung cấp thành công'
      };
    },
    create: async (data) => {
      await delay(300);
      const newSupplier = {
        id: mockSuppliers.length + 1,
        code: `SUP${String(mockSuppliers.length + 1).padStart(3, '0')}`,
        ...data,
        is_active: true
      };
      mockSuppliers.push(newSupplier);
      return {
        success: true,
        data: newSupplier,
        message: 'Tạo nhà cung cấp thành công'
      };
    }
  },

  // Products
  products: {
    getAll: async () => {
      await delay(200);
      return {
        success: true,
        data: mockProducts,
        message: 'Lấy danh sách sản phẩm thành công'
      };
    },
    create: async (data) => {
      await delay(300);
      const newProduct = {
        id: mockProducts.length + 1,
        sku: `PRD${String(mockProducts.length + 1).padStart(3, '0')}`,
        ...data,
        quantity: data.quantity || 0
      };
      mockProducts.push(newProduct);
      return {
        success: true,
        data: newProduct,
        message: 'Tạo sản phẩm thành công'
      };
    }
  },

  // Customers
  customers: {
    getAll: async () => {
      await delay(200);
      return {
        success: true,
        data: mockCustomers,
        message: 'Lấy danh sách khách hàng thành công'
      };
    },
    create: async (data) => {
      await delay(300);
      const newCustomer = {
        id: mockCustomers.length + 1,
        ...data
      };
      mockCustomers.push(newCustomer);
      return {
        success: true,
        data: newCustomer,
        message: 'Tạo khách hàng thành công'
      };
    }
  },

  // Orders
  orders: {
    getAll: async () => {
      await delay(200);
      return {
        success: true,
        data: mockOrders,
        message: 'Lấy danh sách đơn hàng thành công'
      };
    },
    getStats: async () => {
      await delay(150);
      return {
        success: true,
        data: {
          totalSales: mockOrders.filter(o => o.status === 'completed').length,
          customers: mockCustomers.length,
          revenue: mockOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total_amount, 0),
          products: mockProducts.length
        },
        message: 'Lấy thống kê thành công'
      };
    }
  },

  // Users
  users: {
    getAll: async () => {
      await delay(200);
      return {
        success: true,
        data: mockUsers,
        message: 'Lấy danh sách nhân viên thành công'
      };
    }
  },

  // Financial
  financial: {
    getTransactions: async () => {
      await delay(200);
      return {
        success: true,
        data: mockFinancialTransactions,
        message: 'Lấy danh sách giao dịch thành công'
      };
    },
    getSummary: async () => {
      await delay(150);
      const income = mockFinancialTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = mockFinancialTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return {
        success: true,
        data: {
          total_income: income,
          total_expense: expense,
          net_profit: income - expense,
          profit_margin: income > 0 ? ((income - expense) / income * 100).toFixed(2) : 0
        },
        message: 'Lấy tóm tắt tài chính thành công'
      };
    }
  },

  // Serials
  serials: {
    search: async () => {
      await delay(200);
      return {
        success: true,
        data: mockSerials,
        message: 'Tìm kiếm serial thành công'
      };
    }
  },

  // Reports
  reports: {
    getSales: async () => {
      await delay(200);
      return {
        success: true,
        data: [
          { date: '2025-07-18', revenue: 5000000, orders: 10 },
          { date: '2025-07-17', revenue: 3500000, orders: 7 },
          { date: '2025-07-16', revenue: 4200000, orders: 8 }
        ],
        message: 'Lấy báo cáo bán hàng thành công'
      };
    },
    getBestSelling: async () => {
      await delay(200);
      return {
        success: true,
        data: [
          { product_name: 'Intel Core i5-13400F', total_sold: 15, revenue: 70350000 },
          { product_name: 'Corsair Vengeance LPX 16GB', total_sold: 12, revenue: 22680000 }
        ],
        message: 'Lấy báo cáo sản phẩm bán chạy thành công'
      };
    }
  }
};

// Check if we should use mock API (when backend is not available)
export const shouldUseMockAPI = () => {
  return process.env.REACT_APP_USE_MOCK_API === 'true' || window.location.search.includes('mock=true');
};
