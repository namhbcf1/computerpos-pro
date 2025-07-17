import { writable, derived, get } from 'svelte/store';
import { authService, type User, type LoginCredentials, type AuthResponse } from '../api/auth';

export interface UserState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
  sessionExpiresAt: Date | null;
}

const initialState: UserState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastActivity: null,
  sessionExpiresAt: null
};

function createUserStore() {
  const { subscribe, set, update } = writable<UserState>(initialState);

  // Load persisted state from localStorage
  function loadPersistedState() {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem('computerpos_auth');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          const sessionExpiresAt = parsed.sessionExpiresAt ? new Date(parsed.sessionExpiresAt) : null;
          const lastActivity = parsed.lastActivity ? new Date(parsed.lastActivity) : null;
          
          // Check if session is expired
          if (sessionExpiresAt && sessionExpiresAt > new Date()) {
            update(state => ({
              ...state,
              user: parsed.user,
              token: parsed.token,
              refreshToken: parsed.refreshToken,
              isAuthenticated: true,
              sessionExpiresAt,
              lastActivity
            }));
            return true;
          } else {
            // Clear expired session
            localStorage.removeItem('computerpos_auth');
          }
        }
      } catch (error) {
        console.error('Failed to load persisted auth state:', error);
        localStorage.removeItem('computerpos_auth');
      }
    }
    return false;
  }

  // Save state to localStorage
  function saveState(state: UserState) {
    if (typeof window !== 'undefined') {
      try {
        const stateToSave = {
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          sessionExpiresAt: state.sessionExpiresAt?.toISOString(),
          lastActivity: state.lastActivity?.toISOString()
        };
        localStorage.setItem('computerpos_auth', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save auth state:', error);
      }
    }
  }

  // Clear persisted state
  function clearPersistedState() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('computerpos_auth');
    }
  }

  // Login function
  async function login(credentials: LoginCredentials): Promise<boolean> {
    update(state => ({ ...state, isLoading: true, error: null }));

    try {
      const response: AuthResponse = await authService.login(credentials);
      
      if (response.success && response.user && response.token && response.refreshToken) {
        const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const lastActivity = new Date();
        
        const newState = {
          ...initialState,
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          sessionExpiresAt,
          lastActivity,
          isLoading: false
        };
        
        set(newState);
        saveState(newState);
        return true;
      } else {
        update(state => ({
          ...state,
          isLoading: false,
          error: response.message || 'Đăng nhập thất bại'
        }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      update(state => ({
        ...state,
        isLoading: false,
        error: 'Có lỗi xảy ra trong quá trình đăng nhập'
      }));
      return false;
    }
  }

  // Logout function
  async function logout(): Promise<void> {
    const currentState = get(userStore);
    
    if (currentState.token) {
      try {
        await authService.logout(currentState.token);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    set(initialState);
    clearPersistedState();
  }

  // Refresh token function
  async function refreshToken(): Promise<boolean> {
    const currentState = get(userStore);
    
    if (!currentState.refreshToken) {
      return false;
    }

    try {
      const response = await authService.refreshToken(currentState.refreshToken);
      
      if (response.success && response.user && response.token && response.refreshToken) {
        const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const lastActivity = new Date();
        
        const newState = {
          ...currentState,
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          sessionExpiresAt,
          lastActivity,
          error: null
        };
        
        set(newState);
        saveState(newState);
        return true;
      } else {
        // Refresh failed, logout
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  }

  // Check if user has permission
  function hasPermission(permission: string): boolean {
    const currentState = get(userStore);
    if (!currentState.user) return false;
    
    return authService.hasPermission(currentState.user, permission);
  }

  // Check if user has role
  function hasRole(role: string): boolean {
    const currentState = get(userStore);
    if (!currentState.user) return false;
    
    return currentState.user.role === role;
  }

  // Update last activity
  function updateActivity() {
    update(state => {
      const newState = {
        ...state,
        lastActivity: new Date()
      };
      saveState(newState);
      return newState;
    });
  }

  // Verify token and refresh if needed
  async function verifyAndRefresh(): Promise<boolean> {
    const currentState = get(userStore);
    
    if (!currentState.token) {
      return false;
    }

    try {
      const user = await authService.verifyToken(currentState.token);
      
      if (user) {
        updateActivity();
        return true;
      } else {
        // Token is invalid, try to refresh
        return await refreshToken();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return await refreshToken();
    }
  }

  // Initialize store
  function initialize() {
    const loaded = loadPersistedState();
    
    if (loaded) {
      // Verify token on initialization
      verifyAndRefresh().then(valid => {
        if (!valid) {
          logout();
        }
      });
    }
  }

  // Auto-refresh token before expiration
  function startAutoRefresh() {
    setInterval(async () => {
      const currentState = get(userStore);
      
      if (currentState.isAuthenticated && currentState.sessionExpiresAt) {
        const timeUntilExpiry = currentState.sessionExpiresAt.getTime() - Date.now();
        
        // Refresh if less than 5 minutes remaining
        if (timeUntilExpiry < 5 * 60 * 1000) {
          await refreshToken();
        }
      }
    }, 60000); // Check every minute
  }

  // Activity tracker
  function startActivityTracker() {
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        document.addEventListener(event, () => {
          const currentState = get(userStore);
          if (currentState.isAuthenticated) {
            updateActivity();
          }
        }, { passive: true });
      });
    }
  }

  // Session timeout checker
  function startSessionTimeoutChecker() {
    setInterval(() => {
      const currentState = get(userStore);
      
      if (currentState.isAuthenticated && currentState.lastActivity) {
        const timeSinceActivity = Date.now() - currentState.lastActivity.getTime();
        const sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
        
        if (timeSinceActivity > sessionTimeout) {
          logout();
        }
      }
    }, 60000); // Check every minute
  }

  // Initialize when store is created
  if (typeof window !== 'undefined') {
    initialize();
    startAutoRefresh();
    startActivityTracker();
    startSessionTimeoutChecker();
  }

  return {
    subscribe,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    verifyAndRefresh,
    updateActivity,
    initialize,
    
    // Getters
    get isAuthenticated() {
      return get(userStore).isAuthenticated;
    },
    
    get user() {
      return get(userStore).user;
    },
    
    get token() {
      return get(userStore).token;
    },
    
    get isLoading() {
      return get(userStore).isLoading;
    },
    
    get error() {
      return get(userStore).error;
    },
    
    // Clear error
    clearError: () => update(state => ({ ...state, error: null }))
  };
}

export const userStore = createUserStore();

// Derived stores for common checks
export const isAuthenticated = derived(userStore, $userStore => $userStore.isAuthenticated);
export const currentUser = derived(userStore, $userStore => $userStore.user);
export const userRole = derived(userStore, $userStore => $userStore.user?.role);
export const userPermissions = derived(userStore, $userStore => $userStore.user?.permissions || []);
export const isLoading = derived(userStore, $userStore => $userStore.isLoading);
export const authError = derived(userStore, $userStore => $userStore.error);

// Permission-based derived stores
export const canManageUsers = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'users.write') : false
);

export const canManageInventory = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'inventory.write') : false
);

export const canManageOrders = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'orders.write') : false
);

export const canViewReports = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'reports.read') : false
);

export const canManageSettings = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'settings.write') : false
);

export const canUsePOS = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'pos.write') : false
);

export const canManageCustomers = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'customers.write') : false
);

export const canManageStaff = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'staff.write') : false
);

export const canUseBuild = derived(userStore, $userStore => 
  $userStore.user ? authService.hasPermission($userStore.user, 'build.write') : false
);

// Role-based derived stores
export const isAdmin = derived(userStore, $userStore => 
  $userStore.user?.role === 'admin'
);

export const isManager = derived(userStore, $userStore => 
  $userStore.user?.role === 'manager'
);

export const isStaff = derived(userStore, $userStore => 
  $userStore.user?.role === 'staff'
);

// Utility functions for components
export function requireAuth() {
  const currentState = get(userStore);
  if (!currentState.isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
}

export function requirePermission(permission: string) {
  const currentState = get(userStore);
  if (!currentState.user || !authService.hasPermission(currentState.user, permission)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return false;
  }
  return true;
}

export function requireRole(role: string) {
  const currentState = get(userStore);
  if (!currentState.user || currentState.user.role !== role) {
    if (typeof window !== 'undefined') {
      window.location.href = '/unauthorized';
    }
    return false;
  }
  return true;
}

// Export the store as default for easier imports
export default userStore;