import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { CalendarPicker } from './CalendarPicker';
import { ClockPicker } from './ClockPicker';

interface DateTimePickerModalProps {
  visible: boolean;
  selectedDateTime: Date;
  onDateTimeChange: (dateTime: Date) => void;
  onClose: () => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  selectedDateTime,
  onDateTimeChange,
  onClose,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState(selectedDateTime);
  const [activeTab, setActiveTab] = useState<'calendar' | 'clock'>('calendar');

  const handleDateChange = useCallback((date: Date) => {
    const newDateTime = new Date(date);
    newDateTime.setHours(currentDateTime.getHours(), currentDateTime.getMinutes());
    setCurrentDateTime(newDateTime);
  }, [currentDateTime]);

  const handleTimeChange = useCallback((time: Date) => {
    const newDateTime = new Date(currentDateTime);
    newDateTime.setHours(time.getHours(), time.getMinutes());
    setCurrentDateTime(newDateTime);
  }, [currentDateTime]);

  const handleConfirm = useCallback(() => {
    onDateTimeChange(currentDateTime);
    onClose();
  }, [currentDateTime, onDateTimeChange, onClose]);

  const handleCancel = useCallback(() => {
    setCurrentDateTime(selectedDateTime);
    onClose();
  }, [selectedDateTime, onClose]);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Data e Hora</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeDisplay}>
            <Text style={styles.dateTimeText}>{formatDateTime(currentDateTime)}</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
              onPress={() => setActiveTab('calendar')}
            >
              <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
                📅 Calendário
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'clock' && styles.activeTab]}
              onPress={() => setActiveTab('clock')}
            >
              <Text style={[styles.tabText, activeTab === 'clock' && styles.activeTabText]}>
                🕐 Relógio
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            {activeTab === 'calendar' ? (
              <CalendarPicker
                selectedDate={currentDateTime}
                onDateChange={handleDateChange}
              />
            ) : (
              <ClockPicker
                selectedTime={currentDateTime}
                onTimeChange={handleTimeChange}
              />
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    width: '95%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.muted,
    fontWeight: 'bold',
  },
  dateTimeDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.input.background,
    borderRadius: 12,
  },
  dateTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.input.background,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.action.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.text.primary,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.state.disabled,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.action.addLembrete,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 