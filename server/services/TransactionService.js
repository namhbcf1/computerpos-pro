const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const FinancialTransaction = require('../models/FinancialTransaction');
const SerialNumber = require('../models/SerialNumber');
const User = require('../models/User');

class TransactionService {
  /**
   * Create a new sale with proper transaction boundaries
   * @param {Object} orderData - Order data including customer, items, payment
   * @param {Object} options - Options including user data
   * @returns {Promise<Order>} - The created order
   */
  static async createSale(orderData, options = {}) {
    // Start a database transaction
    const transaction = await sequelize.transaction();
    
    try {
      const { 
        customer_id, 
        customer_name, 
        customer_phone,
        items,
        payment_method,
        amount_paid,
        notes,
        serials = [] // Array of serial numbers for serialized products
      } = orderData;
      
      // Calculate totals
      const calculatedTotals = await this.calculateOrderTotals(items);
      const { subtotal, tax_amount, total } = calculatedTotals;
      
      // Create order record
      const order = await Order.create({
        order_number: this.generateOrderNumber(),
        customer_id,
        customer_name,
        customer_phone,
        user_id: options.user_id || 1, // Default to admin if not provided
        total_amount: total,
        subtotal,
        tax_amount,
        payment_method,
        amount_paid,
        balance_due: Math.max(0, total - amount_paid),
        payment_status: this.determinePaymentStatus(total, amount_paid),
        notes,
        status: 'completed',
        transaction_date: new Date()
      }, { transaction });
      
      // Create order items and update inventory
      await this.processOrderItems(order.id, items, serials, transaction);
      
      // Record financial transaction
      await FinancialTransaction.create({
        type: 'income',
        category: 'Bán hàng',
        amount: total,
        description: `Đơn hàng #${order.order_number}`,
        payment_method: order.payment_method,
        transaction_date: order.transaction_date,
        user_id: order.user_id,
        customer_id: order.customer_id,
        reference_type: 'order',
        reference_id: order.id
      }, { transaction });
      
      // If customer exists, update their stats
      if (customer_id) {
        await Customer.increment('total_purchases', {
          by: 1,
          where: { id: customer_id },
          transaction
        });
        
        await Customer.increment('total_spent', {
          by: total,
          where: { id: customer_id },
          transaction
        });
      }
      
      // Commit the transaction
      await transaction.commit();
      
      // Return the complete order with items
      return this.getOrderWithDetails(order.id);
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      console.error('Error in createSale:', error);
      throw error;
    }
  }
  
  /**
   * Process order items and update inventory
   * @param {number} orderId - The order ID
   * @param {Array} items - Array of order items
   * @param {Array} serials - Array of serial numbers for serialized products
   * @param {Object} transaction - The database transaction
   */
  static async processOrderItems(orderId, items, serials, transaction) {
    for (const item of items) {
      // Create order item
      await OrderItem.create({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        tax_amount: item.tax_amount || 0,
        discount: item.discount || 0,
        total: item.total || (item.price * item.quantity)
      }, { transaction });
      
      // Get product details
      const product = await Product.findByPk(item.product_id, { transaction });
      
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      
      // Update product quantities
      if (product.track_inventory) {
        // For serialized products, we handle serials individually
        if (product.is_serialized) {
          const productSerials = serials.filter(s => s.product_id === item.product_id);
          
          if (productSerials.length !== item.quantity) {
            throw new Error(`Number of serial numbers (${productSerials.length}) does not match quantity (${item.quantity}) for product ${product.name}`);
          }
          
          // Update each serial number
          for (const serial of productSerials) {
            await SerialNumber.update({
              status: 'sold',
              order_id: orderId,
              customer_id: item.customer_id || null
            }, {
              where: { 
                serial_number: serial.serial_number,
                product_id: item.product_id,
                status: 'in_stock'
              },
              transaction
            });
          }
        } else {
          // For non-serialized products, just decrement the quantity
          await Product.decrement('quantity', {
            by: item.quantity,
            where: { 
              id: item.product_id,
              quantity: { [Op.gte]: item.quantity }
            },
            transaction
          });
        }
      }
      
      // Update last ordered date
      await Product.update(
        { last_ordered_at: new Date() },
        { where: { id: item.product_id }, transaction }
      );
    }
  }
  
  /**
   * Calculate order totals including tax
   * @param {Array} items - Array of order items
   * @returns {Object} - Object with subtotal, tax_amount, and total
   */
  static async calculateOrderTotals(items) {
    let subtotal = 0;
    let taxAmount = 0;
    
    for (const item of items) {
      // Get product for tax rate
      const product = await Product.findByPk(item.product_id);
      
      if (!product) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }
      
      // Calculate item subtotal
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      
      // Calculate tax based on Vietnam VAT rules
      const itemTax = (itemSubtotal * product.vat_rate) / 100;
      taxAmount += itemTax;
      
      // Add tax_amount to item for record keeping
      item.tax_amount = itemTax;
      item.total = itemSubtotal + itemTax;
    }
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat((subtotal + taxAmount).toFixed(2))
    };
  }
  
  /**
   * Determine payment status based on amount paid
   * @param {number} total - Order total
   * @param {number} amountPaid - Amount paid
   * @returns {string} - Payment status
   */
  static determinePaymentStatus(total, amountPaid) {
    if (amountPaid >= total) {
      return 'paid';
    } else if (amountPaid > 0) {
      return 'partially_paid';
    } else {
      return 'unpaid';
    }
  }
  
  /**
   * Generate a unique order number
   * @returns {string} - Order number
   */
  static generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }
  
  /**
   * Get an order with all its details
   * @param {number} orderId - The order ID
   * @returns {Promise<Order>} - The order with items and customer details
   */
  static async getOrderWithDetails(orderId) {
    return Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product'
            }
          ]
        },
        {
          model: Customer,
          as: 'customer'
        },
        {
          model: User,
          as: 'user'
        },
        {
          model: SerialNumber,
          as: 'serialNumbers'
        }
      ]
    });
  }
  
  /**
   * Process a return or exchange
   * @param {number} orderId - Original order ID
   * @param {Object} returnData - Return data including items and reason
   * @param {Object} options - Options including user data
   * @returns {Promise<Object>} - The processed return data
   */
  static async processReturn(orderId, returnData, options = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const originalOrder = await Order.findByPk(orderId, {
        include: [{ model: OrderItem, as: 'items' }],
        transaction
      });
      
      if (!originalOrder) {
        throw new Error(`Order #${orderId} not found`);
      }
      
      if (originalOrder.status === 'cancelled') {
        throw new Error(`Order #${orderId} is already cancelled`);
      }
      
      const { 
        return_items, // Items being returned
        return_reason,
        refund_method,
        refund_amount
      } = returnData;
      
      // Process each returned item
      let totalRefundAmount = 0;
      
      for (const item of return_items) {
        // Find the original order item
        const originalItem = originalOrder.items.find(
          oi => oi.product_id === item.product_id
        );
        
        if (!originalItem) {
          throw new Error(`Product ${item.product_id} was not in original order #${orderId}`);
        }
        
        if (item.quantity > originalItem.quantity) {
          throw new Error(`Cannot return more than originally purchased for product ${item.product_id}`);
        }
        
        // Return quantity to inventory
        const product = await Product.findByPk(item.product_id, { transaction });
        
        if (product.track_inventory) {
          if (product.is_serialized) {
            // Update serial numbers status
            for (const serial of item.serials || []) {
              await SerialNumber.update({
                status: 'returned',
                notes: `Returned from order #${orderId}: ${return_reason}`
              }, {
                where: { 
                  serial_number: serial,
                  order_id: orderId,
                  product_id: item.product_id,
                  status: 'sold'
                },
                transaction
              });
            }
          } else {
            // Increment regular inventory
            await Product.increment('quantity', {
              by: item.quantity,
              where: { id: item.product_id },
              transaction
            });
          }
        }
        
        // Calculate refund for this item
        const itemRefund = originalItem.price * item.quantity;
        totalRefundAmount += itemRefund;
      }
      
      // Create a financial transaction for the refund if needed
      if (refund_amount > 0) {
        await FinancialTransaction.create({
          type: 'expense',
          category: 'Hoàn tiền',
          amount: refund_amount,
          description: `Hoàn tiền đơn hàng #${originalOrder.order_number}: ${return_reason}`,
          payment_method: refund_method || originalOrder.payment_method,
          transaction_date: new Date(),
          user_id: options.user_id || originalOrder.user_id,
          customer_id: originalOrder.customer_id,
          reference_type: 'return',
          reference_id: orderId
        }, { transaction });
      }
      
      // Update original order status if all items returned
      const allItemsReturned = return_items.every(item => {
        const originalItem = originalOrder.items.find(oi => oi.product_id === item.product_id);
        return item.quantity === originalItem.quantity;
      });
      
      if (allItemsReturned) {
        await Order.update(
          { status: 'returned' },
          { where: { id: orderId }, transaction }
        );
      }
      
      await transaction.commit();
      
      return {
        original_order: originalOrder,
        returned_items: return_items,
        refund_amount,
        success: true
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error in processReturn:', error);
      throw error;
    }
  }
}

module.exports = TransactionService; 