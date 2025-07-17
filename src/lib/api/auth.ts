import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export interface Session {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
);

export class AuthService {
  private static instance: AuthService;
  private users: Map<string, User & { password: string }> = new Map();
  private sessions: Map<string, Session> = new Map();
  private refreshTokens: Map<string, string> = new Map();

  private constructor() {
    this.initializeDefaultUsers();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeDefaultUsers() {
    const defaultUsers = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@computerpos.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin' as const,
        permissions: [
          'users.read', 'users.write', 'users.delete',
          'inventory.read', 'inventory.write', 'inventory.delete',
          'orders.read', 'orders.write', 'orders.delete',
          'reports.read', 'reports.write',
          'settings.read', 'settings.write',
          'pos.read', 'pos.write',
          'customers.read', 'customers.write', 'customers.delete',
          'staff.read', 'staff.write', 'staff.delete',
          'build.read', 'build.write'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@computerpos.com',
        password: bcrypt.hashSync('manager123', 10),
        role: 'manager' as const,
        permissions: [
          'inventory.read', 'inventory.write',
          'orders.read', 'orders.write',
          'reports.read',
          'pos.read', 'pos.write',
          'customers.read', 'customers.write',
          'staff.read',
          'build.read', 'build.write'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        username: 'staff',
        email: 'staff@computerpos.com',
        password: bcrypt.hashSync('staff123', 10),
        role: 'staff' as const,
        permissions: [
          'inventory.read',
          'orders.read', 'orders.write',
          'pos.read', 'pos.write',
          'customers.read', 'customers.write',
          'build.read', 'build.write'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.username, user);
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const user = this.users.get(credentials.username);
      
      if (!user) {
        return {
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa'
        };
      }

      const passwordValid = await bcrypt.compare(credentials.password, user.password);
      
      if (!passwordValid) {
        return {
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        };
      }

      const { password, ...userWithoutPassword } = user;
      userWithoutPassword.lastLogin = new Date();

      const token = await this.generateToken(userWithoutPassword);
      const refreshToken = await this.generateRefreshToken(userWithoutPassword);

      const session: Session = {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      this.sessions.set(token, session);
      this.refreshTokens.set(refreshToken, userWithoutPassword.id);

      return {
        success: true,
        user: userWithoutPassword,
        token,
        refreshToken,
        message: 'Đăng nhập thành công'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra trong quá trình đăng nhập'
      };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      const session = this.sessions.get(token);
      if (session) {
        this.sessions.delete(token);
        this.refreshTokens.delete(session.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const session = this.sessions.get(token);
      if (!session) {
        return null;
      }

      if (session.expiresAt < new Date()) {
        this.sessions.delete(token);
        return null;
      }

      const { payload } = await jwtVerify(token, JWT_SECRET);
      const user = this.users.get(payload.username as string);
      
      if (!user || !user.isActive) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const userId = this.refreshTokens.get(refreshToken);
      if (!userId) {
        return {
          success: false,
          message: 'Refresh token không hợp lệ'
        };
      }

      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa'
        };
      }

      const { password, ...userWithoutPassword } = user;
      const newToken = await this.generateToken(userWithoutPassword);
      const newRefreshToken = await this.generateRefreshToken(userWithoutPassword);

      // Remove old refresh token
      this.refreshTokens.delete(refreshToken);
      
      // Add new refresh token
      this.refreshTokens.set(newRefreshToken, userId);

      const session: Session = {
        user: userWithoutPassword,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      this.sessions.set(newToken, session);

      return {
        success: true,
        user: userWithoutPassword,
        token: newToken,
        refreshToken: newRefreshToken,
        message: 'Token đã được làm mới'
      };

    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi làm mới token'
      };
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        return false;
      }

      const passwordValid = await bcrypt.compare(oldPassword, user.password);
      if (!passwordValid) {
        return false;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      user.updatedAt = new Date();

      this.users.set(user.username, user);
      return true;

    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User | null> {
    try {
      if (this.users.has(userData.username)) {
        return null; // Username already exists
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.users.set(newUser.username, newUser);

      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;

    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        return null;
      }

      const updatedUser = {
        ...user,
        ...updateData,
        id: user.id, // Ensure ID doesn't change
        updatedAt: new Date()
      };

      this.users.set(user.username, updatedUser);

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;

    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        return false;
      }

      // Don't delete admin user
      if (user.role === 'admin') {
        return false;
      }

      this.users.delete(user.username);
      
      // Remove any active sessions
      for (const [token, session] of this.sessions.entries()) {
        if (session.user.id === userId) {
          this.sessions.delete(token);
          this.refreshTokens.delete(session.refreshToken);
        }
      }

      return true;

    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  getUserById(userId: string): User | null {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  hasPermission(user: User, permission: string): boolean {
    if (user.role === 'admin') {
      return true; // Admin has all permissions
    }

    return user.permissions.includes(permission);
  }

  private async generateToken(user: User): Promise<string> {
    return await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
  }

  private async generateRefreshToken(user: User): Promise<string> {
    return await new SignJWT({
      userId: user.id,
      type: 'refresh'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(REFRESH_SECRET);
  }

  // Session management
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }

  getSessionsByUserId(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(session => session.user.id === userId);
  }

  removeSessionsByUserId(userId: string): number {
    let removedCount = 0;
    for (const [token, session] of this.sessions.entries()) {
      if (session.user.id === userId) {
        this.sessions.delete(token);
        this.refreshTokens.delete(session.refreshToken);
        removedCount++;
      }
    }
    return removedCount;
  }

  cleanupExpiredSessions(): number {
    let cleanedCount = 0;
    const now = new Date();
    
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
        this.refreshTokens.delete(session.refreshToken);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Middleware helper
export function requireAuth(requiredPermission?: string) {
  return async (request: Request): Promise<{ user: User | null; authorized: boolean }> => {
    try {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return { user: null, authorized: false };
      }

      const user = await authService.verifyToken(token);
      if (!user) {
        return { user: null, authorized: false };
      }

      if (requiredPermission && !authService.hasPermission(user, requiredPermission)) {
        return { user, authorized: false };
      }

      return { user, authorized: true };

    } catch (error) {
      console.error('Auth middleware error:', error);
      return { user: null, authorized: false };
    }
  };
}

// Role-based permissions
export const PERMISSIONS = {
  // User management
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_DELETE: 'users.delete',
  
  // Inventory management
  INVENTORY_READ: 'inventory.read',
  INVENTORY_WRITE: 'inventory.write',
  INVENTORY_DELETE: 'inventory.delete',
  
  // Order management
  ORDERS_READ: 'orders.read',
  ORDERS_WRITE: 'orders.write',
  ORDERS_DELETE: 'orders.delete',
  
  // Reports
  REPORTS_READ: 'reports.read',
  REPORTS_WRITE: 'reports.write',
  
  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',
  
  // POS
  POS_READ: 'pos.read',
  POS_WRITE: 'pos.write',
  
  // Customers
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  CUSTOMERS_DELETE: 'customers.delete',
  
  // Staff
  STAFF_READ: 'staff.read',
  STAFF_WRITE: 'staff.write',
  STAFF_DELETE: 'staff.delete',
  
  // Build
  BUILD_READ: 'build.read',
  BUILD_WRITE: 'build.write'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];