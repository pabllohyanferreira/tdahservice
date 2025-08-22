import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { alarmService } from '../services/AlarmService';

export function StopAlarmButton() {
  const { theme } = useTheme();

  const stopAlarm = async () => {
    try {
      await alarmService.stopAlarmSound();
      Alert.alert('Som Parado', 'O som do alarme foi parado!');
    } catch (error) {
      console.error('Erro ao parar alarme:', error);
      Alert.alert('Erro', 'Erro ao parar alarme');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.action.logout }]}
      onPress={stopAlarm}
    >
      <Text style={styles.buttonText}>🔇 Parar Som</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 