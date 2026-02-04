/**
 * FCH Noticias - Security Middleware
 * Configuración de CORS, Rate Limiting, Helmet y Compression
 */

import type { Request, Response, NextFunction } from 'express';

// ============================================================================
// CONFIGURACIÓN CORS
// ============================================================================

interface CorsOptions {
  origin: string | string[] | ((origin: string) => boolean);
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

const defaultCorsOptions: CorsOptions = {
  origin: (origin: string) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return true;
    
    // Dominios permitidos
    const allowedDomains = [
      'localhost',
      'vercel.app',
      'fchnoticias.cl',
      'fch-noticias.vercel.app',
    ];
    
    return allowedDomains.some(domain => 
      origin.includes(domain)
    );
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  credentials: true,
  maxAge: 86400, // 24 horas
};

/**
 * Middleware CORS personalizado
 */
export function corsMiddleware(options: Partial<CorsOptions> = {}) {
  const opts = { ...defaultCorsOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin || '';
    
    // Verificar origen
    let isAllowed = false;
    if (typeof opts.origin === 'function') {
      isAllowed = opts.origin(origin);
    } else if (Array.isArray(opts.origin)) {
      isAllowed = opts.origin.includes(origin) || opts.origin.includes('*');
    } else {
      isAllowed = opts.origin === origin || opts.origin === '*';
    }

    // Set headers CORS
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', opts.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', opts.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Expose-Headers', opts.exposedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', opts.maxAge.toString());

    if (opts.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Manejar preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message: string;
  skipSuccessfulRequests: boolean;
}

const defaultRateLimitOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 100, // 100 requests por minuto
  message: 'Too many requests, please try again later',
  skipSuccessfulRequests: false,
};

// Store simple en memoria para rate limiting
// En producción, usar Redis
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Limpia entradas expiradas del store cada 5 minutos
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Middleware de Rate Limiting
 * Limita a 100 requests por minuto por IP
 */
export function rateLimitMiddleware(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...defaultRateLimitOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // Obtener IP del cliente
    const clientIp = 
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress ||
      'unknown';
    
    const key = `${clientIp}:${req.path}`;
    const now = Date.now();

    // Obtener o crear entrada
    let record = rateLimitStore.get(key);
    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + opts.windowMs,
      };
    }

    // Incrementar contador
    record.count++;
    rateLimitStore.set(key, record);

    // Set headers de rate limit
    res.setHeader('X-RateLimit-Limit', opts.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, opts.maxRequests - record.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    // Verificar límite
    if (record.count > opts.maxRequests) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString());
      res.status(429).json({
        error: 'Too Many Requests',
        message: opts.message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting estricto para rutas sensibles
 * 10 requests por minuto
 */
export function strictRateLimit() {
  return rateLimitMiddleware({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Too many requests to this endpoint',
  });
}

// ============================================================================
// HELMET (Security Headers)
// ============================================================================

interface HelmetOptions {
  contentSecurityPolicy: boolean;
  crossOriginEmbedderPolicy: boolean;
  crossOriginOpenerPolicy: boolean;
  crossOriginResourcePolicy: boolean;
  dnsPrefetchControl: boolean;
  frameguard: boolean;
  hidePoweredBy: boolean;
  hsts: boolean;
  ieNoOpen: boolean;
  noSniff: boolean;
  originAgentCluster: boolean;
  permittedCrossDomainPolicies: boolean;
  referrerPolicy: boolean;
  xssFilter: boolean;
}

const defaultHelmetOptions: HelmetOptions = {
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
};

/**
 * Middleware de seguridad tipo Helmet
 */
export function helmetMiddleware(options: Partial<HelmetOptions> = {}) {
  const opts = { ...defaultHelmetOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // Content Security Policy
    if (opts.contentSecurityPolicy) {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
      );
    }

    // Cross Origin policies
    if (opts.crossOriginEmbedderPolicy) {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    }
    if (opts.crossOriginOpenerPolicy) {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    }
    if (opts.crossOriginResourcePolicy) {
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    }

    // DNS Prefetch Control
    if (opts.dnsPrefetchControl) {
      res.setHeader('X-DNS-Prefetch-Control', 'off');
    }

    // Frameguard (Clickjacking protection)
    if (opts.frameguard) {
      res.setHeader('X-Frame-Options', 'DENY');
    }

    // Hide Powered By
    if (opts.hidePoweredBy) {
      res.removeHeader('X-Powered-By');
    }

    // HSTS (HTTPS Strict Transport Security)
    if (opts.hsts) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=15552000; includeSubDomains; preload'
      );
    }

    // IE No Open
    if (opts.ieNoOpen) {
      res.setHeader('X-Download-Options', 'noopen');
    }

    // No Sniff
    if (opts.noSniff) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // Origin Agent Cluster
    if (opts.originAgentCluster) {
      res.setHeader('Origin-Agent-Cluster', '?1');
    }

    // Permitted Cross Domain Policies
    if (opts.permittedCrossDomainPolicies) {
      res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    }

    // Referrer Policy
    if (opts.referrerPolicy) {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // XSS Filter
    if (opts.xssFilter) {
      res.setHeader('X-XSS-Protection', '0'); // Deshabilitado, CSP es más efectivo
    }

    next();
  };
}

// ============================================================================
// COMPRESSION (gzip)
// ============================================================================

interface CompressionOptions {
  filter: (req: Request, res: Response) => boolean;
  threshold: number;
}

const defaultCompressionOptions: CompressionOptions = {
  filter: (req, res) => {
    // No comprimir si el cliente no lo acepta
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (!acceptEncoding.includes('gzip')) {
      return false;
    }

    // No comprimir respuestas pequeñas
    const contentLength = parseInt(res.getHeader('content-length') as string || '0');
    if (contentLength < 1024) {
      return false;
    }

    return true;
  },
  threshold: 1024, // 1KB
};

/**
 * Middleware de compresión gzip simple
 * Nota: En producción, usar middleware nativo de Express
 */
export function compressionMiddleware(options: Partial<CompressionOptions> = {}) {
  const opts = { ...defaultCompressionOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // Verificar si debemos comprimir
    if (!opts.filter(req, res)) {
      next();
      return;
    }

    // Marcar que aceptamos compresión
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');

    next();
  };
}

// ============================================================================
// REQUEST LOGGER
// ============================================================================

/**
 * Middleware simple de logging de requests
 */
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const method = req.method;
      const url = req.url;
      const status = res.statusCode;
      
      console.log(`${method} ${url} ${status} - ${duration}ms`);
    });

    next();
  };
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Middleware de manejo de errores
 */
export function errorHandler() {
  return (err: ApiError, req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';

    res.status(statusCode).json({
      error: {
        code,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  };
}

// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler() {
  return (req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.url} not found`,
      },
    });
  };
}

// ============================================================================
// EXPORT ALL MIDDLEWARE
// ============================================================================

export const securityMiddleware = {
  cors: corsMiddleware,
  rateLimit: rateLimitMiddleware,
  strictRateLimit,
  helmet: helmetMiddleware,
  compression: compressionMiddleware,
  requestLogger,
  errorHandler,
  notFound: notFoundHandler,
};

export default securityMiddleware;
