import { AuthService } from '../../src/lib/api/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
  };
}

export interface AuthMiddlewareOptions {
  requiredPermissions?: string[];
  optional?: boolean;
}

export class AuthMiddleware {
  private authService = AuthService.getInstance();

  /**
   * Middleware to authenticate requests and extract user information
   */
  async authenticate(
    request: AuthenticatedRequest,
    options: AuthMiddlewareOptions = {}
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader) {
        if (options.optional) {
          return { success: true };
        }
        return { success: false, error: 'Authorization header missing' };
      }

      if (!authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Invalid authorization format' };
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify token
      const verificationResult = await this.authService.verifyToken(token);
      
      if (!verificationResult.valid || !verificationResult.user) {
        return { success: false, error: 'Invalid or expired token' };
      }

      const user = verificationResult.user;

      // Check if user is active
      if (!user.isActive) {
        return { success: false, error: 'Account deactivated' };
      }

      // Check required permissions
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const hasRequiredPermissions = options.requiredPermissions.every(
          permission => user.permissions.includes(permission)
        );

        if (!hasRequiredPermissions) {
          return { 
            success: false, 
            error: 'Insufficient permissions',
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              permissions: user.permissions
            }
          };
        }
      }

      // Add user to request object
      request.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      };

      return { 
        success: true, 
        user: request.user 
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Create a middleware function for specific permissions
   */
  createPermissionMiddleware(requiredPermissions: string[]) {
    return async (request: AuthenticatedRequest) => {
      return this.authenticate(request, { requiredPermissions });
    };
  }

  /**
   * Create response for authentication errors
   */
  createAuthErrorResponse(error: string, status: number = 401): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: error,
        timestamp: new Date().toISOString()
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="ComputerPOS Pro"'
        }
      }
    );
  }
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();

// Common permission sets
export const PERMISSIONS = {
  ADMIN: ['users.read', 'users.write', 'users.delete', 'settings.write'],
  MANAGER: ['inventory.read', 'inventory.write', 'orders.read', 'orders.write'],
  STAFF: ['inventory.read', 'orders.read', 'orders.write', 'pos.read', 'pos.write'],
  CUSTOMER_SERVICE: ['customers.read', 'customers.write', 'orders.read']
} as const;