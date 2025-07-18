const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING(100),
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  cost_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  vat_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.00, // Default Vietnamese VAT rate
    comment: 'VAT rate in percentage (0, 5, 10)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  reserved_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Quantity reserved for pending orders'
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    comment: 'Minimum stock level for alerts'
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'General'
  },
  description: {
    type: DataTypes.TEXT
  },
  warranty_months: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Warranty period in months'
  },
  condition: {
    type: DataTypes.ENUM('new', 'used_like_new', 'used_good', 'used_fair', 'refurbished', 'damaged'),
    defaultValue: 'new',
    comment: 'Physical condition of the product'
  },
  is_serialized: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this product requires serial number tracking'
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  track_inventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether inventory should be tracked for this product'
  },
  last_ordered_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['sku']
    },
    {
      fields: ['barcode']
    },
    {
      fields: ['category']
    },
    {
      fields: ['supplier_id']
    }
  ],
  hooks: {
    beforeValidate: (product) => {
      // Ensure VAT rate is only 0%, 5% or 10% (Vietnam tax regulations)
      if (product.vat_rate !== 0 && product.vat_rate !== 5 && product.vat_rate !== 10) {
        product.vat_rate = 10; // Default to 10% if invalid
      }
    }
  }
});

// Instance methods
Product.prototype.getAvailableQuantity = function() {
  return Math.max(0, this.quantity - this.reserved_quantity);
};

Product.prototype.isLowStock = function() {
  return this.getAvailableQuantity() <= this.min_stock_level;
};

Product.prototype.calculatePriceWithVAT = function() {
  return Number(this.price) * (1 + Number(this.vat_rate) / 100);
};

Product.prototype.calculateProfit = function() {
  return Number(this.price) - Number(this.cost_price);
};

Product.prototype.calculateProfitMargin = function() {
  if (this.price === 0) return 0;
  return (this.calculateProfit() / Number(this.price)) * 100;
};

// Class methods
Product.getCategories = () => {
  return [
    'CPU',
    'GPU',
    'RAM',
    'Mainboard',
    'SSD',
    'HDD',
    'PSU',
    'Case',
    'Cooling',
    'Monitor',
    'Keyboard',
    'Mouse',
    'Laptop',
    'Accessories',
    'Others'
  ];
};

Product.getConditions = () => {
  return [
    { value: 'new', label: 'Mới', warranty: true },
    { value: 'used_like_new', label: 'Đã qua sử dụng (Như mới)', warranty: true },
    { value: 'used_good', label: 'Đã qua sử dụng (Tốt)', warranty: true },
    { value: 'used_fair', label: 'Đã qua sử dụng (Trung bình)', warranty: false },
    { value: 'refurbished', label: 'Tân trang', warranty: true },
    { value: 'damaged', label: 'Hư hỏng (dùng làm linh kiện)', warranty: false }
  ];
};

Product.getVatRates = () => {
  return [
    { value: 0, label: '0%' },
    { value: 5, label: '5%' },
    { value: 10, label: '10%' }
  ];
};

module.exports = Product; 