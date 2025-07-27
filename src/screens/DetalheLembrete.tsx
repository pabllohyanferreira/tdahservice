import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTime } from '../utils/date';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeBackground } from '../components/ThemeBackground';
import { useReminders } from '../contexts/ReminderContext';

export default function DetalheLembrete({ route }: { route: RouteProp<any, any> }) {
  const { reminder } = route.params as { reminder: any };
  const { theme, themeType } = useTheme();
  const { toggleReminder, deleteReminder } = useReminders();

  const handleToggleStatus = async () => {
    await toggleReminder(reminder.id);
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Lembrete',
      'Tem certeza que deseja excluir este lembrete?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteReminder(reminder.id);
            if (success) {
              Alert.alert('Sucesso', 'Lembrete excluído!');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = () => {
    return reminder.isCompleted ? theme.action.success : theme.action.primary;
  };

  const getStatusText = () => {
    return reminder.isCompleted ? 'Concluído' : 'Pendente';
  };

  return (
    <ThemeBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.background.card }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{reminder.title}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text.muted }]}>Descrição</Text>
            <Text style={[styles.description, { color: theme.text.primary }]}>
              {reminder.description || 'Sem descrição'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text.muted }]}>Data</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {formatDate(new Date(reminder.dateTime))}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text.muted }]}>Hora</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {formatTime(new Date(reminder.dateTime))}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text.muted }]}>Data e Hora Completa</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {new Date(reminder.dateTime).toLocaleString('pt-BR')}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: getStatusColor() }]}
            onPress={handleToggleStatus}
          >
            <Ionicons 
              name={reminder.isCompleted ? "refresh" : "checkmark"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {reminder.isCompleted ? 'Marcar como Pendente' : 'Marcar como Concluído'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.deleteButton, { backgroundColor: theme.action.logout }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Excluir Lembrete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 