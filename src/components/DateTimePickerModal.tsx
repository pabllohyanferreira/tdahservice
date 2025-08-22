import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { CalendarPicker } from './CalendarPicker';
import { ClockPicker } from './ClockPicker';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();
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
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Data inválida';
    }
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
        <View style={[styles.modalContent, { backgroundColor: theme.background.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Selecionar Data e Hora</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={[styles.closeButton, { color: theme.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.dateTimeDisplay, { backgroundColor: theme.background.primary }]}>
              <Text style={[styles.dateTimeText, { color: theme.text.primary }]}>{formatDateTime(currentDateTime)}</Text>
            </View>

            <View style={[styles.tabContainer, { backgroundColor: theme.background.primary }]}>
              <TouchableOpacity
                style={[
                  styles.tab, 
                  activeTab === 'calendar' && [styles.activeTab, { backgroundColor: theme.action.primary }]
                ]}
                onPress={() => setActiveTab('calendar')}
              >
                <Text style={[
                  styles.tabText, 
                  { color: theme.text.secondary },
                  activeTab === 'calendar' && [styles.activeTabText, { color: theme.text.primary }]
                ]}>
                  📅 Calendário
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab, 
                  activeTab === 'clock' && [styles.activeTab, { backgroundColor: theme.action.primary }]
                ]}
                onPress={() => setActiveTab('clock')}
              >
                <Text style={[
                  styles.tabText, 
                  { color: theme.text.secondary },
                  activeTab === 'clock' && [styles.activeTabText, { color: theme.text.primary }]
                ]}>
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
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: theme.background.primary }]} 
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text.primary }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: theme.action.primary }]} 
              onPress={handleConfirm}
            >
              <Text style={[styles.confirmButtonText, { color: '#fff' }]}>Confirmar</Text>
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
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxWidth: 450,
    maxHeight: '90%',
    minHeight: 650,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateTimeDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  dateTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
    // Cor será aplicada dinamicamente
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    // Cor será aplicada dinamicamente
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pickerContainer: {
    marginBottom: 16,
    flex: 1,
    minHeight: 350,
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
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 