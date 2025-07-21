import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { formatDate, formatTime } from '../utils/date';
import { useTheme } from '../contexts/ThemeContext';

export default function DetalheLembrete({ route }: { route: RouteProp<any, any> }) {
  const { reminder } = route.params;
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}> 
      <Text style={[styles.title, { color: theme.text.primary }]}>{reminder.title}</Text>
      <Text style={[styles.label, { color: theme.text.muted }]}>Descrição:</Text>
      <Text style={[styles.description, { color: theme.text.primary }]}>{reminder.description || 'Sem descrição'}</Text>
      <Text style={[styles.label, { color: theme.text.muted }]}>Data:</Text>
      <Text style={[styles.value, { color: theme.text.primary }]}>{formatDate(new Date(reminder.dateTime))}</Text>
      <Text style={[styles.label, { color: theme.text.muted }]}>Hora:</Text>
      <Text style={[styles.value, { color: theme.text.primary }]}>{formatTime(new Date(reminder.dateTime))}</Text>
      <Text style={[styles.label, { color: theme.text.muted }]}>Status:</Text>
      <Text style={[styles.value, { color: theme.text.primary }]}>{reminder.isCompleted ? 'Concluído' : 'Pendente'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272F',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#B0B0B0',
    marginTop: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
}); 