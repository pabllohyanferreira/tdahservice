import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Storage from '../utils/storage';
import { Reminder, CreateReminderData } from '../types/reminder';
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface ReminderContextData {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (reminder: CreateReminderData) => Promise<boolean>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  toggleReminder: (id: string) => Promise<boolean>;
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

  // Carrega lembretes do backend ou local
  useEffect(() => {
    const fetchReminders = async () => {
      setIsLoading(true);
      try {
        const token = await Storage.getItem('@TDAHService:token');
        if (!token) {
          const storedReminders = await Storage.getItem('@TDAHService:reminders');
          setReminders(Array.isArray(storedReminders) ? storedReminders : []);
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
          const remindersArray = Array.isArray(data)
            ? data
            : (Array.isArray(data.reminders) ? data.reminders : []);
          const mappedReminders = remindersArray.map((reminder: any) => {
            let dateTime;
            if (!reminder.dateTime || isNaN(new Date(reminder.dateTime).getTime())) {
              dateTime = new Date();
            } else {
              dateTime = reminder.dateTime instanceof Date
                ? reminder.dateTime
                : new Date(reminder.dateTime);
            }
            return {
              id: reminder._id || reminder.id || Math.random().toString(36).substr(2, 9),
              title: reminder.title,
              description: reminder.description || '',
              dateTime,
              isCompleted: reminder.status === 'completed' || reminder.isCompleted || false,
              userId: reminder.userId,
              createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
              updatedAt: reminder.updatedAt ? new Date(reminder.updatedAt) : new Date(),
            };
          });
          setReminders(mappedReminders);
          await Storage.setItem('@TDAHService:reminders', mappedReminders);
        } else {
          setReminders([]);
        }
      } catch (error) {
        setReminders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReminders();
  }, []);

  // Adiciona lembrete
  const addReminder = useCallback(async (reminderData: CreateReminderData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await Storage.getItem('@TDAHService:token');
      if (!token) {
        const newReminder: Reminder = {
          ...reminderData,
          id: Date.now().toString(),
        };
        setReminders(prev => [...prev, newReminder]);
        await Storage.setItem('@TDAHService:reminders', reminders => [...(reminders || []), newReminder]);
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
        setReminders(prev => [...prev, newReminder]);
        await Storage.setItem('@TDAHService:reminders', reminders => [...(reminders || []), newReminder]);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualiza lembrete
  const updateReminder = useCallback(async (id: string, updates: Partial<Reminder>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await Storage.getItem('@TDAHService:token');
      if (!token) {
        setReminders(prev => prev.map(reminder =>
          reminder.id === id ? { ...reminder, ...updates } : reminder
        ));
        await Storage.setItem('@TDAHService:reminders', reminders => reminders.map((reminder: Reminder) =>
          reminder.id === id ? { ...reminder, ...updates } : reminder
        ));
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
        setReminders(prev => prev.map(reminder =>
          reminder.id === id ? updatedReminder : reminder
        ));
        await Storage.setItem('@TDAHService:reminders', reminders => reminders.map((reminder: Reminder) =>
          reminder.id === id ? updatedReminder : reminder
        ));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deleta lembrete
  const deleteReminder = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await Storage.getItem('@TDAHService:token');
      if (!token) {
        setReminders(prev => prev.filter(reminder => reminder.id !== id));
        await Storage.setItem('@TDAHService:reminders', reminders => reminders.filter((reminder: Reminder) => reminder.id !== id));
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
        setReminders(prev => prev.filter(reminder => reminder.id !== id));
        await Storage.setItem('@TDAHService:reminders', reminders => reminders.filter((reminder: Reminder) => reminder.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Alterna lembrete concluído
  const toggleReminder = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await Storage.getItem('@TDAHService:token');
      if (!token) {
        setReminders(prev =>
          prev.map(reminder =>
            reminder.id === id
              ? { ...reminder, isCompleted: !reminder.isCompleted }
              : reminder
          )
        );
        await Storage.setItem('@TDAHService:reminders', reminders =>
          reminders.map((reminder: Reminder) =>
            reminder.id === id
              ? { ...reminder, isCompleted: !reminder.isCompleted }
              : reminder
          )
        );
        return true;
      }
      // Busca o lembrete atual
      let found: Reminder | undefined;
      setReminders(prev => {
        found = prev.find(r => r.id === id);
        return prev;
      });
      if (!found) return false;
      const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCompleted: !found.isCompleted })
      });
      if (response.ok) {
        const updatedReminder = await response.json();
        setReminders(prev =>
          prev.map(reminder =>
            reminder.id === id ? updatedReminder : reminder
          )
        );
        await Storage.setItem('@TDAHService:reminders', reminders =>
          reminders.map((reminder: Reminder) =>
            reminder.id === id ? updatedReminder : reminder
          )
        );
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ReminderContext.Provider value={{
      reminders,
      isLoading,
      addReminder,
      updateReminder,
      deleteReminder,
      toggleReminder,
    }}>
      {children}
    </ReminderContext.Provider>
  );
}; 