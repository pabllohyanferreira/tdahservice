import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { alarmService } from '../services/AlarmService';

const DURATION_OPTIONS = [
  { label: '35 segundos', value: 35000 },
];

export function AlarmDurationPicker() {
  const { theme } = useTheme();
  const [currentDuration, setCurrentDuration] = useState(35000);

  useEffect(() => {
    loadCurrentDuration();
  }, []);

  const loadCurrentDuration = () => {
    const duration = alarmService.getAlarmDuration();
    setCurrentDuration(duration);
  };

  const setDuration = (durationMs: number) => {
    alarmService.setAlarmDuration(durationMs);
    setCurrentDuration(durationMs);
    
    Alert.alert(
      'Duração Configurada',
      `Alarme configurado para tocar por ${durationMs / 1000} segundos`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Duração do Alarme
      </Text>
      
      <View style={styles.optionsContainer}>
        {DURATION_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              { 
                backgroundColor: currentDuration === option.value 
                  ? theme.action.primary 
                  : theme.background.card,
                borderColor: currentDuration === option.value 
                  ? theme.action.primary 
                  : theme.state.border
              }
            ]}
            onPress={() => setDuration(option.value)}
          >
            <Text style={[
              styles.optionText,
              { 
                color: currentDuration === option.value 
                  ? '#fff' 
                  : theme.text.primary 
              }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={[styles.currentText, { color: theme.text.secondary }]}>
        Duração atual: {currentDuration / 1000} segundos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  option: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
}); 