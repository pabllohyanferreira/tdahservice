import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Reminder } from '../types/reminder';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  vibrate?: number[];
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Registrar para push notifications
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications só funcionam em dispositivos físicos');
      return null;
    }

    try {
      // Verificar permissões
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações negada');
        return null;
      }

      // Obter token do Expo
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Substituir pelo ID do seu projeto Expo
      });

      this.expoPushToken = token.data;
      console.log('Token de notificação:', this.expoPushToken);

      // Configurar para Android
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Erro ao registrar notificações:', error);
      return null;
    }
  }

  // Agendar notificação para um lembrete
  async scheduleReminderNotification(reminder: Reminder): Promise<string | null> {
    try {
      const trigger = new Date(reminder.dateTime);
      
      // Verificar se a data não é no passado
      if (trigger <= new Date()) {
        console.log('Data do lembrete já passou');
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
        trigger: {
          seconds: Math.floor((trigger.getTime() - Date.now()) / 1000),
        },
      });

      console.log('Notificação agendada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return null;
    }
  }

  // Agendar notificação com 15 minutos de antecedência
  async scheduleReminderNotificationEarly(reminder: Reminder): Promise<string | null> {
    try {
      const trigger = new Date(reminder.dateTime);
      trigger.setMinutes(trigger.getMinutes() - 15); // 15 minutos antes
      
      // Verificar se a data não é no passado
      if (trigger <= new Date()) {
        console.log('Data do lembrete antecipado já passou');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Lembrete em 15 minutos',
          body: `"${reminder.title}" - Prepare-se!`,
          data: {
            reminderId: reminder.id,
            type: 'reminder_early',
            ...reminder,
          },
          sound: true,
        },
        trigger: {
          seconds: Math.floor((trigger.getTime() - Date.now()) / 1000),
        },
      });

      console.log('Notificação antecipada agendada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação antecipada:', error);
      return null;
    }
  }

  // Cancelar notificação específica
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notificação cancelada:', notificationId);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  // Cancelar todas as notificações
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Todas as notificações canceladas');
    } catch (error) {
      console.error('Erro ao cancelar todas as notificações:', error);
    }
  }

  // Cancelar notificações de um lembrete específico
  async cancelReminderNotifications(reminderId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log('Notificação do lembrete cancelada:', notification.identifier);
        }
      }
    } catch (error) {
      console.error('Erro ao cancelar notificações do lembrete:', error);
    }
  }

  // Enviar notificação imediata (para testes)
  async sendImmediateNotification(data: NotificationData): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: data.data,
          sound: data.sound ?? true,
        },
        trigger: null, // Imediato
      });

      console.log('Notificação imediata enviada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erro ao enviar notificação imediata:', error);
      return null;
    }
  }

  // Obter notificações agendadas
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erro ao obter notificações agendadas:', error);
      return [];
    }
  }

  // Verificar permissões
  async checkPermissions(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return 'undetermined';
    }
  }

  // Solicitar permissões
  async requestPermissions(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return 'undetermined';
    }
  }

  // Obter token atual
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Configurar listener para notificações recebidas
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Configurar listener para notificações respondidas
  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export default NotificationService.getInstance(); 