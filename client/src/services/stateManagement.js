import axios from 'axios';
import { createContext, useState, useEffect, useContext } from 'react';

// Base API URL from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://pos-backend.bangachieu2.workers.dev/api';

/**
 * Create a secure storage wrapper with encryption for sensitive data
 */
class SecureStorage {
  // Simple encryption for data (production would use stronger encryption)
  static encrypt(data, secretKey = 'posSecretKey2024') {
    try {
      if (typeof data !== 'string') {
        data = JSON.stringify(data);
      }
      // This is a simple encryption and should be replaced with a stronger algorithm in production
      return btoa(data);
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  // Decrypt data
  static decrypt(data, secretKey = 'posSecretKey2024') {
    try {
      const decrypted = atob(data);
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  // Save data with optional expiration
  static save(key, data, expireMinutes = null) {
    try {
      const item = {
        data,
        timestamp: new Date().getTime(),
      };

      if (expireMinutes) {
        item.expiry = new Date().getTime() + (expireMinutes * 60 * 1000);
      }

      localStorage.setItem(key, this.encrypt(item));
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }

  // Get data with expiration check
  static get(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      const item = this.decrypt(value);
      
      // Check if item has expired
      if (item.expiry && new Date().getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Get error:', error);
      return null;
    }
  }

  // Remove item
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Remove error:', error);
      return false;
    }
  }

  // Clear all items
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Clear error:', error);
      return false;
    }
  }
}

/**
 * Create API client for syncing state with server
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = SecureStorage.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Create a Cart service with server synchronization
 */
class CartService {
  static CART_KEY = 'pos_cart';
  static PENDING_SYNC_KEY = 'pos_cart_pending_sync';

  // Get current cart from storage or initialize new one
  static getCart() {
    const cart = SecureStorage.get(this.CART_KEY) || {
      items: [],
      customer: null,
      discount: 0,
      notes: '',
      updated_at: new Date().toISOString(),
    };
    return cart;
  }

  // Save cart to storage and queue for sync
  static saveCart(cart) {
    cart.updated_at = new Date().toISOString();
    SecureStorage.save(this.CART_KEY, cart);
    this.queueForSync(cart);
    return cart;
  }

  // Queue cart for server sync
  static queueForSync(cart) {
    SecureStorage.save(this.PENDING_SYNC_KEY, true);
    
    // Attempt to sync immediately if online
    if (navigator.onLine) {
      this.syncWithServer(cart).catch(err => {
        console.warn('Failed to sync cart with server:', err);
      });
    }
  }

  // Sync cart with server
  static async syncWithServer(cart) {
    try {
      // Only attempt sync if authenticated
      const token = SecureStorage.get('auth_token');
      if (!token) return false;

      await apiClient.post('/cart/sync', { cart });
      SecureStorage.remove(this.PENDING_SYNC_KEY);
      return true;
    } catch (error) {
      console.error('Cart sync error:', error);
      return false;
    }
  }

  // Add item to cart
  static addItem(item, quantity = 1) {
    const cart = this.getCart();
    
    // Check if item exists in cart
    const existingItem = cart.items.find(i => i.product_id === item.product_id);
    
    if (existingItem) {
      // Update existing item quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        subtotal: item.price * quantity
      });
    }
    
    return this.saveCart(cart);
  }

  // Remove item from cart
  static removeItem(productId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.product_id !== productId);
    return this.saveCart(cart);
  }

  // Update item quantity
  static updateItemQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.items.find(i => i.product_id === productId);
    
    if (item) {
      item.quantity = quantity;
      item.subtotal = item.price * quantity;
    }
    
    return this.saveCart(cart);
  }

  // Set customer for cart
  static setCustomer(customer) {
    const cart = this.getCart();
    cart.customer = customer;
    return this.saveCart(cart);
  }

  // Clear cart
  static clearCart() {
    return this.saveCart({
      items: [],
      customer: null,
      discount: 0,
      notes: '',
      updated_at: new Date().toISOString(),
    });
  }
}

/**
 * Create AuthService for handling authentication
 */
class AuthService {
  // Token keys
  static ACCESS_TOKEN_KEY = 'auth_token';
  static REFRESH_TOKEN_KEY = 'auth_refresh_token';
  static USER_DATA_KEY = 'auth_user';

  // Login user
  static async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data.data;
      
      // Save tokens and user data
      SecureStorage.save(this.ACCESS_TOKEN_KEY, token);
      SecureStorage.save(this.REFRESH_TOKEN_KEY, refreshToken);
      SecureStorage.save(this.USER_DATA_KEY, user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user
  static getCurrentUser() {
    return SecureStorage.get(this.USER_DATA_KEY);
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!SecureStorage.get(this.ACCESS_TOKEN_KEY);
  }

  // Logout user
  static logout() {
    SecureStorage.remove(this.ACCESS_TOKEN_KEY);
    SecureStorage.remove(this.REFRESH_TOKEN_KEY);
    SecureStorage.remove(this.USER_DATA_KEY);
  }

  // Refresh token
  static async refreshToken() {
    try {
      const refreshToken = SecureStorage.get(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/auth/refresh-token', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data.data;
      
      SecureStorage.save(this.ACCESS_TOKEN_KEY, token);
      SecureStorage.save(this.REFRESH_TOKEN_KEY, newRefreshToken);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  }
}

/**
 * Create offline-capable state sync service
 */
class OfflineSyncService {
  static PENDING_ACTIONS_KEY = 'pos_pending_actions';

  // Queue an action for sync
  static queueAction(action) {
    const pendingActions = this.getPendingActions();
    pendingActions.push({
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    
    SecureStorage.save(this.PENDING_ACTIONS_KEY, pendingActions);
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncPendingActions().catch(console.error);
    }
  }

  // Get pending actions
  static getPendingActions() {
    return SecureStorage.get(this.PENDING_ACTIONS_KEY) || [];
  }

  // Process all pending actions
  static async syncPendingActions() {
    // Only attempt if online and authenticated
    if (!navigator.onLine || !AuthService.isAuthenticated()) {
      return false;
    }
    
    const pendingActions = this.getPendingActions();
    if (!pendingActions.length) return true;
    
    const successfulActions = [];
    
    for (const action of pendingActions) {
      try {
        // Process different action types
        switch (action.type) {
          case 'create_order':
            await apiClient.post('/orders', action.data);
            break;
          case 'update_inventory':
            await apiClient.put(`/products/${action.data.id}`, action.data);
            break;
          case 'create_customer':
            await apiClient.post('/customers', action.data);
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
        
        // Mark action as successful
        successfulActions.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.type}:`, error);
      }
    }
    
    // Remove successful actions
    const remainingActions = pendingActions.filter(
      action => !successfulActions.includes(action.id)
    );
    
    SecureStorage.save(this.PENDING_ACTIONS_KEY, remainingActions);
    return remainingActions.length === 0;
  }

  // Listen for online status changes to sync
  static initSyncListener() {
    window.addEventListener('online', () => {
      this.syncPendingActions().catch(console.error);
      CartService.syncWithServer(CartService.getCart()).catch(console.error);
    });
  }
}

// Initialize the sync listener
OfflineSyncService.initSyncListener();

// Export all services
export {
  SecureStorage,
  CartService,
  AuthService,
  OfflineSyncService,
  apiClient
}; 