import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/colors';

interface SimpleDateTimePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const SimpleDateTimePicker: React.FC<SimpleDateTimePickerProps> = ({
  date,
  onDateChange,
}) => {
  const [day, setDay] = useState(date.getDate().toString().padStart(2, '0'));
  const [month, setMonth] = useState((date.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(date.getFullYear().toString());
  const [hour, setHour] = useState(date.getHours().toString().padStart(2, '0'));
  const [minute, setMinute] = useState(date.getMinutes().toString().padStart(2, '0'));

  const updateDate = (newDay: string, newMonth: string, newYear: string, newHour: string, newMinute: string) => {
    const dayNum = parseInt(newDay) || 1;
    const monthNum = parseInt(newMonth) || 1;
    const yearNum = parseInt(newYear) || new Date().getFullYear();
    const hourNum = parseInt(newHour) || 0;
    const minuteNum = parseInt(newMinute) || 0;

    // Validações básicas
    if (dayNum < 1 || dayNum > 31) return;
    if (monthNum < 1 || monthNum > 12) return;
    if (hourNum < 0 || hourNum > 23) return;
    if (minuteNum < 0 || minuteNum > 59) return;

    const newDate = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);
    
    // Verificar se a data é válida
    if (newDate.getDate() !== dayNum || newDate.getMonth() !== monthNum - 1) {
      Alert.alert('Data Inválida', 'Por favor, insira uma data válida');
      return;
    }

    onDateChange(newDate);
  };

  const handleDayChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setDay(cleanText);
    updateDate(cleanText, month, year, hour, minute);
  };

  const handleMonthChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setMonth(cleanText);
    updateDate(day, cleanText, year, hour, minute);
  };

  const handleYearChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setYear(cleanText);
    updateDate(day, month, cleanText, hour, minute);
  };

  const handleHourChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setHour(cleanText);
    updateDate(day, month, year, cleanText, minute);
  };

  const handleMinuteChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setMinute(cleanText);
    updateDate(day, month, year, hour, cleanText);
  };

  const setCurrentDateTime = () => {
    const now = new Date();
    const newDay = now.getDate().toString().padStart(2, '0');
    const newMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const newYear = now.getFullYear().toString();
    const newHour = now.getHours().toString().padStart(2, '0');
    const newMinute = now.getMinutes().toString().padStart(2, '0');

    setDay(newDay);
    setMonth(newMonth);
    setYear(newYear);
    setHour(newHour);
    setMinute(newMinute);
    onDateChange(now);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Data e Hora</Text>
        <TouchableOpacity style={styles.nowButton} onPress={setCurrentDateTime}>
          <Text style={styles.nowButtonText}>Agora</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateTimeContainer}>
        {/* Data */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionLabel}>Data</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={day}
                onChangeText={handleDayChange}
                placeholder="DD"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.separator}>/</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={month}
                onChangeText={handleMonthChange}
                placeholder="MM"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.separator}>/</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={year}
                onChangeText={handleYearChange}
                placeholder="AAAA"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
        </View>

        {/* Hora */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionLabel}>Hora</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={hour}
                onChangeText={handleHourChange}
                placeholder="HH"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.separator}>:</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={minute}
                onChangeText={handleMinuteChange}
                placeholder="MM"
                placeholderTextColor={colors.text.placeholder}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  nowButton: {
    backgroundColor: colors.action.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nowButtonText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateSection: {
    flex: 1,
    marginRight: 8,
  },
  timeSection: {
    flex: 1,
    marginLeft: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    backgroundColor: colors.input.background,
    borderRadius: 12,
    padding: 12,
    color: colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.state.border,
    flex: 1,
  },
  separator: {
    color: colors.text.muted,
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
}); 