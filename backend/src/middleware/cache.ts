import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Apenas para GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return next();
      }

      const cacheKey = `api:${userId}:${req.originalUrl}`;
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        return res.json(cachedData);
      }

      // Interceptar a resposta para cachear
      const originalSend = res.json;
      res.json = function(data) {
        cacheService.set(cacheKey, data, ttl);
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      next();
    }
  };
};

export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (userId) {
        await cacheService.invalidateUserReminders(userId);
      }
      next();
    } catch (error) {
      next();
    }
  };
}; 