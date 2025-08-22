import Storage from '../utils/storage';
import { getApiBaseUrl } from '../config/api';
import { Reminder } from '../types/reminder';

interface UserData {
  name: string;
  age: string;
  gender: 'masculino' | 'feminino' | 'outro' | '';
}

interface BackupData {
  reminders: Reminder[];
  userData: UserData;
  settings: any;
  lastBackup: string;
}

class BackupService {
  private deviceId: string;
  private isOnline: boolean = false;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.checkConnectivity();
  }

  private generateDeviceId(): string {
    // Gerar ID único baseado em timestamp + random
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${random}`;
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD'
      });
      this.isOnline = response.ok;
    } catch {
      this.isOnline = false;
    }
  }

  // Salvar dados localmente (sempre)
  async saveLocal(data: Partial<BackupData>): Promise<void> {
    try {
      if (data.reminders) {
        await Storage.setItem('@TDAHService:reminders', data.reminders);
      }
      if (data.userData) {
        await Storage.setItem('@TDAHService:userData', data.userData);
      }
      if (data.settings) {
        await Storage.setItem('@TDAHService:settings', data.settings);
      }
      
      // Marcar timestamp do último backup local
      await Storage.setItem('@TDAHService:lastLocalBackup', new Date().toISOString());
      
      // Dados salvos localmente
    } catch (error) {
      // Erro silencioso
    }
  }

  // Fazer backup no servidor (quando possível)
  async backupToServer(): Promise<boolean> {
    try {
      await this.checkConnectivity();
      
      if (!this.isOnline) {
        return false;
      }

      const apiBaseUrl = await getApiBaseUrl();
      
      // Coletar todos os dados locais
      const reminders = await Storage.getItem('@TDAHService:reminders') || [];
      const userData = await Storage.getItem('@TDAHService:userData');
      const settings = await Storage.getItem('@TDAHService:settings');

      const backupData: BackupData = {
        reminders,
        userData,
        settings,
        lastBackup: new Date().toISOString()
      };

      // Enviar para servidor (endpoint anônimo)
      const response = await fetch(`${apiBaseUrl}/backup/anonymous`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Device-ID': this.deviceId
        },
        body: JSON.stringify(backupData)
      });

      if (response.ok) {
        await Storage.setItem('@TDAHService:lastServerBackup', new Date().toISOString());
        return true;
      } else {
        return false;
      }

    } catch (error) {
      return false;
    }
  }

  // Restaurar dados do servidor
  async restoreFromServer(): Promise<boolean> {
    try {
      await this.checkConnectivity();
      
      if (!this.isOnline) {
        return false;
      }

      const apiBaseUrl = await getApiBaseUrl();
      
      const response = await fetch(`${apiBaseUrl}/backup/anonymous/${this.deviceId}`, {
        headers: {
          'Device-ID': this.deviceId
        }
      });

      if (response.ok) {
        const backupData: BackupData = await response.json();
        
        // Restaurar dados locais
        if (backupData.reminders) {
          await Storage.setItem('@TDAHService:reminders', backupData.reminders);
        }
        if (backupData.userData) {
          await Storage.setItem('@TDAHService:userData', backupData.userData);
        }
        if (backupData.settings) {
          await Storage.setItem('@TDAHService:settings', backupData.settings);
        }

        return true;
      } else {
        return false;
      }

    } catch (error) {
      return false;
    }
  }

  // Backup automático (chamado periodicamente)
  async autoBackup(): Promise<void> {
    try {
      // Sempre salvar localmente primeiro
      const reminders = await Storage.getItem('@TDAHService:reminders');
      const userData = await Storage.getItem('@TDAHService:userData');
      const settings = await Storage.getItem('@TDAHService:settings');

      await this.saveLocal({ reminders, userData, settings });

      // Tentar backup no servidor
      await this.backupToServer();

    } catch (error) {
      // Erro silencioso
    }
  }

  // Verificar status do backup
  async getBackupStatus(): Promise<{
    lastLocalBackup: string | null;
    lastServerBackup: string | null;
    isOnline: boolean;
  }> {
    await this.checkConnectivity();
    
    const lastLocalBackup = await Storage.getItem('@TDAHService:lastLocalBackup');
    const lastServerBackup = await Storage.getItem('@TDAHService:lastServerBackup');

    return {
      lastLocalBackup,
      lastServerBackup,
      isOnline: this.isOnline
    };
  }

  // Limpar dados (reset completo)
  async clearAllData(): Promise<void> {
    try {
      // Limpar dados locais
      await Storage.removeItem('@TDAHService:reminders');
      await Storage.removeItem('@TDAHService:userData');
      await Storage.removeItem('@TDAHService:settings');
      await Storage.removeItem('@TDAHService:lastLocalBackup');
      await Storage.removeItem('@TDAHService:lastServerBackup');

      // Tentar limpar do servidor
      if (this.isOnline) {
        const apiBaseUrl = await getApiBaseUrl();
        await fetch(`${apiBaseUrl}/backup/anonymous/${this.deviceId}`, {
          method: 'DELETE',
          headers: {
            'Device-ID': this.deviceId
          }
        });
      }

      console.log('✅ Todos os dados foram limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }
}

export const backupService = new BackupService(); 