import mongoose from 'mongoose';
import logger from '../utils/logger';

interface DatabaseMetrics {
  totalReminders: number;
  totalUsers: number;
  pendingReminders: number;
  completedReminders: number;
  overdueReminders: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

class MonitoringService {
  private metrics: DatabaseMetrics = {
    totalReminders: 0,
    totalUsers: 0,
    pendingReminders: 0,
    completedReminders: 0,
    overdueReminders: 0,
    averageResponseTime: 0,
    cacheHitRate: 0
  };

  private responseTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;

  async collectMetrics(): Promise<DatabaseMetrics> {
    try {
      const db = mongoose.connection.db;
      
      // Métricas de lembretes
      this.metrics.totalReminders = await db.collection('reminders').countDocuments({ isDeleted: { $ne: true } });
      this.metrics.pendingReminders = await db.collection('reminders').countDocuments({ 
        status: 'pending', 
        isDeleted: { $ne: true } 
      });
      this.metrics.completedReminders = await db.collection('reminders').countDocuments({ 
        status: 'completed', 
        isDeleted: { $ne: true } 
      });
      this.metrics.overdueReminders = await db.collection('reminders').countDocuments({ 
        status: 'overdue', 
        isDeleted: { $ne: true } 
      });

      // Métricas de usuários
      this.metrics.totalUsers = await db.collection('users').countDocuments();

      // Métricas de performance
      this.metrics.averageResponseTime = this.responseTimes.length > 0 
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
        : 0;

      // Métricas de cache
      const totalCacheRequests = this.cacheHits + this.cacheMisses;
      this.metrics.cacheHitRate = totalCacheRequests > 0 
        ? (this.cacheHits / totalCacheRequests) * 100 
        : 0;

      return this.metrics;
    } catch (error) {
      logger.error('Erro ao coletar métricas:', error);
      return this.metrics;
    }
  }

  recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    // Manter apenas os últimos 100 tempos
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
  }

  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  async getDatabaseHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    message: string;
    details: any;
  }> {
    try {
      const metrics = await this.collectMetrics();
      
      // Verificar saúde do banco
      const db = mongoose.connection.db;
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      const health = {
        status: 'healthy' as const,
        message: 'Database is healthy',
        details: {
          metrics,
          connections: serverStatus.connections,
          uptime: serverStatus.uptime,
          version: serverStatus.version
        }
      };

      // Verificar warnings
      if (metrics.overdueReminders > 100) {
        health.status = 'warning';
        health.message = 'High number of overdue reminders';
      }

      if (metrics.averageResponseTime > 1000) {
        health.status = 'warning';
        health.message = 'High average response time';
      }

      if (metrics.cacheHitRate < 50) {
        health.status = 'warning';
        health.message = 'Low cache hit rate';
      }

      return health;
    } catch (error) {
      logger.error('Erro ao verificar saúde do banco:', error);
      return {
        status: 'critical',
        message: 'Database health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  async logMetrics(): Promise<void> {
    const metrics = await this.collectMetrics();
    logger.info('📊 Métricas do Banco de Dados:', {
      totalReminders: metrics.totalReminders,
      totalUsers: metrics.totalUsers,
      pendingReminders: metrics.pendingReminders,
      completedReminders: metrics.completedReminders,
      overdueReminders: metrics.overdueReminders,
      averageResponseTime: `${metrics.averageResponseTime.toFixed(2)}ms`,
      cacheHitRate: `${metrics.cacheHitRate.toFixed(2)}%`
    });
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService; 