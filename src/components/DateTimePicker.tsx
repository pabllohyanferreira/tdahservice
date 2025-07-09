import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface DateTimePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  onDateChange,
  mode = 'datetime',
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      onDateChange(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      onDateChange(newDate);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(true);
    } else {
      // Para Android, usar o DateTimePickerAndroid
      const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
      DateTimePickerAndroid.open({
        value: date,
        onChange: handleDateChange,
        mode: 'date',
        is24Hour: true,
      });
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === 'ios') {
      setShowTimePicker(true);
    } else {
      // Para Android, usar o DateTimePickerAndroid
      const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
      DateTimePickerAndroid.open({
        value: date,
        onChange: handleTimeChange,
        mode: 'time',
        is24Hour: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
          <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
          <Text style={styles.dateButtonLabel}>Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dateButton} onPress={openTimePicker}>
          <Text style={styles.dateButtonText}>{formatTime(date)}</Text>
          <Text style={styles.dateButtonLabel}>Hora</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para iOS */}
      {Platform.OS === 'ios' && (
        <>
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalButton}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Selecionar Data</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalButton}>Concluir</Text>
                  </TouchableOpacity>
                </View>
                {/* Aqui seria o DateTimePicker nativo do iOS */}
                <View style={styles.pickerPlaceholder}>
                  <Text style={styles.pickerPlaceholderText}>
                    Seletor de Data (iOS)
                  </Text>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.modalButton}>Cancelar</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Selecionar Hora</Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.modalButton}>Concluir</Text>
                  </TouchableOpacity>
                </View>
                {/* Aqui seria o DateTimePicker nativo do iOS */}
                <View style={styles.pickerPlaceholder}>
                  <Text style={styles.pickerPlaceholderText}>
                    Seletor de Hora (iOS)
                  </Text>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.input.background,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.state.border,
  },
  dateButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateButtonLabel: {
    color: colors.text.muted,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  modalButton: {
    fontSize: 16,
    color: colors.action.primary,
    fontWeight: '600',
  },
  pickerPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.input.background,
    borderRadius: 12,
  },
  pickerPlaceholderText: {
    color: colors.text.muted,
    fontSize: 16,
  },
}); 