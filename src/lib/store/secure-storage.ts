/**
 * Secure Storage System - Replaces localStorage with encryption
 * Addresses security vulnerabilities in local storage usage
 */

import { encrypt, decrypt } from '../utils/encryption';

export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
  version: string;
}

export class SecureStorage {
  private encryptionKey: string;
  private keyPrefix: string = 'computerpos_';

  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || this.generateEncryptionKey();
  }

  /**
   * Store data securely with encryption
   */
  setItem<T>(key: string, data: T, expiryMinutes?: number): boolean {
    try {
      const storageItem: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : undefined,
        version: '1.0.0'
      };

      const encrypted = encrypt(JSON.stringify(storageItem), this.encryptionKey);
      sessionStorage.setItem(this.keyPrefix + key, encrypted);
      
      // Also backup to server if available
      this.backupToServer(key, storageItem);
      
      return true;
    } catch (error) {
      console.error('SecureStorage: Failed to store item', error);
      return false;
    }
  }

  /**
   * Retrieve data securely with decryption
   */
  getItem<T>(key: string): T | null {
    try {
      const encrypted = sessionStorage.getItem(this.keyPrefix + key);
      if (!encrypted) {
        return null;
      }

      const decrypted = decrypt(encrypted, this.encryptionKey);
      const storageItem: StorageItem<T> = JSON.parse(decrypted);

      // Check expiry
      if (storageItem.expiry && Date.now() > storageItem.expiry) {
        this.removeItem(key);
        return null;
      }

      return storageItem.data;
    } catch (error) {
      console.error('SecureStorage: Failed to retrieve item', error);
      this.removeItem(key); // Remove corrupted data
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    sessionStorage.removeItem(this.keyPrefix + key);
    this.removeFromServerBackup(key);
  }

  /**
   * Clear all storage items
   */
  clear(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.keyPrefix)) {
        sessionStorage.removeItem(key);
      }
    });
  }

  /**
   * Generate encryption key from user session
   */
  private generateEncryptionKey(): string {
    // Use a combination of factors to generate key
    const userAgent = navigator.userAgent;
    const timestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000)); // Changes daily
    const sessionId = Math.random().toString(36);
    
    return btoa(`${userAgent}_${timestamp}_${sessionId}`).substring(0, 32);
  }

  /**
   * Backup critical data to server
   */
  private async backupToServer<T>(key: string, data: StorageItem<T>): Promise<void> {
    try {
      // Only backup specific critical data types
      const criticalKeys = ['auth', 'cart', 'currentOrder'];
      if (!criticalKeys.some(criticalKey => key.includes(criticalKey))) {
        return;
      }

      await fetch('/api/storage/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          key,
          data: data.data,
          timestamp: data.timestamp
        })
      });
    } catch (error) {
      // Backup failure should not affect main functionality
      console.warn('Failed to backup to server:', error);
    }
  }

  /**
   * Remove from server backup
   */
  private async removeFromServerBackup(key: string): Promise<void> {
    try {
      await fetch(`/api/storage/backup/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });
    } catch (error) {
      console.warn('Failed to remove server backup:', error);
    }
  }

  /**
   * Get authentication token for server requests
   */
  private getAuthToken(): string | null {
    try {
      const authData = this.getItem<any>('auth');
      return authData?.token || null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

/**
 * Migration utility to move data from localStorage to SecureStorage
 */
export class StorageMigration {
  static migrateFromLocalStorage(secureStorage: SecureStorage): void {
    console.log('🔄 Migrating data from localStorage to SecureStorage...');
    
    const keysToMigrate = [
      'computerpos_auth',
      'posSales',
      'posHolds',
      'customerSegments',
      'customers'
    ];

    let migrated = 0;
    keysToMigrate.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const newKey = key.replace('computerpos_', '').replace('pos', '');
          secureStorage.setItem(newKey, parsed);
          localStorage.removeItem(key);
          migrated++;
        } catch (error) {
          console.error(`Failed to migrate ${key}:`, error);
        }
      }
    });

    console.log(`✅ Migrated ${migrated} items from localStorage`);
    
    if (migrated > 0) {
      console.log('⚠️  localStorage data has been migrated to secure storage');
      console.log('📱 Data is now encrypted and will expire on browser session end');
    }
  }
}

// Auto-migrate on first load
if (typeof window !== 'undefined') {
  StorageMigration.migrateFromLocalStorage(secureStorage);
}