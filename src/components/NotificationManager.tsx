import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

export const NotificationManager: React.FC = () => {
  const { isEnabled, isLoading, enableNotifications, sendTestNotification } = useNotifications();
  const { theme } = useTheme();

  useEffect(() => {
    // Verificar permissões ao montar o componente
    if (!isEnabled && !isLoading) {
      // Mostrar alerta sobre notificações se não estiverem ativadas
      Alert.alert(
        'Notificações',
        'Ative as notificações para receber lembretes importantes!',
        [
          { text: 'Agora não', style: 'cancel' },
          { text: 'Ativar', onPress: enableNotifications }
        ]
      );
    }
  }, [isEnabled, isLoading, enableNotifications]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.card }]}>
        <Text style={[styles.text, { color: theme.text.secondary }]}>
          Configurando notificações...
        </Text>
      </View>
    );
  }

  if (!isEnabled) {
    return (
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: '#FF9800' }]}
        onPress={enableNotifications}
      >
        <Ionicons name="notifications-off" size={24} color="#fff" />
        <Text style={styles.text}>Ativar Notificações</Text>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.action.success }]}>
      <Ionicons name="notifications" size={24} color="#fff" />
      <Text style={styles.text}>Notificações Ativas</Text>
      <TouchableOpacity 
        style={styles.testButton}
        onPress={sendTestNotification}
      >
        <Ionicons name="play" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  testButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
}); 