import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useReminders } from '../contexts/ReminderContext';
import NotificationBar from '../components/NotificationBar';

export default function DashboardWithNotifications({ navigation }) {
  const { theme } = useTheme();
  const { isEnabled, enableNotifications, sendTestNotification } = useNotifications();
  const { reminders, isLoading } = useReminders();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Calcular estatísticas dos lembretes
  useEffect(() => {
    const pending = reminders.filter(
      reminder => !reminder.isCompleted && new Date(reminder.dateTime) > new Date()
    );
    const completed = reminders.filter(reminder => reminder.isCompleted);
    
    setPendingCount(pending.length);
    setCompletedCount(completed.length);
  }, [reminders]);

  const handleNotificationPress = (notification) => {
    const reminderId = notification.notification?.request?.content?.data?.reminderId;
    if (reminderId) {
      navigation.navigate('DetalheLembrete', { reminderId });
    } else {
      Alert.alert('Notificação', 'Detalhes da notificação recebida');
    }
  };

  const handleEnableNotifications = async () => {
    try {
      await enableNotifications();
      Alert.alert('Sucesso', 'Notificações ativadas!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível ativar as notificações');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Sucesso', 'Notificação de teste enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a notificação de teste');
    }
  };

  const handleCreateReminder = () => {
    navigation.navigate('AlarmesLembretes');
  };

  const handleViewAllReminders = () => {
    navigation.navigate('Calendario');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* Barra de Notificação */}
      <NotificationBar
        onNotificationPress={handleNotificationPress}
        showBadge={true}
        autoHide={true}
        autoHideDelay={5000}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            📱 Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Gerencie seus lembretes e notificações
          </Text>
        </View>

        {/* Status das Notificações */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            🔔 Status das Notificações
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
              Status:
            </Text>
            <Text style={[
              styles.statusValue,
              { color: isEnabled ? theme.colors.action.success : theme.colors.action.error }
            ]}>
              {isEnabled ? '✅ Ativadas' : '❌ Desativadas'}
            </Text>
          </View>

          {!isEnabled && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.action.primary }]}
              onPress={handleEnableNotifications}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
                Ativar Notificações
              </Text>
            </TouchableOpacity>
          )}

          {isEnabled && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.action.secondary }]}
              onPress={handleTestNotification}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
                🧪 Testar Notificação
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Estatísticas dos Lembretes */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            📊 Estatísticas
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.action.primary }]}>
                {pendingCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Pendentes
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.action.success }]}>
                {completedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Concluídos
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.action.secondary }]}>
                {reminders.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Total
              </Text>
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            ⚡ Ações Rápidas
          </Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.action.primary }]}
              onPress={handleCreateReminder}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>
                ➕ Novo Lembrete
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.action.secondary }]}
              onPress={handleViewAllReminders}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.text.primary }]}>
                📅 Ver Todos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lembretes Próximos */}
        <View style={[styles.card, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            ⏰ Próximos Lembretes
          </Text>
          
          {isLoading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
              Carregando...
            </Text>
          ) : pendingCount === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              Nenhum lembrete pendente
            </Text>
          ) : (
            reminders
              .filter(reminder => !reminder.isCompleted && new Date(reminder.dateTime) > new Date())
              .slice(0, 3)
              .map((reminder, index) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={styles.reminderItem}
                  onPress={() => navigation.navigate('DetalheLembrete', { reminderId: reminder.id })}
                >
                  <Text style={[styles.reminderTitle, { color: theme.colors.text.primary }]}>
                    {reminder.title}
                  </Text>
                  <Text style={[styles.reminderTime, { color: theme.colors.text.secondary }]}>
                    {new Date(reminder.dateTime).toLocaleString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    opacity: 0.8,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
}); 