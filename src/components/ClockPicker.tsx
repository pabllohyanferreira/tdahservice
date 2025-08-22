import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ClockPickerProps {
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
}

export const ClockPicker: React.FC<ClockPickerProps> = ({
  selectedTime,
  onTimeChange,
}) => {
  const { theme } = useTheme();
  const [hours, setHours] = useState(selectedTime.getHours().toString().padStart(2, '0'));
  const [minutes, setMinutes] = useState(selectedTime.getMinutes().toString().padStart(2, '0'));

  const updateTime = useCallback((newHours: string, newMinutes: string) => {
    const hoursNum = parseInt(newHours) || 0;
    const minutesNum = parseInt(newMinutes) || 0;
    
    // Validar horas (0-23)
    if (hoursNum < 0 || hoursNum > 23) {
      Alert.alert('Hora inválida', 'A hora deve estar entre 00 e 23');
      return;
    }
    
    // Validar minutos (0-59)
    if (minutesNum < 0 || minutesNum > 59) {
      Alert.alert('Minuto inválido', 'O minuto deve estar entre 00 e 59');
      return;
    }
    
    const newTime = new Date(selectedTime);
    newTime.setHours(hoursNum);
    newTime.setMinutes(minutesNum);
    onTimeChange(newTime);
  }, [selectedTime, onTimeChange]);

  const handleHoursChange = useCallback((text: string) => {
    // Permitir apenas números
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 2) {
      setHours(numericText);
      
      if (numericText.length === 2) {
        const hoursNum = parseInt(numericText);
        if (hoursNum >= 0 && hoursNum <= 23) {
          updateTime(numericText, minutes);
        }
      }
    }
  }, [minutes, updateTime]);

  const handleMinutesChange = useCallback((text: string) => {
    // Permitir apenas números
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 2) {
      setMinutes(numericText);
      
      if (numericText.length === 2) {
        const minutesNum = parseInt(numericText);
        if (minutesNum >= 0 && minutesNum <= 59) {
          updateTime(hours, numericText);
        }
      }
    }
  }, [hours, updateTime]);

  const incrementHours = useCallback(() => {
    const currentHours = parseInt(hours) || 0;
    const newHours = (currentHours + 1) % 24;
    const newHoursStr = newHours.toString().padStart(2, '0');
    setHours(newHoursStr);
    updateTime(newHoursStr, minutes);
  }, [hours, minutes, updateTime]);

  const decrementHours = useCallback(() => {
    const currentHours = parseInt(hours) || 0;
    const newHours = currentHours === 0 ? 23 : currentHours - 1;
    const newHoursStr = newHours.toString().padStart(2, '0');
    setHours(newHoursStr);
    updateTime(newHoursStr, minutes);
  }, [hours, minutes, updateTime]);

  const incrementMinutes = useCallback(() => {
    const currentMinutes = parseInt(minutes) || 0;
    const newMinutes = (currentMinutes + 1) % 60;
    const newMinutesStr = newMinutes.toString().padStart(2, '0');
    setMinutes(newMinutesStr);
    updateTime(hours, newMinutesStr);
  }, [hours, minutes, updateTime]);

  const decrementMinutes = useCallback(() => {
    const currentMinutes = parseInt(minutes) || 0;
    const newMinutes = currentMinutes === 0 ? 59 : currentMinutes - 1;
    const newMinutesStr = newMinutes.toString().padStart(2, '0');
    setMinutes(newMinutesStr);
    updateTime(hours, newMinutesStr);
  }, [hours, minutes, updateTime]);

  const setCurrentTime = useCallback(() => {
    const now = new Date();
    const newHours = now.getHours().toString().padStart(2, '0');
    const newMinutes = now.getMinutes().toString().padStart(2, '0');
    setHours(newHours);
    setMinutes(newMinutes);
    onTimeChange(now);
  }, [onTimeChange]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Selecionar Hora</Text>
        <TouchableOpacity 
          style={[styles.nowButton, { backgroundColor: theme.action.primary }]} 
          onPress={setCurrentTime}
        >
          <Text style={[styles.nowButtonText, { color: '#fff' }]}>Agora</Text>
        </TouchableOpacity>
      </View>



      <View style={styles.timeInputContainer}>
        {/* Seletor de Horas */}
        <View style={styles.timeSelector}>
          <TouchableOpacity 
            style={[styles.arrowButton, { backgroundColor: theme.background.primary }]} 
            onPress={incrementHours}
          >
            <Text style={[styles.arrowText, { color: theme.action.primary }]}>▲</Text>
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.timeInput, { 
                backgroundColor: theme.background.primary, 
                color: theme.text.primary,
                borderColor: theme.input.border
              }]}
              value={hours}
              onChangeText={handleHoursChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="00"
              placeholderTextColor={theme.text.placeholder}
              textAlign="center"
            />
            <Text style={[styles.timeLabel, { color: theme.text.secondary }]}>Horas</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.arrowButton, { backgroundColor: theme.background.primary }]} 
            onPress={decrementHours}
          >
            <Text style={[styles.arrowText, { color: theme.action.primary }]}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.separator, { color: theme.text.primary }]}>:</Text>

        {/* Seletor de Minutos */}
        <View style={styles.timeSelector}>
          <TouchableOpacity 
            style={[styles.arrowButton, { backgroundColor: theme.background.primary }]} 
            onPress={incrementMinutes}
          >
            <Text style={[styles.arrowText, { color: theme.action.primary }]}>▲</Text>
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.timeInput, { 
                backgroundColor: theme.background.primary, 
                color: theme.text.primary,
                borderColor: theme.input.border
              }]}
              value={minutes}
              onChangeText={handleMinutesChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="00"
              placeholderTextColor={theme.text.placeholder}
              textAlign="center"
            />
            <Text style={[styles.timeLabel, { color: theme.text.secondary }]}>Minutos</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.arrowButton, { backgroundColor: theme.background.primary }]} 
            onPress={decrementMinutes}
          >
            <Text style={[styles.arrowText, { color: theme.action.primary }]}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickTimeButtons}>
                  <TouchableOpacity 
            style={[styles.quickButton, { 
              backgroundColor: theme.background.primary,
              borderColor: theme.input.border
            }]} 
            onPress={() => {
              setHours('08');
              setMinutes('00');
              updateTime('08', '00');
            }}
          >
            <Text style={[styles.quickButtonText, { color: theme.text.primary }]}>08:00</Text>
          </TouchableOpacity>
          
                      <TouchableOpacity 
              style={[styles.quickButton, { 
                backgroundColor: theme.background.primary,
                borderColor: theme.input.border
              }]} 
              onPress={() => {
                setHours('12');
                setMinutes('00');
                updateTime('12', '00');
              }}
            >
            <Text style={[styles.quickButtonText, { color: theme.text.primary }]}>12:00</Text>
          </TouchableOpacity>
          
                      <TouchableOpacity 
              style={[styles.quickButton, { 
                backgroundColor: theme.background.primary,
                borderColor: theme.input.border
              }]} 
              onPress={() => {
                setHours('18');
                setMinutes('00');
                updateTime('18', '00');
              }}
            >
            <Text style={[styles.quickButtonText, { color: theme.text.primary }]}>18:00</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 280,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nowButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nowButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timeSelector: {
    alignItems: 'center',
    minWidth: 80,
  },
  arrowButton: {
    width: 44,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 6,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    marginVertical: 10,
    minHeight: 80,
  },
  timeInput: {
    width: 70,
    height: 56,
    borderRadius: 12,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  separator: {
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  quickButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 