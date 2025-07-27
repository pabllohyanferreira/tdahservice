import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemeBackground } from '../components/ThemeBackground';
import { getApiBaseUrl, testConnection } from '../config/api';

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const { theme, themeType, setTheme } = useTheme();
  const { 
    isEnabled: notifications, 
    isLoading: notificationsLoading,
    enableNotifications, 
    disableNotifications, 
    sendTestNotification 
  } = useNotifications();
  const [vibration, setVibration] = useState(true); // Simulação
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'online' | 'offline'>('unknown');
  const [apiEndpoint, setApiEndpoint] = useState<string>('');

  // Função para melhorar a visibilidade de textos no modo roxo
  const getTextColor = (baseColor: string, fallbackColor: string = '#1A0B4B') => {
    if (themeType === 'purple') {
      return fallbackColor;
    }
    return baseColor;
  };

  const handleLogout = async () => {
    await signOut();
  };

  const testBackendConnection = async () => {
    setConnectionStatus('testing');
    try {
      const endpoint = await getApiBaseUrl();
      setApiEndpoint(endpoint);
      
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'online' : 'offline');
      
      Alert.alert(
        'Teste de Conectividade',
        isConnected
          ? `✅ Backend conectado!\nEndpoint: ${endpoint}`
          : `❌ Backend não acessível\nEndpoint testado: ${endpoint}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setConnectionStatus('offline');
      Alert.alert(
        'Erro de Conectividade',
        `❌ Erro ao testar conexão:\n${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'testing': return '#FF9800';
      default: return theme.text.muted;
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'online': return '🟢 Online';
      case 'offline': return '🔴 Offline';
      case 'testing': return '🟡 Testando...';
      default: return '⚪ Desconhecido';
    }
  };

  const handleNotificationsChange = async () => {
    if (notifications) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handleVibrationChange = () => {
    setVibration((prev) => !prev);
    Alert.alert('Vibração', `Vibração ${!vibration ? 'ativada' : 'desativada'}! (simulação)`);
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
          <Switch value={vibration} onValueChange={handleVibrationChange} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Notificações</Text>
        <TouchableOpacity 
          style={[styles.testButton, { backgroundColor: theme.action.primary }]} 
          onPress={sendTestNotification}
          disabled={!notifications || notificationsLoading}
        >
          <Ionicons name="notifications" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Enviar Notificação de Teste</Text>
        </TouchableOpacity>
        <Text style={[styles.helpText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>
          Teste se as notificações estão funcionando corretamente
        </Text>
      </View>

      {/* Seção de Diagnóstico */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Diagnóstico do Sistema</Text>
        
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Status do Backend
          </Text>
          <Text style={[styles.statusText, { color: getConnectionStatusColor() }]}>
            {getConnectionStatusText()}
          </Text>
        </View>

        {apiEndpoint && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text.primary }]}>
              Endpoint
            </Text>
            <Text style={[styles.endpointText, { color: theme.text.secondary }]} numberOfLines={1}>
              {apiEndpoint}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: theme.action.primary }]}
          onPress={testBackendConnection}
          disabled={connectionStatus === 'testing'}
        >
          <Ionicons name="wifi" size={20} color="#fff" />
          <Text style={styles.testButtonText}>
            {connectionStatus === 'testing' ? 'Testando...' : 'Testar Conectividade'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>
          Teste a conexão com o backend para diagnosticar problemas de sincronização.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Sua Conta</Text>
        <View style={styles.userInfoContainer}>
          <Text style={[styles.userInfo, { color: theme.text.primary }]}>Nome: {user?.name}</Text>
          <Text style={[styles.userInfo, { color: theme.text.primary }]}>E-mail: {user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.action.logout }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Sobre o App</Text>
        <View style={styles.aboutContainer}>
          <Text style={[styles.aboutText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>TDAH Service v1.0</Text>
          <Text style={[styles.aboutText, { color: getTextColor(theme.text.muted, '#4C1D95') }]}>Desenvolvido por Você</Text>
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
    marginTop: 20,
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
    height: 40,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    gap: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
    marginTop: 8,
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
  endpointText: {
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
});