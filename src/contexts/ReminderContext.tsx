import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// @ts-ignore
import Storage from '../utils/storage';
import { Reminder } from '../types/reminder';

// Configuração da API
const API_BASE_URL = 'http://localhost:3000/api';

interface ReminderContextData {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<boolean>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  loadReminders: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextData>({} as ReminderContextData);

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthToken = async () => {
    return await Storage.getItem('@TDAHService:token');
  };

  const loadReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        console.log('Token não encontrado, carregando lembretes locais');
        const storedReminders = await Storage.getItem('@TDAHService:reminders');
        if (storedReminders) {
          setReminders(storedReminders);
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/reminders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(data);
        // Salvar localmente como backup
        await Storage.setItem('@TDAHService:reminders', data);
      } else {
        console.error('Erro ao carregar lembretes do servidor');
        // Fallback para dados locais
        const storedReminders = await Storage.getItem('@TDAHService:reminders');
        if (storedReminders) {
          setReminders(storedReminders);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
      // Fallback para dados locais
      const storedReminders = await Storage.getItem('@TDAHService:reminders');
      if (storedReminders) {
        setReminders(storedReminders);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const addReminder = useCallback(async (reminderData: Omit<Reminder, 'id'>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        // Fallback para armazenamento local
        const newReminder: Reminder = {
          ...reminderData,
          id: Date.now().toString(),
        };
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        await Storage.setItem('@TDAHService:reminders', updatedReminders);
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reminderData)
      });

      if (response.ok) {
        const newReminder = await response.json();
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        await Storage.setItem('@TDAHService:reminders', updatedReminders);
        return true;
      } else {
        console.error('Erro ao criar lembrete no servidor');
        return false;
      }
    } catch (error) {
      console.error('Erro ao adicionar lembrete:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [reminders]);

  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        // Fallback para armazenamento local
        const updatedReminders = reminders.map(reminder =>
          reminder.id === id ? { ...reminder, ...updates } : reminder
        );
        setReminders(updatedReminders);
        await Storage.setItem('@TDAHService:reminders', updatedReminders);
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedReminder = await response.json();
        const updatedReminders = reminders.map(reminder =>
          reminder.id === id ? updatedReminder : reminder
        );
        setReminders(updatedReminders);
        await Storage.setItem('@TDAHService:reminders', updatedReminders);
        return true;
      } else {
        console.error('Erro ao atualizar lembrete no servidor');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [reminders]);

  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        // Fallback para armazenamento local
        const updatedReminders = reminders.filter(reminder => reminder.id !== id);
        setReminders(updatedReminders);
        await Storage.setItem('@TDAHService:reminders', updatedReminders);
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const updatedReminders = reminders.filter(reminder => reminder.id !== id);
        setReminders(updatedReminders);
        await Storage.setItem('@TDAHService:reminders', updatedReminders);
        return true;
      } else {
        console.error('Erro ao deletar lembrete no servidor');
        return false;
      }
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [reminders]);

  return (
    <ReminderContext.Provider value={{
      reminders,
      isLoading,
      addReminder,
      updateReminder,
      deleteReminder,
      loadReminders,
    }}>
      {children}
    </ReminderContext.Provider>
  );
}; 