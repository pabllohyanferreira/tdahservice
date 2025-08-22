import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useReminders } from '../contexts/ReminderContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemeBackground } from '../components/ThemeBackground';

import { vibrationService } from '../services/VibrationService';
import { backupService } from '../services/BackupService';
import { alarmService } from '../services/AlarmService';
import { AlarmTestButton } from '../components/AlarmTestButton';
import { StopAlarmButton } from '../components/StopAlarmButton';


export default function Configuracoes() {
  const { theme, themeType, setTheme } = useTheme();
  const { userData, resetOnboarding } = useUser();
  const { syncWithServer } = useReminders();
  const { 
    isEnabled: notifications, 
    isLoading: notificationsLoading,
    enableNotifications, 
    disableNotifications
  } = useNotifications();
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [backupStatus, setBackupStatus] = useState<{
    lastLocalBackup: string | null;
    lastServerBackup: string | null;
    isOnline: boolean;
  } | null>(null);
  const [activeAlarmsCount, setActiveAlarmsCount] = useState(0);

  // Função para melhorar a visibilidade de textos no modo roxo
  const getTextColor = (baseColor: string, fallbackColor: string = '#1A0B4B') => {
    if (themeType === 'purple') {
      return fallbackColor;
    }
    return baseColor;
  };

  const loadBackupStatus = async () => {
    try {
      const status = await backupService.getBackupStatus();
      setBackupStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status do backup:', error);
    }
  };

  const handleManualBackup = async () => {
    try {
      Alert.alert('Backup Manual', 'Fazendo backup dos seus dados...');
      await syncWithServer();
      await loadBackupStatus();
      Alert.alert('Sucesso', 'Backup realizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível fazer o backup. Verifique sua conexão.');
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'Restaurar Backup',
      'Isso irá sobrescrever seus dados locais com os dados do servidor. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Restaurar', 
          onPress: async () => {
            try {
              const restored = await backupService.restoreFromServer();
              if (restored) {
                Alert.alert('Sucesso', 'Dados restaurados do servidor!');
                // Recarregar dados
                window.location.reload();
              } else {
                Alert.alert('Aviso', 'Nenhum backup encontrado no servidor.');
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível restaurar o backup.');
    }
          }
        }
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Limpar Todos os Dados',
      'Isso irá apagar TODOS os seus dados (lembretes, configurações, etc.) tanto localmente quanto no servidor. Esta ação não pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar Tudo', 
          style: 'destructive',
          onPress: async () => {
            try {
              await backupService.clearAllData();
              Alert.alert('Sucesso', 'Todos os dados foram limpos. O app será reiniciado.');
              // Recarregar app
              window.location.reload();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar todos os dados.');
    }
          }
        }
      ]
    );
  };



  const handleNotificationsChange = async () => {
    if (notifications) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Refazer Onboarding',
      'Isso irá limpar seus dados pessoais e você precisará preencher novamente. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert('Sucesso', 'Onboarding resetado. O app será reiniciado.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível resetar o onboarding.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadVibrationSettings();
    loadBackupStatus();
    loadAlarmStatus();
  }, []);

  const loadAlarmStatus = () => {
    const count = alarmService.getActiveAlarmsCount();
    setActiveAlarmsCount(count);
  };

  const loadVibrationSettings = async () => {
    const settings = await vibrationService.getSettings();
    setVibrationEnabled(settings.enabled);
  };

  const handleVibrationChange = async () => {
    const newEnabled = !vibrationEnabled;
    await vibrationService.setEnabled(newEnabled);
    setVibrationEnabled(newEnabled);
    
    if (newEnabled) {
      await vibrationService.vibrate('success');
    }
    
    Alert.alert('Vibração', `Vibração ${newEnabled ? 'ativada' : 'desativada'}!`);
  };

  return (
    <ThemeBackground>
      <ScrollView style={{ flex: 1 }}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Configurações</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Aparência</Text>
        
        <View style={styles.themeContainer}>
          <Text style={[styles.themeLabel, { color: theme.text.primary }]}>Tema do App</Text>
          
          <View style={styles.themeOptions}>
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: themeType === 'dark' ? theme.action.primary : theme.background.card },
                { borderColor: themeType === 'dark' ? theme.action.primary : theme.state.border }
              ]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons 
                name="moon" 
                size={24} 
                color={themeType === 'dark' ? '#fff' : theme.text.primary} 
              />
              <Text style={[
                styles.themeOptionText, 
                { color: themeType === 'dark' ? '#fff' : theme.text.primary }
              ]}>
                Escuro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: themeType === 'light' ? theme.action.primary : theme.background.card },
                { borderColor: themeType === 'light' ? theme.action.primary : theme.state.border }
              ]}
              onPress={() => setTheme('light')}
            >
              <Ionicons 
                name="sunny" 
                size={24} 
                color={themeType === 'light' ? '#fff' : theme.text.primary} 
              />
              <Text style={[
                styles.themeOptionText, 
                { color: themeType === 'light' ? '#fff' : theme.text.primary }
              ]}>
                Claro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: themeType === 'purple' ? theme.action.primary : theme.background.card },
                { borderColor: themeType === 'purple' ? theme.action.primary : theme.state.border }
              ]}
              onPress={() => setTheme('purple')}
            >
              <Ionicons 
                name="color-palette" 
                size={24} 
                color={themeType === 'purple' ? '#fff' : theme.text.primary} 
              />
              <Text style={[
                styles.themeOptionText, 
                { color: themeType === 'purple' ? '#fff' : theme.text.primary }
              ]}>
                Roxo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Notificações</Text>
          <Switch 
            value={notifications} 
            onValueChange={handleNotificationsChange}
            disabled={notificationsLoading}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Vibração</Text>
          <Switch value={vibrationEnabled} onValueChange={handleVibrationChange} />
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Alarmes Ativos</Text>
          <Text style={[styles.statusText, { color: theme.action.primary }]}>
            {activeAlarmsCount} alarme{activeAlarmsCount !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Som do Alarme</Text>
          <Text style={[styles.statusText, { color: theme.action.primary }]}>
            Alarme Melhorado (35s)
          </Text>
        </View>


        
        <AlarmTestButton title="Testar Sistema de Alarme" />
        <StopAlarmButton />
      </View>

      {/* Seção de Dados do Usuário */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Seus Dados</Text>
        
        {userData && (
          <>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Nome</Text>
              <Text style={[styles.userDataText, { color: theme.text.secondary }]}>
                {userData.name}
              </Text>
            </View>
          <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Idade</Text>
              <Text style={[styles.userDataText, { color: theme.text.secondary }]}>
                {userData.age} anos
            </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.text.primary }]}>Gênero</Text>
              <Text style={[styles.userDataText, { color: theme.text.secondary }]}>
                {userData.gender === 'masculino' ? 'Masculino' : 
                 userData.gender === 'feminino' ? 'Feminino' : 'Outro'}
            </Text>
          </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: theme.action.logout }]}
          onPress={handleResetOnboarding}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.resetButtonText}>Refazer Onboarding</Text>
        </TouchableOpacity>

        <Text style={[styles.resetHelpText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>
          Isso irá limpar seus dados pessoais e você precisará preencher novamente.
        </Text>
      </View>



      {/* Seção de Backup */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Backup e Sincronização</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Status do Servidor
          </Text>
          <Text style={[styles.statusText, { color: backupStatus?.isOnline ? '#4CAF50' : '#F44336' }]}>
            {backupStatus?.isOnline ? '✅ Online' : '❌ Offline'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Último Backup Local
          </Text>
          <Text style={[styles.userDataText, { color: theme.text.secondary }]}>
            {backupStatus?.lastLocalBackup ? new Date(backupStatus.lastLocalBackup).toLocaleDateString() : 'Nunca'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Último Backup do Servidor
          </Text>
          <Text style={[styles.userDataText, { color: theme.text.secondary }]}>
            {backupStatus?.lastServerBackup ? new Date(backupStatus.lastServerBackup).toLocaleDateString() : 'Nunca'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.backupButton, { backgroundColor: theme.action.primary }]}
          onPress={handleManualBackup}
        >
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text style={styles.backupButtonText}>Fazer Backup Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.restoreButton, { backgroundColor: theme.action.primary }]}
          onPress={handleRestoreBackup}
        >
          <Ionicons name="cloud-download" size={20} color="#fff" />
          <Text style={styles.restoreButtonText}>Restaurar Backup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.clearAllDataButton, { backgroundColor: theme.action.logout }]}
          onPress={handleClearAllData}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.clearAllDataButtonText}>Limpar Todos os Dados</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Sobre o App</Text>
        <View style={styles.aboutContainer}>
          <Text style={[styles.aboutText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>TDAH Service v2.0</Text>
          <Text style={[styles.aboutText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>Desenvolvido por Pabllo</Text>
        </View>
      </View>
      
      {/* Espaçamento no final */}
      <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutButton: {
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomSpacing: {
    height: 60,
  },


  themeContainer: {
    marginBottom: 24,
  },
  themeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 8,
  },
  themeOption: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  themeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
  },


  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userDataText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    gap: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetHelpText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginTop: 8,
  },

  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    gap: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  restoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    gap: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  clearAllDataButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});