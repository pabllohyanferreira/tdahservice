import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VibrationSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
}

class VibrationService {
  private settings: VibrationSettings = {
    enabled: true,
    intensity: 'medium'
  };

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem('vibrationSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de vibração:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('vibrationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de vibração:', error);
    }
  }

  async setEnabled(enabled: boolean) {
    this.settings.enabled = enabled;
    await this.saveSettings();
  }

  async setIntensity(intensity: 'light' | 'medium' | 'heavy') {
    this.settings.intensity = intensity;
    await this.saveSettings();
  }

  async getSettings(): Promise<VibrationSettings> {
    await this.loadSettings();
    return { ...this.settings };
  }

  async vibrate(type: 'notification' | 'success' | 'error' | 'warning' | 'selection' = 'notification') {
    if (!this.settings.enabled) return;

    try {
      switch (type) {
        case 'notification':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
      }
    } catch (error) {
      console.error('Erro ao vibrar:', error);
    }
  }

  async vibrateWithIntensity() {
    if (!this.settings.enabled) return;

    try {
      switch (this.settings.intensity) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      console.error('Erro ao vibrar com intensidade:', error);
    }
  }

  // Métodos específicos para diferentes ações do app
  async vibrateOnReminderCreated() {
    await this.vibrate('success');
  }

  async vibrateOnReminderCompleted() {
    await this.vibrate('success');
  }

  async vibrateOnReminderDeleted() {
    await this.vibrate('warning');
  }

  async vibrateOnError() {
    await this.vibrate('error');
  }

  async vibrateOnButtonPress() {
    await this.vibrate('selection');
  }

  async vibrateOnThemeChange() {
    await this.vibrateWithIntensity();
  }
}

export const vibrationService = new VibrationService(); 