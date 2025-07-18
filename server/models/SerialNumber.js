const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SerialNumber = sequelize.define('SerialNumber', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  serial_number: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true, // Ensure uniqueness across all products
    validate: {
      notEmpty: true
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('in_stock', 'sold', 'reserved', 'returned', 'defective'),
    defaultValue: 'in_stock',
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  warranty_start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  warranty_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  },
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  }
}, {
  tableName: 'serial_numbers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['serial_number'],
      unique: true
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['warranty_end_date']
    }
  ],
  hooks: {
    afterCreate: async (serialNumber, options) => {
      // Update product quantity when serial number is added
      const Product = require('./Product');
      await Product.increment('quantity', { 
        by: 1, 
        where: { id: serialNumber.product_id },
        transaction: options.transaction
      });
    },
    beforeUpdate: async (serialNumber, options) => {
      // If status changed to 'sold', set warranty dates
      if (serialNumber.changed('status') && serialNumber.status === 'sold') {
        const Product = require('./Product');
        const product = await Product.findByPk(serialNumber.product_id);
        
        if (product && product.warranty_months > 0) {
          const today = new Date();
          serialNumber.warranty_start_date = today;
          
          const endDate = new Date(today);
          endDate.setMonth(endDate.getMonth() + product.warranty_months);
          serialNumber.warranty_end_date = endDate;
        }
      }
    }
  }
});

// Instance methods
SerialNumber.prototype.isInWarranty = function() {
  if (!this.warranty_end_date) return false;
  return new Date() <= new Date(this.warranty_end_date);
};

SerialNumber.prototype.getWarrantyStatus = function() {
  if (!this.warranty_end_date) return 'Không bảo hành';
  return this.isInWarranty() ? 'Còn bảo hành' : 'Hết bảo hành';
};

SerialNumber.prototype.getRemainingWarrantyDays = function() {
  if (!this.warranty_end_date || !this.isInWarranty()) return 0;
  
  const today = new Date();
  const endDate = new Date(this.warranty_end_date);
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Define associations
SerialNumber.associate = (models) => {
  SerialNumber.belongsTo(models.Product, {
    foreignKey: 'product_id',
    onDelete: 'CASCADE'
  });
  
  SerialNumber.belongsTo(models.Order, {
    foreignKey: 'order_id'
  });
  
  SerialNumber.belongsTo(models.Customer, {
    foreignKey: 'customer_id'
  });
  
  SerialNumber.belongsTo(models.Supplier, {
    foreignKey: 'supplier_id'
  });
};

module.exports = SerialNumber; 