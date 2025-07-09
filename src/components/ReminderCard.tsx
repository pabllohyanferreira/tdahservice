import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Reminder } from '../types/reminder';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Excluir Lembrete',
      'Tem certeza que deseja excluir este lembrete?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => onDelete(reminder.id) },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const reminderDate = new Date(date);
    
    // Se for hoje, mostrar apenas a hora
    if (reminderDate.toDateString() === now.toDateString()) {
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }
    
    // Se for amanhã, mostrar "Amanhã" + hora
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (reminderDate.toDateString() === tomorrow.toDateString()) {
      return `Amanhã às ${new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)}`;
    }
    
    // Caso contrário, mostrar data completa
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isOverdue = () => {
    return !reminder.isCompleted && new Date(reminder.date) <= new Date();
  };

  const getStatusColor = () => {
    if (reminder.isCompleted) return colors.action.success;
    if (isOverdue()) return colors.action.logout;
    return colors.text.muted;
  };

  const getStatusText = () => {
    if (reminder.isCompleted) return 'Concluído';
    if (isOverdue()) return 'Atrasado';
    return 'Pendente';
  };

  return (
    <View style={[styles.container, reminder.isCompleted && styles.completed, isOverdue() && styles.overdue]}>
      <TouchableOpacity 
        style={styles.content} 
        onPress={() => onToggle(reminder.id)}
      >
        <View style={styles.checkbox}>
          {reminder.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, reminder.isCompleted && styles.completedText]}>
            {reminder.title}
          </Text>
          {reminder.description && (
            <Text style={[styles.description, reminder.isCompleted && styles.completedText]}>
              {reminder.description}
            </Text>
          )}
          <View style={styles.dateContainer}>
            <Text style={[styles.date, { color: getStatusColor() }]}>
              {formatDate(reminder.date)}
            </Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(reminder)}>
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.state.border,
  },
  completed: {
    opacity: 0.6,
  },
  overdue: {
    borderColor: colors.action.logout,
    borderWidth: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.action.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
  },
  checkmark: {
    color: colors.action.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  status: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionText: {
    fontSize: 16,
  },
}); 