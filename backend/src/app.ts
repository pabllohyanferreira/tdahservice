import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

import authRoutes from './routes/auth';
import reminderRoutes from './routes/reminders';
import adminRoutes from './routes/admin';
import backupRoutes from './routes/backup';
import logger from './utils/logger';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware de log de requisições HTTP (apenas erros)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      logger.error('HTTP %s %s %d %dms - IP: %s', req.method, req.originalUrl, res.statusCode, duration, req.ip);
    }
  });
  next();
});

// Middleware de tratamento de erros padronizado
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/backup', backupRoutes); // Rotas de backup anônimo

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'TDAH Service API - Backend funcionando!' });
});

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tdahservice';

mongoose.connect(MONGODB_URI)
  .then(() => logger.error('Conectado ao MongoDB'))
  .catch(err => {
    logger.error('Erro ao conectar ao MongoDB: %s', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.error(`Servidor rodando na porta ${PORT}`);
  });
}
export default app; 