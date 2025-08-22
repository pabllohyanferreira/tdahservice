import mongoose from 'mongoose';
import logger from '../utils/logger';

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

class MigrationService {
  private migrations: Migration[] = [];

  constructor() {
    this.registerMigrations();
  }

  private registerMigrations() {
    // Migração 1: Adicionar campos de soft delete
    this.migrations.push({
      version: 1,
      name: 'Add soft delete fields to reminders',
      up: async () => {
        const db = mongoose.connection.db;
        await db.collection('reminders').updateMany(
          { isDeleted: { $exists: false } },
          { $set: { isDeleted: false } }
        );
        logger.info('✅ Migração 1 executada: Campos de soft delete adicionados');
      },
      down: async () => {
        const db = mongoose.connection.db;
        await db.collection('reminders').updateMany(
          {},
          { $unset: { isDeleted: "", deletedAt: "", deletedBy: "" } }
        );
        logger.info('✅ Migração 1 revertida: Campos de soft delete removidos');
      }
    });

    // Migração 2: Criar índices otimizados
    this.migrations.push({
      version: 2,
      name: 'Create optimized indexes',
      up: async () => {
        const db = mongoose.connection.db;
        await db.collection('reminders').createIndex({ userId: 1, dateTime: 1 });
        await db.collection('reminders').createIndex({ userId: 1, status: 1 });
        await db.collection('reminders').createIndex({ userId: 1, priority: 1 });
        await db.collection('reminders').createIndex({ dateTime: 1, status: 1 });
        await db.collection('reminders').createIndex({ isDeleted: 1 });
        logger.info('✅ Migração 2 executada: Índices otimizados criados');
      },
      down: async () => {
        const db = mongoose.connection.db;
        await db.collection('reminders').dropIndex({ userId: 1, dateTime: 1 });
        await db.collection('reminders').dropIndex({ userId: 1, status: 1 });
        await db.collection('reminders').dropIndex({ userId: 1, priority: 1 });
        await db.collection('reminders').dropIndex({ dateTime: 1, status: 1 });
        await db.collection('reminders').dropIndex({ isDeleted: 1 });
        logger.info('✅ Migração 2 revertida: Índices removidos');
      }
    });
  }

  async getCurrentVersion(): Promise<number> {
    try {
      const db = mongoose.connection.db;
      const migrationDoc = await db.collection('migrations').findOne({}, { sort: { version: -1 } });
      return migrationDoc ? migrationDoc.version : 0;
    } catch (error) {
      return 0;
    }
  }

  async setVersion(version: number): Promise<void> {
    const db = mongoose.connection.db;
    await db.collection('migrations').insertOne({
      version,
      executedAt: new Date()
    });
  }

  async migrate(targetVersion?: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const target = targetVersion || Math.max(...this.migrations.map(m => m.version));

    logger.info(`🔄 Iniciando migrações: ${currentVersion} → ${target}`);

    if (target > currentVersion) {
      // Migrações para cima
      for (const migration of this.migrations) {
        if (migration.version > currentVersion && migration.version <= target) {
          logger.info(`📈 Executando migração ${migration.version}: ${migration.name}`);
          await migration.up();
          await this.setVersion(migration.version);
        }
      }
    } else if (target < currentVersion) {
      // Migrações para baixo
      const reverseMigrations = [...this.migrations].reverse();
      for (const migration of reverseMigrations) {
        if (migration.version <= currentVersion && migration.version > target) {
          logger.info(`📉 Revertendo migração ${migration.version}: ${migration.name}`);
          await migration.down();
          await this.setVersion(migration.version - 1);
        }
      }
    }

    logger.info('✅ Migrações concluídas');
  }

  async status(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    logger.info(`📊 Status das migrações:`);
    logger.info(`   Versão atual: ${currentVersion}`);
    logger.info(`   Total de migrações: ${this.migrations.length}`);
    
    for (const migration of this.migrations) {
      const status = migration.version <= currentVersion ? '✅' : '⏳';
      logger.info(`   ${status} ${migration.version}: ${migration.name}`);
    }
  }
}

export const migrationService = new MigrationService();
export default migrationService; 