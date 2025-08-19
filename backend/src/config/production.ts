import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Configurações de segurança para produção
export const productionConfig = {
  // Rate limiting mais rigoroso
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições por IP
    message: {
      error: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limiting específico para login
  loginRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas de login
    message: {
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Configurações de CORS para produção
  corsOptions: {
    origin: [
      'https://seu-app.expo.dev',
      'https://seu-dominio.com',
      'exp://localhost:19000', // Para desenvolvimento
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // Configurações de Helmet
  helmetConfig: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.expo.dev"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // Configurações de JWT
  jwtConfig: {
    expiresIn: '7d',
    issuer: 'tdahservice',
    audience: 'tdahservice-users',
  },

  // Configurações de MongoDB
  mongoConfig: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
  },

  // Configurações de logging
  loggingConfig: {
    level: 'info',
    format: 'json',
    timestamp: true,
  },
};

// Middleware de segurança adicional
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Remover headers que podem expor informações
  res.removeHeader('X-Powered-By');
  
  // Adicionar headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

// Middleware de validação de ambiente
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias não encontradas: ${missing.join(', ')}`);
  }

  // Validar JWT_SECRET
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres');
  }

  // Validar MongoDB URI
  if (!process.env.MONGODB_URI!.includes('mongodb')) {
    throw new Error('MONGODB_URI deve ser uma string de conexão MongoDB válida');
  }
};

// Configurações de monitoramento
export const monitoringConfig = {
  // Sentry (opcional)
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
  },

  // Health check
  healthCheck: {
    path: '/api/health',
    interval: 30000, // 30 segundos
  },

  // Métricas
  metrics: {
    enabled: true,
    path: '/api/metrics',
  },
}; 