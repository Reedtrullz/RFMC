import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express, { Express } from 'express';

/**
 * Configure production security headers and request limits
 */
export function configureSecurity(app: Express) {
  // Disable X-Powered-By to hide Express
  app.disable('x-powered-by');

  // Use Helmet for secure headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'", 'ws:', 'wss:', 'https://www.simbrief.com'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      frameguard: {
        action: 'deny',
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Global rate limiting for all HTTP endpoints (except health checks)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: 'Too many requests, please try again later.' },
    skip: (req) => req.path === '/health',
  });

  app.use(limiter);

  // Body limits to prevent large payloads
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
}
