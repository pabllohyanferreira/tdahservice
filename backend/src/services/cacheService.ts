import { createClient } from 'redis';
import logger from '../utils/logger';

class CacheService {
  private client: ReturnType<typeof createClient>;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('✅ Conectado ao Redis');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('❌ Desconectado do Redis');
      this.isConnected = false;
    });
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async get(key: string): Promise<any> {
    try {
      await this.connect();
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Erro ao buscar cache:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.connect();
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Erro ao definir cache:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.connect();
      await this.client.del(key);
    } catch (error) {
      logger.error('Erro ao deletar cache:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.connect();
      await this.client.flushAll();
    } catch (error) {
      logger.error('Erro ao limpar cache:', error);
    }
  }

  // Métodos específicos para lembretes
  async getReminders(userId: string, filters: any = {}): Promise<any> {
    const key = `reminders:${userId}:${JSON.stringify(filters)}`;
    return this.get(key);
  }

  async setReminders(userId: string, filters: any = {}, data: any): Promise<void> {
    const key = `reminders:${userId}:${JSON.stringify(filters)}`;
    await this.set(key, data, 300); // 5 minutos
  }

  async invalidateUserReminders(userId: string): Promise<void> {
    try {
      await this.connect();
      const keys = await this.client.keys(`reminders:${userId}:*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Erro ao invalidar cache de lembretes:', error);
    }
  }
}

export const cacheService = new CacheService();
export default cacheService; 