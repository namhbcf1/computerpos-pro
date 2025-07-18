const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, Customer, sequelize } = require('../models');

// GET /api/orders - Lấy danh sách đơn hàng
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let whereClause = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'items'
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        total: orders.count,
        page: parseInt(page),
        totalPages: Math.ceil(orders.count / parseInt(limit))
      },
      message: 'Lấy danh sách đơn hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
});

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Lấy thông tin đơn hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng',
      error: error.message
    });
  }
});

// POST /api/orders - Tạo đơn hàng mới
router.post('/', async (req, res) => {
  // Use SERIALIZABLE isolation level to prevent race conditions
  const t = await sequelize.transaction({
    isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
  });
  
  try {
    const { customer_id, items, notes, total } = req.body;
    
    // Validate required fields
    if (!customer_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Vui lòng chọn khách hàng.' });
    }
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Đơn hàng phải có ít nhất 1 sản phẩm.' });
    }

    // Fetch customer details with row lock
    const customer = await Customer.findByPk(customer_id, {
      transaction: t,
      lock: t.LOCK.SHARE
    });
    if (!customer) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Khách hàng không hợp lệ.' });
    }

    // Tính tổng tiền và kiểm tra tồn kho với pessimistic locking
    let calculated_total_amount = 0;
    const orderItems = [];
    const lockedProducts = new Map(); // Track locked products

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        throw new Error('Thông tin sản phẩm trong đơn hàng không hợp lệ.');
      }

      const product = await Product.findByPk(item.product_id);
      if (!product) {
        throw new Error(`Không tìm thấy sản phẩm ID: ${item.product_id}`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Sản phẩm "${product.name}" không đủ số lượng. Tồn kho: ${product.quantity}, yêu cầu: ${item.quantity}`);
      }

      const subtotal = product.price * item.quantity;
      calculated_total_amount += subtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: subtotal
      });

      // Lock product for update to prevent race conditions
      const lockedProduct = await Product.findByPk(product.id, {
        transaction: t,
        lock: t.LOCK.UPDATE // Pessimistic lock
      });

      if (!lockedProduct) {
        throw new Error(`Sản phẩm ${product.name} không tồn tại.`);
      }

      // Double-check stock after locking
      if (lockedProduct.quantity < item.quantity) {
        throw new Error(`Sản phẩm ${lockedProduct.name} không đủ hàng. Tồn kho: ${lockedProduct.quantity}, yêu cầu: ${item.quantity}`);
      }

      // Atomic stock update
      const newQuantity = lockedProduct.quantity - item.quantity;
      await lockedProduct.update({ 
        quantity: newQuantity,
        updated_at: new Date()
      }, { 
        transaction: t,
        fields: ['quantity', 'updated_at'] // Only update specific fields
      });

      // Store locked product for potential rollback
      lockedProducts.set(product.id, {
        original_quantity: lockedProduct.quantity,
        new_quantity: newQuantity
      });
    }

    // Validate total amount (allow a small tolerance for floating point issues)
    if (Math.abs(calculated_total_amount - total) > 0.01) { // 0.01 is a small tolerance
      return res.status(400).json({ success: false, message: 'Tổng tiền đơn hàng không khớp với tính toán của hệ thống.' });
    }

    // Tạo số đơn hàng (add duplication check as per user request)
    const order_number = `DH${Date.now()}`;
    const existingOrder = await Order.findOne({ where: { order_number } }); // Check for duplication
    if (existingOrder) {
      return res.status(409).json({ success: false, message: `Mã đơn hàng ${order_number} đã tồn tại. Vui lòng thử lại.` });
    }

    // Tạo đơn hàng
    const order = await Order.create({
      order_number,
      customer_id, // Use customer_id
      customer_name: customer.name, // Get from fetched customer
      customer_phone: customer.phone, // Get from fetched customer
      total_amount: calculated_total_amount,
      status: 'completed',
      notes
    }, { transaction: t });

    // Tạo chi tiết đơn hàng
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item
      }, { transaction: t });
    }

    await t.commit();

    // Lấy đơn hàng với chi tiết
    const orderWithItems = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Customer } // Include Customer model to return customer info
      ]
    });

    res.status(201).json({
      success: true,
      data: orderWithItems,
      message: 'Tạo đơn hàng thành công'
    });
  } catch (error) {
    await t.rollback();
    // Improved error handling to return specific messages
    if (error.message.includes('Không tìm thấy sản phẩm ID:') ||
        error.message.includes('không đủ số lượng') ||
        error.message.includes('Thông tin sản phẩm trong đơn hàng không hợp lệ.')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng: ' + error.message, // More descriptive error
      error: error.message
    });
  }
});

// GET /api/orders/stats/summary - Thống kê tổng quan
router.get('/stats/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Doanh thu hôm nay
    const todayRevenue = await Order.sum('total_amount', {
      where: {
        created_at: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      }
    });

    // Số đơn hàng hôm nay
    const todayOrders = await Order.count({
      where: {
        created_at: {
          [require('sequelize').Op.gte]: today,
          [require('sequelize').Op.lt]: tomorrow
        }
      }
    });

    // Tổng doanh thu
    const totalRevenue = await Order.sum('total_amount');
    
    // Tổng số đơn hàng
    const totalOrders = await Order.count();

    // Số sản phẩm
    const totalProducts = await Product.count();

    res.json({
      success: true,
      data: {
        today_revenue: todayRevenue || 0,
        today_orders: todayOrders || 0,
        total_revenue: totalRevenue || 0,
        total_orders: totalOrders || 0,
        total_products: totalProducts || 0
      },
      message: 'Lấy thống kê thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
});

module.exports = router; 