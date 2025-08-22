import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { Reminder } from '../types/reminder';
import Storage from '../utils/storage';

interface NotificationContextData {
  isEnabled: boolean;
  isLoading: boolean;
  expoPushToken: string | null;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  scheduleReminderNotification: (reminder: Reminder) => Promise<string | null>;
  cancelReminderNotification: (reminderId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Verificar status das notificações ao inicializar
  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const status = await Notifications.getPermissionsAsync();
      const storedEnabled = await Storage.getItem('@TDAHService:notifications_enabled');
      setIsEnabled(status.status === 'granted' && storedEnabled === 'true');
    } catch (error) {
      console.error('Erro ao verificar status das notificações:', error);
    }
  };

  const enableNotifications = async () => {
    setIsLoading(true);
    try {
      if (!Device.isDevice) {
        Alert.alert('Erro', 'Notificações só funcionam em dispositivos físicos');
        return;
      }

      // Verificar permissões
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permissão Negada', 'As notificações são necessárias para os lembretes funcionarem corretamente.');
        return;
      }

      // Para desenvolvimento local, não precisamos do token push
      // O token push é necessário apenas para push notifications via servidor
      // Em produção, você pode descomentar a linha abaixo:
      // const token = await Notifications.getExpoPushTokenAsync({ projectId: 'seu-project-id' });
      
      setExpoPushToken('dev-token');
      setIsEnabled(true);
      await Storage.setItem('@TDAHService:notifications_enabled', 'true');
      await Storage.setItem('@TDAHService:expo_push_token', 'dev-token');

      // Configurar para Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      Alert.alert('Sucesso', 'Notificações ativadas com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      Alert.alert('Erro', 'Não foi possível ativar as notificações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    setIsLoading(true);
    try {
      // Cancelar todas as notificações agendadas
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      setIsEnabled(false);
      setExpoPushToken(null);
      await Storage.setItem('@TDAHService:notifications_enabled', 'false');
      await Storage.removeItem('@TDAHService:expo_push_token');

      Alert.alert('Sucesso', 'Notificações desativadas com sucesso!');
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      Alert.alert('Erro', 'Não foi possível desativar as notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleReminderNotification = useCallback(async (reminder: Reminder): Promise<string | null> => {
    if (!isEnabled) {
      return null;
    }

    try {
      const trigger = new Date(reminder.dateTime);
      
      // Verificar se a data não é no passado
      if (trigger <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Lembrete: ' + reminder.title,
          body: reminder.description || 'Hora do seu lembrete!',
          data: {
            reminderId: reminder.id,
            type: 'reminder',
            ...reminder,
          },
          sound: true,
        },
        trigger: null,
      });

      return notificationId;
    } catch (error) {
      return null;
    }
  }, [isEnabled]);

  const cancelReminderNotification = useCallback(async (reminderId: string): Promise<void> => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      // Silenciar erro em produção
    }
  }, []);



  return (
    <NotificationContext.Provider value={{
      isEnabled,
      isLoading,
      expoPushToken,
      enableNotifications,
      disableNotifications,
      scheduleReminderNotification,
      cancelReminderNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 