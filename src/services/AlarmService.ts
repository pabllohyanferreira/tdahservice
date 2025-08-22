import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Reminder } from '../types/reminder';

// Configurar notificações para tocar mesmo com app em background
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class AlarmService {
  private static instance: AlarmService;
  private activeAlarms: Map<string, NodeJS.Timeout> = new Map();
  private sound: Audio.Sound | null = null;
  private isSoundLoaded = false;
  private alarmInterval: NodeJS.Timeout | null = null;
  private alarmDuration = 35000; // 35 segundos por padrão

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  // Configurar permissões de notificação
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permissão de notificação negada');
        return false;
      }

      // Configurar canal de notificação para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alarms', {
          name: 'Alarmes de Lembretes',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'alarm', // Som de alarme específico
          enableVibrate: true,
          showBadge: false,
        });
      }

      console.log('✅ Permissões de notificação configuradas');
      
      // Carregar som de alarme
      await this.loadAlarmSound();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar permissões:', error);
      return false;
    }
  }

  // Agendar alarme para um lembrete
  async scheduleAlarm(reminder: Reminder): Promise<boolean> {
    try {
      if (!reminder.dateTime || reminder.isCompleted) {
        return false;
      }

      const alarmTime = new Date(reminder.dateTime);
      const now = new Date();

      // Se o lembrete já passou, não agendar
      if (alarmTime <= now) {
        console.log('⚠️ Lembrete já passou:', reminder.title);
        return false;
      }

      // Cancelar alarme anterior se existir
      await this.cancelAlarm(reminder.id);

      // Calcular delay em milissegundos
      const delay = alarmTime.getTime() - now.getTime();

      // Agendar notificação (simplificado)
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Lembrete!',
          body: reminder.title,
          data: { reminderId: reminder.id, type: 'reminder_alarm' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Será configurado pelo timeout
      });

      // Agendar timeout para verificação adicional
      const timeout = setTimeout(() => {
        this.handleAlarmTrigger(reminder);
      }, delay);

      this.activeAlarms.set(reminder.id, timeout);

      console.log(`✅ Alarme agendado para: ${reminder.title} às ${alarmTime.toLocaleString()}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao agendar alarme:', error);
      return false;
    }
  }

  // Cancelar alarme de um lembrete
  async cancelAlarm(reminderId: string): Promise<boolean> {
    try {
      // Cancelar timeout se existir
      const timeout = this.activeAlarms.get(reminderId);
      if (timeout) {
        clearTimeout(timeout);
        this.activeAlarms.delete(reminderId);
      }

      // Cancelar notificação
      await Notifications.cancelScheduledNotificationAsync(reminderId);

      console.log(`✅ Alarme cancelado para: ${reminderId}`);
      return true;

    } catch (error) {
      console.error('❌ Erro ao cancelar alarme:', error);
      return false;
    }
  }

  // Cancelar todos os alarmes
  async cancelAllAlarms(): Promise<void> {
    try {
      // Limpar todos os timeouts
      this.activeAlarms.forEach((timeout) => {
        clearTimeout(timeout);
      });
      this.activeAlarms.clear();

      // Cancelar todas as notificações agendadas
      await Notifications.cancelAllScheduledNotificationsAsync();

      console.log('✅ Todos os alarmes cancelados');
    } catch (error) {
      console.error('❌ Erro ao cancelar todos os alarmes:', error);
    }
  }

  // Carregar som de alarme
  async loadAlarmSound(): Promise<void> {
    try {
      // Resetar estado para forçar recarregamento
      this.isSoundLoaded = false;
      this.sound = null;

      // Configurar áudio para som customizado
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Tentar carregar som customizado
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/alarm.mp3'),
          { 
            shouldPlay: false, 
            isLooping: true,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: false,
          }
        );

        this.sound = sound;
        this.isSoundLoaded = true;
        
      } catch (error) {
        this.isSoundLoaded = false;
        this.sound = null;
        throw error;
      }

    } catch (error) {
      this.isSoundLoaded = false;
      this.sound = null;
    }
  }

  // Tocar som de alarme
  async playAlarmSound(): Promise<void> {
    try {
      // Parar qualquer som anterior
      await this.stopAlarmSound();

      // Forçar recarregamento do som customizado
      await this.loadAlarmSound();

      if (this.sound && this.isSoundLoaded) {
        // Configurar volume máximo
        await this.sound.setVolumeAsync(1.0);
        
        // Tocar som customizado em loop
        await this.sound.playAsync();
        
        // Parar automaticamente após a duração configurada
        this.alarmInterval = setTimeout(() => {
          this.stopAlarmSound();
        }, this.alarmDuration);
        
      } else {
        // Usar som longo único
        this.playLongAlarmSound();
      }
      
    } catch (error) {
      // Fallback para som longo
      this.playLongAlarmSound();
    }
  }

  // Tocar som longo único
  private async playLongAlarmSound(): Promise<void> {
    try {
      // Enviar uma única notificação com som melhor
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Lembrete!',
          body: 'Alarme tocando...',
          data: { type: 'long_alarm_sound' },
          sound: Platform.OS === 'android' ? 'alarm' : 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      // Para Android, usar vibração longa contínua
      if (Platform.OS === 'android') {
        const { Vibration } = require('react-native');
        // Padrão de vibração longo: vibra por 2s, pausa 1s, repete
        const longVibrationPattern = [];
        const cycles = Math.floor(this.alarmDuration / 3000); // Ciclos de 3 segundos
        
        for (let i = 0; i < cycles; i++) {
          longVibrationPattern.push(2000, 1000); // 2s vibra, 1s pausa
        }
        
        Vibration.vibrate(longVibrationPattern);
      }
      
      // Som longo único tocando
    } catch (error) {
      // Erro silencioso
    }
  }

  // Parar som de alarme
  async stopAlarmSound(): Promise<void> {
    try {
      // Parar som customizado
      if (this.sound && this.isSoundLoaded) {
        await this.sound.stopAsync();
      }

      // Limpar intervalo de parada automática
      if (this.alarmInterval) {
        clearTimeout(this.alarmInterval);
        this.alarmInterval = null;
      }

      // Parar vibração (Android)
      if (Platform.OS === 'android') {
        const { Vibration } = require('react-native');
        Vibration.cancel();
      }

      // Cancelar todas as notificações agendadas
      await Notifications.cancelAllScheduledNotificationsAsync();
      
    } catch (error) {
      // Erro silencioso
    }
  }

  // Manipular quando o alarme tocar
  private async handleAlarmTrigger(reminder: Reminder): Promise<void> {
    try {
      console.log(`🔔 ALARME TOCANDO: ${reminder.title}`);

      // Enviar notificação local com som melhor
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Lembrete!',
          body: reminder.title,
          data: { reminderId: reminder.id, type: 'reminder_alarm' },
          sound: Platform.OS === 'android' ? 'alarm' : 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Notificação imediata
      });

      // Tocar som longo de alarme
      await this.playAlarmSound();

      console.log('🔔 Alarme longo iniciado');

    } catch (error) {
      console.error('❌ Erro ao tocar alarme:', error);
    }
  }

  // Agendar alarmes para múltiplos lembretes
  async scheduleAlarmsForReminders(reminders: Reminder[]): Promise<void> {
    try {
      // Cancelar alarmes existentes
      await this.cancelAllAlarms();

      // Agendar novos alarmes
      for (const reminder of reminders) {
        if (!reminder.isCompleted && reminder.dateTime) {
          await this.scheduleAlarm(reminder);
        }
      }

      console.log(`✅ ${reminders.length} lembretes processados para alarmes`);
    } catch (error) {
      console.error('❌ Erro ao agendar alarmes:', error);
    }
  }

  // Verificar alarmes ativos
  getActiveAlarmsCount(): number {
    return this.activeAlarms.size;
  }

  // Listar alarmes ativos
  getActiveAlarms(): string[] {
    return Array.from(this.activeAlarms.keys());
  }



  // Verificar se alarme está tocando
  isAlarmPlaying(): boolean {
    return this.alarmInterval !== null;
  }

  // Forçar recarregamento do som customizado
  async forceReloadCustomSound(): Promise<boolean> {
    try {
      this.isSoundLoaded = false;
      this.sound = null;
      
      await this.loadAlarmSound();
      
      return this.sound !== null && this.isSoundLoaded;
    } catch (error) {
      return false;
    }
  }

  // Verificar status do som customizado
  getCustomSoundStatus(): { isLoaded: boolean; hasSound: boolean } {
    return {
      isLoaded: this.isSoundLoaded,
      hasSound: this.sound !== null
    };
  }
}

export const alarmService = AlarmService.getInstance(); 