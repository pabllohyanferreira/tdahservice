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
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { ReminderCard } from '../components/ReminderCard';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { useReminders } from '../contexts/ReminderContext';
import { Reminder } from '../types/reminder';

export default function AlarmesLembretes({ navigation }: any) {
  const { reminders, createReminder, updateReminder, deleteReminder, toggleReminder } = useReminders();
  const [showModal, setShowModal] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());

  const handleAddReminder = useCallback(() => {
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    setDate(new Date());
    setShowModal(true);
  }, []);

  const handleEditReminder = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || '');
    setDate(reminder.date);
    setShowModal(true);
  }, []);

  const handleSaveReminder = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Por favor, insira um título para o lembrete');
      return;
    }

    // Verificar se a data não é no passado
    const now = new Date();
    if (date < now) {
      Alert.alert('Erro', 'A data e hora do lembrete não pode ser no passado');
      return;
    }

    try {
      let success = false;
      
      if (editingReminder) {
        success = await updateReminder(editingReminder.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          date,
        });
      } else {
        success = await createReminder({
          title: title.trim(),
          description: description.trim() || undefined,
          date,
        });
      }

      if (success) {
        setShowModal(false);
        setEditingReminder(null);
        setTitle('');
        setDescription('');
        setDate(new Date());
        Alert.alert('Sucesso', editingReminder ? 'Lembrete atualizado!' : 'Lembrete criado!');
      } else {
        Alert.alert('Erro', 'Não foi possível salvar o lembrete');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o lembrete');
    }
  }, [title, description, date, editingReminder, createReminder, updateReminder]);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRemindersByStatus = () => {
    const now = new Date();
    const pending = reminders.filter(r => !r.isCompleted && r.date > now);
    const completed = reminders.filter(r => r.isCompleted);
    const overdue = reminders.filter(r => !r.isCompleted && r.date <= now);
    
    return { pending, completed, overdue };
  };

  const { pending, completed, overdue } = getRemindersByStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lembretes</Text>
        <Button
          title="Adicionar Lembrete"
          onPress={handleAddReminder}
          variant="addLembrete"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum lembrete criado</Text>
            <Text style={styles.emptySubtext}>Toque em "Adicionar Lembrete" para criar seu primeiro lembrete</Text>
          </View>
        ) : (
          <>
            {/* Lembretes Pendentes */}
            {pending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pendentes</Text>
                {pending.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={handleToggleReminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                  />
                ))}
              </View>
            )}

            {/* Lembretes Atrasados */}
            {overdue.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.overdueTitle]}>Atrasados</Text>
                {overdue.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={handleToggleReminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                  />
                ))}
              </View>
            )}

            {/* Lembretes Concluídos */}
            {completed.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.completedTitle]}>Concluídos</Text>
                {completed.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onToggle={handleToggleReminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                  />
                ))}
              </View>
            )}
          </>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Título do lembrete"
              placeholderTextColor={colors.text.placeholder}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição (opcional)"
              placeholderTextColor={colors.text.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Botão para abrir seletor de data/hora */}
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowDateTimePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <Text style={styles.dateTimeButtonLabel}>Data e Hora</Text>
                <Text style={styles.dateTimeButtonValue}>
                  {formatDate(date)} às {formatTime(date)}
                </Text>
              </View>
              <Text style={styles.dateTimeButtonIcon}>📅</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
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
        selectedDateTime={date}
        onDateTimeChange={setDate}
        onClose={() => setShowDateTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
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
    color: colors.text.primary,
    marginBottom: 12,
  },
  overdueTitle: {
    color: colors.action.logout,
  },
  completedTitle: {
    color: colors.action.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.input.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.state.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateTimeButton: {
    backgroundColor: colors.input.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.state.border,
  },
  dateTimeButtonContent: {
    flex: 1,
  },
  dateTimeButtonLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },
  dateTimeButtonValue: {
    fontSize: 16,
    color: colors.text.primary,
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
    backgroundColor: colors.state.disabled,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});