import { Request, Response } from 'express';
import { BackupModel } from '../models/Backup';

interface BackupData {
  deviceId: string;
  reminders: any[];
  userData: {
    name: string;
    age: string;
    gender: 'masculino' | 'feminino' | 'outro' | '';
  };
  settings: any;
  lastBackup: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BackupController {
  // Criar backup anônimo
  async createAnonymousBackup(req: Request, res: Response) {
    try {
      const { reminders, userData, settings } = req.body;
      const deviceId = req.headers['device-id'] as string;

      if (!deviceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Device ID é obrigatório' 
        });
      }

      // Verificar se já existe backup para este device
      const existingBackup = await BackupModel.findOne({ deviceId });

      if (existingBackup) {
        // Atualizar backup existente
        existingBackup.reminders = reminders || [];
        existingBackup.userData = userData || {};
        existingBackup.settings = settings || {};
        existingBackup.lastBackup = new Date().toISOString();
        existingBackup.updatedAt = new Date();

        await existingBackup.save();

        return res.status(200).json({
          success: true,
          message: 'Backup atualizado com sucesso',
          data: existingBackup
        });
      } else {
        // Criar novo backup
        const newBackup = new BackupModel({
          deviceId,
          reminders: reminders || [],
          userData: userData || {},
          settings: settings || {},
          lastBackup: new Date().toISOString(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await newBackup.save();

        return res.status(201).json({
          success: true,
          message: 'Backup criado com sucesso',
          data: newBackup
        });
      }

    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Recuperar backup anônimo
  async getAnonymousBackup(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const headerDeviceId = req.headers['device-id'] as string;

      // Verificar se o device ID da URL corresponde ao header
      if (deviceId !== headerDeviceId) {
        return res.status(403).json({
          success: false,
          message: 'Device ID não autorizado'
        });
      }

      const backup = await BackupModel.findOne({ deviceId });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          reminders: backup.reminders,
          userData: backup.userData,
          settings: backup.settings,
          lastBackup: backup.lastBackup
        }
      });

    } catch (error) {
      console.error('Erro ao recuperar backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atualizar backup anônimo
  async updateAnonymousBackup(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const { reminders, userData, settings } = req.body;
      const headerDeviceId = req.headers['device-id'] as string;

      if (deviceId !== headerDeviceId) {
        return res.status(403).json({
          success: false,
          message: 'Device ID não autorizado'
        });
      }

      const backup = await BackupModel.findOne({ deviceId });

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: 'Backup não encontrado'
        });
      }

      // Atualizar dados
      if (reminders !== undefined) backup.reminders = reminders;
      if (userData !== undefined) backup.userData = userData;
      if (settings !== undefined) backup.settings = settings;
      
      backup.lastBackup = new Date().toISOString();
      backup.updatedAt = new Date();

      await backup.save();

      return res.status(200).json({
        success: true,
        message: 'Backup atualizado com sucesso',
        data: backup
      });

    } catch (error) {
      console.error('Erro ao atualizar backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Deletar backup anônimo
  async deleteAnonymousBackup(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const headerDeviceId = req.headers['device-id'] as string;

      if (deviceId !== headerDeviceId) {
        return res.status(403).json({
          success: false,
          message: 'Device ID não autorizado'
        });
      }

      const result = await BackupModel.deleteOne({ deviceId });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Backup não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Backup deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar todos os backups (para administração)
  async listAllBackups(req: Request, res: Response) {
    try {
      const backups = await BackupModel.find({}, {
        deviceId: 1,
        lastBackup: 1,
        createdAt: 1,
        updatedAt: 1,
        'userData.name': 1
      }).sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        data: backups
      });

    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
} 