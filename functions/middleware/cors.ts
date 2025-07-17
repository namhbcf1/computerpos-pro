export interface CORSOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export class CORSMiddleware {
  private defaultOptions: CORSOptions = {
    allowedOrigins: [
      'https://computerpos.pages.dev',
      'https://*.computerpos.pages.dev',
      'http://localhost:3000',
      'http://localhost:4321'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  /**
   * Apply CORS headers to response
   */
  applyCORS(request: Request, response: Response, options?: CORSOptions): Response {
    const opts = { ...this.defaultOptions, ...options };
    const origin = request.headers.get('Origin');
    
    // Create new response with CORS headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    // Check if origin is allowed
    if (origin && this.isOriginAllowed(origin, opts.allowedOrigins!)) {
      newResponse.headers.set('Access-Control-Allow-Origin', origin);
    } else if (opts.allowedOrigins?.includes('*')) {
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
    }

    // Set other CORS headers
    newResponse.headers.set('Access-Control-Allow-Methods', opts.allowedMethods!.join(', '));
    newResponse.headers.set('Access-Control-Allow-Headers', opts.allowedHeaders!.join(', '));
    
    if (opts.exposedHeaders && opts.exposedHeaders.length > 0) {
      newResponse.headers.set('Access-Control-Expose-Headers', opts.exposedHeaders.join(', '));
    }

    if (opts.credentials) {
      newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (opts.maxAge) {
      newResponse.headers.set('Access-Control-Max-Age', opts.maxAge.toString());
    }

    return newResponse;
  }

  /**
   * Handle preflight OPTIONS requests
   */
  handlePreflight(request: Request, options?: CORSOptions): Response {
    const opts = { ...this.defaultOptions, ...options };
    const origin = request.headers.get('Origin');
    
    // Check if origin is allowed
    if (!origin || !this.isOriginAllowed(origin, opts.allowedOrigins!)) {
      return new Response(null, { status: 403 });
    }

    const response = new Response(null, { status: 204 });
    
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', opts.allowedMethods!.join(', '));
    response.headers.set('Access-Control-Allow-Headers', opts.allowedHeaders!.join(', '));
    
    if (opts.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (opts.maxAge) {
      response.headers.set('Access-Control-Max-Age', opts.maxAge.toString());
    }

    return response;
  }

  /**
   * Check if origin is allowed
   */
  private isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
    if (allowedOrigins.includes('*')) {
      return true;
    }

    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // Check wildcard patterns
    return allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return false;
    });
  }

  /**
   * Create a middleware function for CORS
   */
  createCORSMiddleware(options?: CORSOptions) {
    return (request: Request, response: Response) => {
      if (request.method === 'OPTIONS') {
        return this.handlePreflight(request, options);
      }
      return this.applyCORS(request, response, options);
    };
  }
}

// Export singleton instance
export const corsMiddleware = new CORSMiddleware();

// Environment-specific CORS configurations
export const CORS_CONFIGS = {
  development: {
    allowedOrigins: ['http://localhost:3000', 'http://localhost:4321', 'http://127.0.0.1:3000'],
    credentials: true
  },
  production: {
    allowedOrigins: [
      'https://computerpos.pages.dev',
      'https://*.computerpos.pages.dev'
    ],
    credentials: true
  },
  testing: {
    allowedOrigins: ['*'],
    credentials: false
  }
} as const;