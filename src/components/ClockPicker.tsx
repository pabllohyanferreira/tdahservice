import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';

interface ClockPickerProps {
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
}

export const ClockPicker: React.FC<ClockPickerProps> = ({
  selectedTime,
  onTimeChange,
}) => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecionar Hora</Text>
        <TouchableOpacity style={styles.nowButton} onPress={setCurrentTime}>
          <Text style={styles.nowButtonText}>Agora</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeDisplay}>
        <Text style={styles.timeText}>{formatTime(selectedTime)}</Text>
      </View>

      <View style={styles.timeInputContainer}>
        {/* Seletor de Horas */}
        <View style={styles.timeSelector}>
          <TouchableOpacity style={styles.arrowButton} onPress={incrementHours}>
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.timeInput}
              value={hours}
              onChangeText={handleHoursChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#888"
              textAlign="center"
            />
            <Text style={styles.timeLabel}>Horas</Text>
          </View>
          
          <TouchableOpacity style={styles.arrowButton} onPress={decrementHours}>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.separator}>:</Text>

        {/* Seletor de Minutos */}
        <View style={styles.timeSelector}>
          <TouchableOpacity style={styles.arrowButton} onPress={incrementMinutes}>
            <Text style={styles.arrowText}>▲</Text>
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.timeInput}
              value={minutes}
              onChangeText={handleMinutesChange}
              keyboardType="numeric"
              maxLength={2}
              placeholder="00"
              placeholderTextColor="#888"
              textAlign="center"
            />
            <Text style={styles.timeLabel}>Minutos</Text>
          </View>
          
          <TouchableOpacity style={styles.arrowButton} onPress={decrementMinutes}>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickTimeButtons}>
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => {
            setHours('08');
            setMinutes('00');
            updateTime('08', '00');
          }}
        >
          <Text style={styles.quickButtonText}>08:00</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => {
            setHours('12');
            setMinutes('00');
            updateTime('12', '00');
          }}
        >
          <Text style={styles.quickButtonText}>12:00</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickButton} 
          onPress={() => {
            setHours('18');
            setMinutes('00');
            updateTime('18', '00');
          }}
        >
          <Text style={styles.quickButtonText}>18:00</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#23272F',
  },
  nowButton: {
    backgroundColor: '#5e4bfe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nowButtonText: {
    color: '#23272F',
    fontSize: 12,
    fontWeight: '600',
  },
  timeDisplay: {
    marginBottom: 20,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#23272F',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeSelector: {
    alignItems: 'center',
  },
  arrowButton: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
  },
  arrowText: {
    fontSize: 16,
    color: '#5e4bfe',
    fontWeight: 'bold',
  },
  inputContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  timeInput: {
    width: 60,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#23272F',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#B0B0B0',
  },
  timeLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '600',
  },
  separator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#23272F',
    marginHorizontal: 16,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  quickButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B0B0B0',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#23272F',
    fontWeight: '600',
  },
}); 