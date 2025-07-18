const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for cases where customer is not selected (e.g., walk-in)
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  customer_name: {
    type: DataTypes.STRING(255),
    defaultValue: 'Khách hàng'
  },
  customer_phone: {
    type: DataTypes.STRING(20)
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Default to admin user
    references: {
      model: 'users',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total before tax'
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Total VAT amount'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'returned'),
    defaultValue: 'completed'
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'ewallet'),
    defaultValue: 'cash',
    allowNull: false
  },
  payment_status: {
    type: DataTypes.ENUM('paid', 'unpaid', 'partially_paid'),
    defaultValue: 'paid',
    allowNull: false
  },
  amount_paid: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  balance_due: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
    comment: 'VAT invoice number (if issued)'
  },
  tax_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Company tax code for B2B orders'
  },
  notes: {
    type: DataTypes.TEXT
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['order_number']
    },
    {
      fields: ['customer_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['transaction_date']
    }
  ],
  hooks: {
    beforeCreate: (order) => {
      // Generate unique order number if not provided
      if (!order.order_number) {
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        order.order_number = `ORD${timestamp}${random}`;
      }
      
      // Ensure balance_due is calculated correctly
      order.balance_due = Math.max(0, Number(order.total_amount) - Number(order.amount_paid));
      
      // Set payment status based on amounts
      if (Number(order.amount_paid) >= Number(order.total_amount)) {
        order.payment_status = 'paid';
        order.balance_due = 0;
      } else if (Number(order.amount_paid) > 0) {
        order.payment_status = 'partially_paid';
      } else {
        order.payment_status = 'unpaid';
      }
    }
  }
});

// Instance methods
Order.prototype.isPaid = function() {
  return this.payment_status === 'paid';
};

Order.prototype.canBeModified = function() {
  return ['pending', 'completed'].includes(this.status);
};

Order.prototype.generateInvoiceNumber = function() {
  if (this.invoice_number) return this.invoice_number;
  
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = date.getTime().toString().slice(-6);
  
  return `INV${year}${month}-${timestamp}`;
};

// Static methods for querying
Order.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      transaction_date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      },
      status: {
        [sequelize.Sequelize.Op.ne]: 'cancelled'
      }
    }
  });
};

Order.getTotalRevenue = async function(startDate, endDate) {
  const result = await this.sum('total_amount', {
    where: {
      transaction_date: {
        [sequelize.Sequelize.Op.between]: [startDate, endDate]
      },
      status: 'completed'
    }
  });
  return result || 0;
};

// Associations will be defined in models/index.js
module.exports = Order; 