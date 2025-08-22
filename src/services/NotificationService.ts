import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Reminder } from '../types/reminder';

// Configurar comportamento das notificações para Android
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  earlyWarning: boolean;
  earlyWarningMinutes: number;
  badgeCount: boolean;
  priority: 'high' | 'medium' | 'low';
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationCount: number = 0;
  private settings: NotificationSettings = {
    enabled: true,
    sound: true,
    vibration: true,
    earlyWarning: true,
    earlyWarningMinutes: 15,
    badgeCount: true,
    priority: 'high'
  };

  private constructor() {
    this.initializeNotificationChannels();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Inicializar canais de notificação para Android
  private async initializeNotificationChannels() {
    if (Platform.OS === 'android') {
      // Canal principal para lembretes
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Lembretes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      // Canal para avisos antecipados
      await Notifications.setNotificationChannelAsync('early_warnings', {
        name: 'Avisos Antecipados',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#FFA500',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });


    }
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

      // Calcular badge count
      const badgeCount = this.settings.badgeCount ? this.notificationCount + 1 : undefined;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ ' + reminder.title,
          body: reminder.description || 'Hora do seu lembrete!',
          data: {
            reminderId: reminder.id,
            type: 'reminder',
            priority: 'medium',
            category: 'reminder',
            ...reminder,
          },
          sound: this.settings.sound,
          badge: badgeCount,
          categoryIdentifier: 'reminders',
        },
        trigger: null,
      });

      this.notificationCount++;
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return null;
    }
  }

  // Agendar notificação com aviso antecipado
  async scheduleReminderNotificationEarly(reminder: Reminder): Promise<string | null> {
    if (!this.settings.earlyWarning) {
      return null;
    }

    try {
      const trigger = new Date(reminder.dateTime);
      trigger.setMinutes(trigger.getMinutes() - this.settings.earlyWarningMinutes);
      
      // Verificar se a data não é no passado
      if (trigger <= new Date()) {
        console.log('Data do lembrete antecipado já passou');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Lembrete em ' + this.settings.earlyWarningMinutes + ' minutos',
          body: `"${reminder.title}" - Prepare-se!`,
          data: {
            reminderId: reminder.id,
            type: 'early_warning',
            priority: 'medium',
            category: 'early_warning',
            ...reminder,
          },
          sound: this.settings.sound,
          categoryIdentifier: 'early_warnings',
        },
        trigger: null,
      });

      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação antecipada:', error);
      return null;
    }
  }

  // Agendar múltiplas notificações para um lembrete
  async scheduleReminderNotifications(reminder: Reminder): Promise<string[]> {
    const notificationIds: string[] = [];

    try {
      // Notificação principal
      const mainNotificationId = await this.scheduleReminderNotification(reminder);
      if (mainNotificationId) {
        notificationIds.push(mainNotificationId);
      }

      // Notificação antecipada
      const earlyNotificationId = await this.scheduleReminderNotificationEarly(reminder);
      if (earlyNotificationId) {
        notificationIds.push(earlyNotificationId);
      }

      return notificationIds;
    } catch (error) {
      console.error('Erro ao agendar múltiplas notificações:', error);
      return notificationIds;
    }
  }



  // Cancelar todas as notificações
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationCount = 0;
    } catch (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }

  // Cancelar notificação específica
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  // Obter notificações agendadas
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Erro ao obter notificações agendadas:', error);
      return [];
    }
  }

  // Atualizar configurações
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Obter configurações atuais
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Verificar se notificações estão habilitadas
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  // Habilitar/desabilitar notificações
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
  }

  // Obter contador de notificações
  getNotificationCount(): number {
    return this.notificationCount;
  }

  // Resetar contador de notificações
  resetNotificationCount(): void {
    this.notificationCount = 0;
  }
}

export default NotificationService.getInstance(); 