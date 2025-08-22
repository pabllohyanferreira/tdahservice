import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Storage from '../utils/storage';
import { Reminder } from '../types/reminder';
import { getApiBaseUrl } from '../config/api';
import { vibrationService } from "../services/VibrationService";
import { backupService } from "../services/BackupService";
import { alarmService } from "../services/AlarmService";

interface ReminderContextData {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  loadReminders: () => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  uploadLocalReminders: () => Promise<void>;
  syncWithServer: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextData>({} as ReminderContextData);

interface ReminderProviderProps {
  children: ReactNode;
  }

export function ReminderProvider({ children }: ReminderProviderProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const loadReminders = async () => {
    try {
      setIsLoading(true);
      
      // Tentar restaurar do servidor primeiro
      const restored = await backupService.restoreFromServer();
      
      // Carregar do armazenamento local
      const storedReminders = await Storage.getItem("@TDAHService:reminders");
      const remindersArray = Array.isArray(storedReminders) ? storedReminders : [];
      
      // Converter strings de data para objetos Date
      const mappedReminders = remindersArray.map((reminder: any) => ({
        ...reminder,
        dateTime: new Date(reminder.dateTime),
        createdAt: new Date(reminder.createdAt),
        updatedAt: new Date(reminder.updatedAt),
      }));
      
          setReminders(mappedReminders);
      
      // Dados carregados
      } catch (error) {
        setReminders([]);
      } finally {
        setIsLoading(false);
      }
    };

  const saveToLocal = async (newReminders: Reminder[]) => {
    try {
      await Storage.setItem("@TDAHService:reminders", newReminders);

      // Fazer backup automático
      await backupService.autoBackup();
      
    } catch (error) {
      // Erro silencioso
    }
  };

  const addReminder = async (reminderData: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      
      const newReminder: Reminder = {
          ...reminderData,
        id: generateId(),
        userId: 'local-user',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);
      await saveToLocal(updatedReminders);

      // Agendar alarme para o novo lembrete
      if (newReminder.dateTime && !newReminder.isCompleted) {
        await alarmService.scheduleAlarm(newReminder);
      }
      
      // Vibração de sucesso
      await vibrationService.vibrateOnReminderCreated();
      
      } catch (error) {
      console.error('❌ Erro ao adicionar lembrete:', error);
      } finally {
        setIsLoading(false);
      }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      setIsLoading(true);
      
      const updatedReminders = reminders.map(reminder =>
        reminder.id === id
          ? { ...reminder, ...updates, updatedAt: new Date() }
          : reminder
      );
      
      setReminders(updatedReminders);
      await saveToLocal(updatedReminders);

      // Atualizar alarme se necessário
      const updatedReminder = updatedReminders.find(r => r.id === id);
      if (updatedReminder) {
        if (updatedReminder.isCompleted || !updatedReminder.dateTime) {
          await alarmService.cancelAlarm(id);
        } else {
          await alarmService.scheduleAlarm(updatedReminder);
        }
      }
      
      // Vibração de sucesso
      await vibrationService.vibrateOnReminderCreated();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar lembrete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      setIsLoading(true);
      
      const updatedReminders = reminders.filter(reminder => reminder.id !== id);
      setReminders(updatedReminders);
      await saveToLocal(updatedReminders);
      
      // Cancelar alarme do lembrete deletado
      await alarmService.cancelAlarm(id);
      
      // Vibração de exclusão
      await vibrationService.vibrateOnReminderDeleted();
      
    } catch (error) {
      console.error('❌ Erro ao deletar lembrete:', error);
    } finally {
              setIsLoading(false);
            }
  };

  const toggleComplete = async (id: string) => {
    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const updatedReminders = reminders.map(r =>
        r.id === id
          ? { ...r, isCompleted: !r.isCompleted, updatedAt: new Date() }
          : r
      );
      
      setReminders(updatedReminders);
      await saveToLocal(updatedReminders);

      // Atualizar alarme baseado no status de conclusão
      const updatedReminder = updatedReminders.find(r => r.id === id);
      if (updatedReminder) {
        if (updatedReminder.isCompleted) {
          await alarmService.cancelAlarm(id);
        } else if (updatedReminder.dateTime) {
          await alarmService.scheduleAlarm(updatedReminder);
        }
      }
      
      // Vibração de conclusão
      await vibrationService.vibrateOnReminderCompleted();
      
    } catch (error) {
      console.error('❌ Erro ao alternar status do lembrete:', error);
    }
  };

  const uploadLocalReminders = async () => {
    // Função mantida para compatibilidade, mas agora faz backup
    console.log('📤 Fazendo backup dos lembretes...');
    await backupService.autoBackup();
  };

  const syncWithServer = async () => {
    try {
      console.log('🔄 Sincronizando com servidor...');
      await backupService.autoBackup();
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  // Efeito para agendar alarmes quando lembretes são carregados
  useEffect(() => {
    const scheduleAlarms = async () => {
      try {
        // Configurar permissões primeiro
        await alarmService.requestPermissions();

        // Agendar alarmes para todos os lembretes pendentes
        const pendingReminders = reminders.filter(r => !r.isCompleted && r.dateTime);
        await alarmService.scheduleAlarmsForReminders(pendingReminders);
        
        console.log(`🔔 ${pendingReminders.length} alarmes agendados`);
      } catch (error) {
        console.error('❌ Erro ao agendar alarmes:', error);
      }
    };

    if (reminders.length > 0) {
      scheduleAlarms();
      }
  }, [reminders]);

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        isLoading,
        addReminder,
        updateReminder,
        deleteReminder,
        loadReminders,
        toggleComplete,
        uploadLocalReminders,
        syncWithServer,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders deve ser usado dentro de ReminderProvider');
  }
  return context;
}
