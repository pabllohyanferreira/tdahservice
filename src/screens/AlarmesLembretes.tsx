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
import { Button } from '../components/Button';
import { ReminderCard } from '../components/ReminderCard';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { useReminders } from '../contexts/ReminderContext';
import { Reminder, CreateReminderData } from '../types/reminder';
import { formatDate, formatTime } from '../utils/date';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

export default function AlarmesLembretes({ navigation }: any) {
  const { reminders, addReminder, updateReminder, deleteReminder, isLoading, toggleReminder } = useReminders();
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date());

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
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o lembrete');
      return;
    }

    // Verificar se a data não é no passado
    const now = new Date();
    if (dateTime < now) {
      Alert.alert('Erro', 'A data e hora do lembrete não pode ser no passado');
      return;
    }

    try {
      let success = false;
      
      if (editingReminder) {
        success = await updateReminder(editingReminder.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          dateTime: dateTime instanceof Date && !isNaN(dateTime.getTime()) ? dateTime : new Date(),
        });
      } else {
        const payload: CreateReminderData = {
          title: title.trim(),
          description: description.trim() || undefined,
          dateTime,
        };
        success = await addReminder(payload);
      }

      if (success) {
        setShowModal(false);
        setEditingReminder(null);
        setTitle('');
        setDescription('');
        setDateTime(new Date());
        Alert.alert('Sucesso', editingReminder ? 'Lembrete atualizado!' : 'Lembrete criado!');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o lembrete');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o lembrete');
    }
  }, [title, description, dateTime, editingReminder, addReminder, updateReminder]);

  const handleDeleteReminder = useCallback(async (id: string) => {
    const success = await deleteReminder(id);
    if (success) {
      Alert.alert('Sucesso', 'Lembrete excluído!');
    } else {
      Alert.alert('Erro', 'Não foi possível excluir o lembrete');
    }
  }, [deleteReminder]);

  const handleToggleReminder = useCallback(async (id: string) => {
    await toggleReminder(id);
  }, [toggleReminder]);

  const getRemindersByStatus = () => {
    const now = new Date();
    const pending = reminders.filter(r => !r.isCompleted && r.dateTime > now);
    const completed = reminders.filter(r => r.isCompleted);
    const overdue = reminders.filter(r => !r.isCompleted && r.dateTime <= now);
    
    return { pending, completed, overdue };
  };

  const { pending, completed, overdue } = getRemindersByStatus();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {isLoading && <LoadingSpinner />}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Lembretes</Text>
        <Button
          title="Adicionar Lembrete"
          onPress={handleAddReminder}
          variant="addLembrete"
        />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background.primary }]} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>Nenhum lembrete criado</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.muted }]}>Toque em "Adicionar Lembrete" para criar seu primeiro lembrete</Text>
          </View>
        ) : (
          reminders.map((reminder, index) => (
                  <ReminderCard
              key={reminder.id || reminder._id || index}
                    reminder={reminder}
                    onToggle={handleToggleReminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
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
          <View style={[styles.modalContent, { backgroundColor: '#373B44' }]}>
            <Text style={[styles.modalTitle, { color: '#fff' }]}>
              {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: '#4A4F59', color: '#fff', borderColor: '#5A606B' }]}
              placeholder="Título do lembrete"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: '#4A4F59', color: '#fff', borderColor: '#5A606B' }]}
              placeholder="Descrição (opcional)"
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Botão para abrir seletor de data/hora */}
            <TouchableOpacity 
              style={[styles.dateTimeButton, { backgroundColor: '#4A4F59', borderColor: '#5A606B' }]}
              onPress={() => setShowDateTimePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <Text style={[styles.dateTimeButtonLabel, { color: '#888' }]}>Data e Hora</Text>
                <Text style={[styles.dateTimeButtonValue, { color: '#fff' }]}>
                  {formatDate(dateTime)} às {formatTime(dateTime)}
                </Text>
              </View>
              <Text style={styles.dateTimeButtonIcon}>📅</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { backgroundColor: '#5A606B' }]} 
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: '#fff' }]}>Cancelar</Text>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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