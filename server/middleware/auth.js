const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sequelize } = require('../config/database');

// Get JWT secret from environment or use a secure default
const JWT_SECRET = process.env.JWT_SECRET || 'posystem_secure_jwt_secret_2024';
// Token expiration time (default: 24 hours)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
// Set refresh token expiration (default: 7 days)
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user
 * @param {Object} user - User data
 * @returns {Object} - Token data
 */
const generateToken = (user) => {
  // Create token payload (avoid including sensitive data)
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  
  // Generate access token
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  // Generate refresh token with longer expiration
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  
  return {
    token,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN
  };
};

/**
 * Authenticate user middleware using JWT
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findOne({ 
      where: { 
        id: decoded.id,
        is_active: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }
    
    // Add user data to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    // Add transaction to track user activity
    const transaction = await sequelize.transaction();
    req.transaction = transaction;
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to commit transaction on successful response
    res.end = async function(...args) {
      try {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          await transaction.commit();
        } else {
          await transaction.rollback();
        }
      } catch (error) {
        console.error('Error handling transaction:', error);
        await transaction.rollback();
      }
      
      // Call original end function
      return originalEnd.apply(this, args);
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn, vui lòng đăng nhập lại'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực người dùng'
    });
  }
};

/**
 * Check if user has required role(s)
 * @param {String|Array} roles - Required role(s)
 */
const checkRole = (roles) => {
  // Convert single role to array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng chưa được xác thực'
      });
    }
    
    if (allowedRoles.includes(req.user.role) || req.user.role === 'admin') {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này'
    });
  };
};

/**
 * Refresh user token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token không được cung cấp'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Find user
    const user = await User.findOne({ 
      where: { 
        id: decoded.id,
        is_active: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'
      });
    }
    
    // Generate new tokens
    const tokens = generateToken(user);
    
    res.json({
      success: true,
      message: 'Token đã được làm mới',
      data: tokens
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại'
      });
    }
    
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi làm mới token'
    });
  }
};

module.exports = {
  authenticate,
  checkRole,
  generateToken,
  refreshToken
}; 