import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { Reminder } from '../types/reminder';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  vibrate?: number[];
  badge?: number;
  category?: string;
}

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

      // Canal para notificações de teste
      await Notifications.setNotificationChannelAsync('test', {
        name: 'Testes',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: '#00FF00',
        sound: 'default',
        enableVibrate: false,
        showBadge: false,
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
      console.log('Token de notificação:', this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('Erro ao registrar notificações:', error);
      return null;
    }
  }

  // Agendar notificação para um lembrete com configurações avançadas
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
          title: '⏰ Lembrete: ' + reminder.title,
          body: reminder.description || 'Hora do seu lembrete!',
          data: {
            reminderId: reminder.id, //    Barra de notificações
            type: 'reminder',
            priority: 'medium',
            ...reminder,
          },
          sound: this.settings.sound,
          badge: badgeCount,
          categoryIdentifier: 'reminders',
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((trigger.getTime() - Date.now()) / 1000),
        },
      });

      this.notificationCount++;
      console.log('Notificação agendada:', notificationId);
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
            type: 'reminder_early',
            priority: 'medium',
            ...reminder,
          },
          sound: this.settings.sound,
          categoryIdentifier: 'early_warnings',
        },
        trigger: {
          type: 'timeInterval',
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

  // Agendar múltiplas notificações para um lembrete
  async scheduleReminderNotifications(reminder: Reminder): Promise<string[]> {
    const notificationIds: string[] = [];

    try {
      // Notificação principal
      const mainNotification = await this.scheduleReminderNotification(reminder);
      if (mainNotification) {
        notificationIds.push(mainNotification);
      }

      // Notificação antecipada
      const earlyNotification = await this.scheduleReminderNotificationEarly(reminder);
      if (earlyNotification) {
        notificationIds.push(earlyNotification);
      }

      // Notificação de alta prioridade com 1 hora de antecedência (se configurado)
      const reminderPriority = (reminder as any).priority || 'medium';
      if (reminderPriority === 'high') {
        const highPriorityTrigger = new Date(reminder.dateTime);
        highPriorityTrigger.setHours(highPriorityTrigger.getHours() - 1);
        
        if (highPriorityTrigger > new Date()) {
          const highPriorityNotification = await Notifications.scheduleNotificationAsync({
            content: {
              title: '🚨 Lembrete Importante em 1 hora',
              body: `"${reminder.title}" - Lembrete de alta prioridade!`,
              data: {
                reminderId: reminder.id,
                type: 'reminder_high_priority',
                priority: 'high',
                ...reminder,
              },
              sound: true,
              categoryIdentifier: 'reminders',
            },
            trigger: {
              type: 'timeInterval',
              seconds: Math.floor((highPriorityTrigger.getTime() - Date.now()) / 1000),
            },
          });
          notificationIds.push(highPriorityNotification);
        }
      }

      return notificationIds;
    } catch (error) {
      console.error('Erro ao agendar múltiplas notificações:', error);
      return notificationIds;
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
      this.notificationCount = 0;
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
          badge: data.badge,
          categoryIdentifier: data.category || 'test',
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

  // Enviar notificação de teste
  async sendTestNotification(): Promise<string | null> {
    return this.sendImmediateNotification({
      id: 'test',
      title: '🧪 Teste de Notificação',
      body: 'Esta é uma notificação de teste do TDAH Service!',
      data: { type: 'test' },
      sound: true,
      category: 'test',
    });
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
      return 'denied';
    }
  }

  // Solicitar permissões
  async requestPermissions(): Promise<Notifications.PermissionStatus> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return 'denied';
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

  // Atualizar configurações de notificação
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Configurações de notificação atualizadas:', this.settings);
  }

  // Obter configurações atuais
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Obter contador de notificações
  getNotificationCount(): number {
    return this.notificationCount;
  }

  // Resetar contador de notificações
  resetNotificationCount(): void {
    this.notificationCount = 0;
  }

  // Verificar se notificações estão habilitadas
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  // Habilitar/desabilitar notificações
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    console.log('Notificações:', enabled ? 'habilitadas' : 'desabilitadas');
  }
}

export default NotificationService.getInstance(); 