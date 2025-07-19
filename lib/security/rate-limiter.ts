// ComputerPOS Pro - Advanced Rate Limiting & Security
// Optimized for Cloudflare free tier limits

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface SecurityConfig {
  enableCSRF: boolean;
  enableXSS: boolean;
  enableSQLInjection: boolean;
  maxRequestSize: number;
  allowedOrigins: string[];
}

export class CloudflareRateLimiter {
  private kv: KVNamespace;
  private config: RateLimitConfig;

  constructor(kv: KVNamespace, config: RateLimitConfig) {
    this.kv = kv;
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   */
  async checkRateLimit(request: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.generateKey(request);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current request count from KV
      const data = await this.kv.get(key);
      let requestCount = 0;
      let firstRequestTime = now;

      if (data) {
        const parsed = JSON.parse(data);
        requestCount = parsed.count;
        firstRequestTime = parsed.firstRequest;

        // Reset if window has expired
        if (firstRequestTime < windowStart) {
          requestCount = 0;
          firstRequestTime = now;
        }
      }

      // Check if limit exceeded
      if (requestCount >= this.config.maxRequests) {
        const resetTime = firstRequestTime + this.config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        };
      }

      // Increment counter
      requestCount++;
      await this.kv.put(key, JSON.stringify({
        count: requestCount,
        firstRequest: firstRequestTime
      }), {
        expirationTtl: Math.ceil(this.config.windowMs / 1000)
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - requestCount,
        resetTime: firstRequestTime + this.config.windowMs
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }
  }

  private generateKey(request: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }

    // Default: use IP address
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For') || 
               'unknown';
    
    return `rate_limit:${ip}`;
  }
}

/**
 * Advanced security middleware
 */
export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  /**
   * Validate and sanitize request
   */
  async validateRequest(request: Request): Promise<{
    valid: boolean;
    errors: string[];
    sanitizedBody?: any;
  }> {
    const errors: string[] = [];
    let sanitizedBody: any = null;

    try {
      // Check request size
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.config.maxRequestSize) {
        errors.push('Request too large');
      }

      // Check origin
      if (this.config.allowedOrigins.length > 0) {
        const origin = request.headers.get('origin');
        if (origin && !this.config.allowedOrigins.includes(origin)) {
          errors.push('Invalid origin');
        }
      }

      // Validate and sanitize body for POST/PUT requests
      if (request.method === 'POST' || request.method === 'PUT') {
        const body = await request.text();
        
        if (body) {
          // Check for SQL injection patterns
          if (this.config.enableSQLInjection && this.containsSQLInjection(body)) {
            errors.push('Potential SQL injection detected');
          }

          // Check for XSS patterns
          if (this.config.enableXSS && this.containsXSS(body)) {
            errors.push('Potential XSS detected');
          }

          // Parse and sanitize JSON
          try {
            const parsed = JSON.parse(body);
            sanitizedBody = this.sanitizeObject(parsed);
          } catch (e) {
            errors.push('Invalid JSON format');
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        sanitizedBody
      };

    } catch (error) {
      console.error('Security validation error:', error);
      return {
        valid: false,
        errors: ['Security validation failed']
      };
    }
  }

  /**
   * Generate security headers
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    };
  }

  private containsSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|\/\*|\*\/|;)/,
      /(\b(OR|AND)\b.*=.*)/i,
      /'.*(\bOR\b|\bAND\b).*'/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  private containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
}

/**
 * Performance monitoring for Cloudflare free tier
 */
export class PerformanceMonitor {
  private kv: KVNamespace;
  private metrics: Map<string, number> = new Map();

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(`${operation}_duration`, duration);
    };
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  /**
   * Get current metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Save metrics to KV for aggregation
   */
  async saveMetrics(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const key = `metrics:${Date.now()}`;
      
      await this.kv.put(key, JSON.stringify({
        timestamp,
        metrics: this.getMetrics()
      }), {
        expirationTtl: 86400 // 24 hours
      });

      // Clear local metrics
      this.metrics.clear();
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Get aggregated metrics from KV
   */
  async getAggregatedMetrics(hours: number = 24): Promise<any> {
    try {
      const keys = await this.kv.list({ prefix: 'metrics:' });
      const cutoff = Date.now() - (hours * 60 * 60 * 1000);
      
      const metrics: any[] = [];
      
      for (const key of keys.keys) {
        const timestamp = parseInt(key.name.split(':')[1]);
        if (timestamp > cutoff) {
          const data = await this.kv.get(key.name);
          if (data) {
            metrics.push(JSON.parse(data));
          }
        }
      }

      return this.aggregateMetrics(metrics);
    } catch (error) {
      console.error('Failed to get aggregated metrics:', error);
      return {};
    }
  }

  private aggregateMetrics(metrics: any[]): any {
    const aggregated: any = {
      totalRequests: metrics.length,
      averageResponseTime: 0,
      errorRate: 0,
      throughput: 0
    };

    if (metrics.length === 0) return aggregated;

    // Calculate averages
    const responseTimes = metrics
      .map(m => m.metrics.request_duration)
      .filter(t => t !== undefined);

    if (responseTimes.length > 0) {
      aggregated.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // Calculate error rate
    const errors = metrics.filter(m => m.metrics.error_count > 0).length;
    aggregated.errorRate = (errors / metrics.length) * 100;

    // Calculate throughput (requests per hour)
    const timeSpan = Math.max(1, (Date.now() - new Date(metrics[0].timestamp).getTime()) / (1000 * 60 * 60));
    aggregated.throughput = metrics.length / timeSpan;

    return aggregated;
  }
}

/**
 * Cloudflare-optimized caching strategy
 */
export class CloudflareCache {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Smart caching with TTL optimization
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.kv.get(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      
      // Check if data is still fresh
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        await this.kv.delete(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache with smart TTL
   */
  async set<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
    try {
      const cacheData = {
        data,
        createdAt: Date.now(),
        expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
      };

      await this.kv.put(key, JSON.stringify(cacheData), {
        expirationTtl: ttlSeconds
      });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Cache with automatic refresh
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds: number = 3600
  ): Promise<T> {
    let cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    
    return fresh;
  }

  /**
   * Batch operations to optimize KV usage
   */
  async batchGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};
    
    // KV doesn't support batch get, so we do sequential
    // In production, consider using Promise.all with rate limiting
    for (const key of keys) {
      results[key] = await this.get<T>(key);
    }
    
    return results;
  }
}

/**
 * Request optimization middleware
 */
export class RequestOptimizer {
  /**
   * Compress response if beneficial
   */
  static shouldCompress(response: Response): boolean {
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    
    // Only compress text-based content over 1KB
    return (
      (contentType.includes('application/json') || 
       contentType.includes('text/') || 
       contentType.includes('application/xml')) &&
      (!contentLength || parseInt(contentLength) > 1024)
    );
  }

  /**
   * Add performance headers
   */
  static addPerformanceHeaders(response: Response): Response {
    const headers = new Headers(response.headers);
    
    // Cache control for static assets
    if (response.headers.get('content-type')?.includes('image/') ||
        response.headers.get('content-type')?.includes('font/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Add timing headers
    headers.set('X-Response-Time', Date.now().toString());
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  /**
   * Optimize JSON responses
   */
  static optimizeJSON(data: any): string {
    // Remove null values and empty objects to reduce size
    const optimized = this.removeEmpty(data);
    return JSON.stringify(optimized);
  }

  private static removeEmpty(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeEmpty(item)).filter(item => item !== null);
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.removeEmpty(value);
        if (cleanedValue !== null && cleanedValue !== undefined && cleanedValue !== '') {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }
    
    return obj;
  }
}
