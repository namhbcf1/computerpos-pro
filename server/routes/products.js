const express = require('express');
const router = express.Router();
const { Product } = require('../models');

// GET /api/products - Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let whereClause = {};
    
    if (search) {
      whereClause = {
        [require('sequelize').Op.or]: [
          { name: { [require('sequelize').Op.like]: `%${search}%` } },
          { sku: { [require('sequelize').Op.like]: `%${search}%` } },
          { barcode: { [require('sequelize').Op.like]: `%${search}%` } }
        ]
      };
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: products,
      message: 'Lấy danh sách sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
});

// GET /api/products/:id - Lấy thông tin sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Lấy thông tin sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm',
      error: error.message
    });
  }
});

// POST /api/products - Tạo sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const { name, sku, barcode, price, quantity, category, description } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm và giá là bắt buộc'
      });
    }

    const product = await Product.create({
      name,
      sku,
      barcode,
      price,
      quantity: quantity || 0,
      category: category || 'General',
      description
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Tạo sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const { name, sku, barcode, price, quantity, category, description } = req.body;
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    await product.update({
      name: name || product.name,
      sku: sku || product.sku,
      barcode: barcode || product.barcode,
      price: price !== undefined ? price : product.price,
      quantity: quantity !== undefined ? quantity : product.quantity,
      category: category || product.category,
      description: description !== undefined ? description : product.description
    });

    res.json({
      success: true,
      data: product,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
});

module.exports = router; 