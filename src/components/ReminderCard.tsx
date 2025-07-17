import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
    return !reminder.isCompleted && new Date(reminder.dateTime) <= new Date();
  };

  const getStatusColor = () => {
    if (reminder.isCompleted) return '#4CAF50'; // Green for completed
    if (isOverdue()) return '#F44336'; // Red for overdue
    return '#9E9E9E'; // Gray for pending
  };

  const getStatusText = () => {
    if (reminder.isCompleted) return 'Concluído';
    if (isOverdue()) return 'Atrasado';
    return 'Pendente';
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: '#23272F', borderColor: '#373B44' },
      reminder.isCompleted && { backgroundColor: '#1A1D23' },
      isOverdue() && { borderColor: '#F44336', backgroundColor: '#2d1a1a' },
      styles.shadow
    ]}>
      <TouchableOpacity 
        style={styles.content} 
        onPress={() => onToggle(reminder.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, { borderColor: '#4CAF50', backgroundColor: '#23272F' }] }>
          {reminder.isCompleted && <Text style={[styles.checkmark, { color: '#4CAF50' }]}>✓</Text>}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: '#fff' }, reminder.isCompleted && styles.completedText]}>
            {reminder.title}
          </Text>
          {reminder.description && (
            <Text style={[styles.description, { color: '#B0B0B0' }, reminder.isCompleted && styles.completedText]}>
              {reminder.description}
            </Text>
          )}
          <View style={styles.dateContainer}>
            <Text style={[styles.date, { color: getStatusColor() }]}>
              {formatDate(reminder.dateTime)}
            </Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor() }]}> 
              <Text style={styles.badgeText}>{getStatusText()}</Text>
            </View>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  completed: {
    opacity: 0.7,
  },
  overdue: {
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
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
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
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
}); 