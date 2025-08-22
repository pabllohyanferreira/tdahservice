import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { ReminderCard } from '../components/ReminderCard';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { useReminders } from '../contexts/ReminderContext';
import { Reminder, CreateReminderData } from '../types/reminder';
import { formatDate, formatTime } from '../utils/date';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import { validateReminder, sanitizeString } from '../utils/validation';
import { handleJSError, showError } from '../utils/errorHandler';
// Adicionar esta importação no início do arquivo
import { useToast } from '../contexts/ToastContext';

export default function AlarmesLembretes({ navigation }: any) {
  // Adicionar esta linha junto com os outros hooks
  const { showToast } = useToast();
  const { reminders, addReminder, updateReminder, deleteReminder, isLoading, toggleComplete } = useReminders();
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState('');

  const handleAddReminder = useCallback(() => {
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    setDateTime(new Date());
    setShowModal(true);
  }, []);

  const handleEditReminder = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setDateTime(reminder.dateTime);
    setShowModal(true);
  }, []);

  const handleSaveReminder = useCallback(async () => {
    try {
      const validation = validateReminder({ title, description, dateTime });
      if (!validation.isValid) {
        Alert.alert('Dados Inválidos', validation.errors.join('\n'));
        return;
      }

      const sanitizedData = {
        title: sanitizeString(title),
        description: description ? sanitizeString(description) : '',
        dateTime,
        isCompleted: false
      };
      
      if (editingReminder) {
        await updateReminder(editingReminder.id, sanitizedData);
      } else {
        await addReminder(sanitizedData);
      }

        setShowModal(false);
        setEditingReminder(null);
        setTitle('');
        setDescription('');
        setDateTime(new Date());
        Alert.alert('Sucesso', editingReminder ? 'Lembrete atualizado com sucesso!' : 'Lembrete criado com sucesso!');
      
    } catch (error) {
      const appError = handleJSError(error as Error, 'Salvar Lembrete - Formulário');
      Alert.alert('Erro Inesperado', 'Ocorreu um erro ao salvar o lembrete. Tente novamente.');
      console.error('Erro no handleSaveReminder:', appError);
    }
  }, [title, description, dateTime, editingReminder, addReminder, updateReminder]);

  const handleDeleteReminder = useCallback(async (id: string) => {
    try {
      await deleteReminder(id);
        Alert.alert('Sucesso', 'Lembrete excluído com sucesso!');
    } catch (error) {
      const appError = handleJSError(error as Error, 'Excluir Lembrete');
      Alert.alert('Erro Inesperado', 'Ocorreu um erro ao excluir o lembrete. Tente novamente.');
      console.error('Erro no handleDeleteReminder:', appError);
    }
  }, [deleteReminder]);

  // Melhorar a função handleToggleReminder para fornecer feedback ao usuário
  const handleToggleReminder = useCallback(async (id: string) => {
    try {
      setIsUpdating(id);
      
      // Buscar o lembrete atual para exibir nome na mensagem
      const currentReminder = reminders.find(r => r.id === id);
      const reminderName = currentReminder?.title || 'Lembrete';
      
      // O estado será atualizado automaticamente através do context
      // e será atualizado automaticamente quando toggleComplete for chamado
      
      await toggleComplete(id);
      
      // Feedback de sucesso
      const newStatus = currentReminder?.isCompleted ? 'reaberto' : 'concluído';
      showToast(`${reminderName} ${newStatus} com sucesso!`, 'success');
      
    } catch (error) {
      const appError = handleJSError(error as Error, 'handleToggleReminder');
      console.error('Erro no handleToggleReminder:', appError);
      showToast('Erro ao atualizar status do lembrete', 'error');
    } finally {
      setIsUpdating('');
    }
  }, [toggleComplete, reminders, showToast]);

  const getRemindersByStatus = () => {
    const now = new Date();
    
    const pending = reminders.filter(r => {
      if (r.isCompleted || !r.dateTime || !(r.dateTime instanceof Date) || isNaN(r.dateTime.getTime())) {
        return false;
      }
      
      // Para lembretes de hoje, considerar como pendente se ainda não passou da hora
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const reminderDate = new Date(r.dateTime.getFullYear(), r.dateTime.getMonth(), r.dateTime.getDate());
      
      if (reminderDate.getTime() === today.getTime()) {
        // Se é hoje, verificar se a hora ainda não passou
        return r.dateTime > now;
      }
      
      // Se não é hoje, verificar se é no futuro
      return r.dateTime > now;
    });
    
    const completed = reminders.filter(r => r.isCompleted);
    
    const overdue = reminders.filter(r => {
      if (r.isCompleted || !r.dateTime || !(r.dateTime instanceof Date) || isNaN(r.dateTime.getTime())) {
        return false;
      }
      
      return r.dateTime <= now;
    });
    
    return { pending, completed, overdue };
  };

  const { pending, completed, overdue } = getRemindersByStatus();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {isLoading && <LoadingSpinner />}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Lembretes</Text> 
      </View>

      <View style={styles.addButtonContainer}>
        <Button
          title="Adicionar Lembrete"
          onPress={handleAddReminder}
          variant="addLembrete"
        />
        
        <TouchableOpacity 
          style={[styles.calendarButton, { backgroundColor: theme.action.success }]}
          onPress={() => navigation.navigate('Calendario')}
        >
          <Ionicons name="calendar" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background.primary }]} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>Nenhum lembrete criado</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.muted }]}>Toque em "Adicionar Lembrete" para criar seu primeiro lembrete</Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onToggle={() => handleToggleReminder(reminder.id)}
              onEdit={() => handleEditReminder(reminder)}  // Alterado de onPress para onEdit
              onDelete={() => handleDeleteReminder(reminder.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal para criar/editar lembrete */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.input.background, 
                color: theme.text.primary, 
                borderColor: theme.input.border 
              }]}
              placeholder="Título do lembrete"
              placeholderTextColor={theme.text.placeholder}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: theme.input.background, 
                color: theme.text.primary, 
                borderColor: theme.input.border 
              }]}
              placeholder="Descrição (opcional)"
              placeholderTextColor={theme.text.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Botão para abrir seletor de data/hora */}
            <TouchableOpacity 
              style={[styles.dateTimeButton, { 
                backgroundColor: theme.input.background, 
                borderColor: theme.input.border 
              }]}
              onPress={() => setShowDateTimePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <Text style={[styles.dateTimeButtonLabel, { color: theme.text.placeholder }]}>Data e Hora</Text>
                <Text style={[styles.dateTimeButtonValue, { color: theme.text.primary }]}>
                  {dateTime && dateTime instanceof Date && !isNaN(dateTime.getTime()) 
                    ? `${formatDate(dateTime)} às ${formatTime(dateTime)}`
                    : 'Selecione uma data'
                  }
                </Text>
              </View>
              <Text style={styles.dateTimeButtonIcon}>📅</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: theme.background.primary }]} 
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text.primary }]}>Cancelar</Text>
              </TouchableOpacity>
              <Button
                title="Salvar"
                onPress={handleSaveReminder}
                style={styles.saveButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal do seletor de data/hora */}
      <DateTimePickerModal
        visible={showDateTimePicker}
        selectedDateTime={dateTime}
        onDateTimeChange={setDateTime}
        onClose={() => setShowDateTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: theme.background.primary, // Removido, pois theme não está disponível aqui
  },
  header: {
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  overdueTitle: {},
  completedTitle: {},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#5A606B',
  },
  dateTimeButtonContent: {
    flex: 1,
  },
  dateTimeButtonLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateTimeButtonValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeButtonIcon: {
    fontSize: 20,
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});