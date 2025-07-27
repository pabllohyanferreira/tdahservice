import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useReminders } from '../contexts/ReminderContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const { width } = Dimensions.get('window');

export default function Calendario({ navigation }: any) {
  const { reminders } = useReminders();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Gerar calendário do mês atual
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ajuste para iniciar no domingo correto
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(firstDay.getDate() - dayOfWeek);

    const days = [];
    const currentDate = new Date(startDate);

    // Gerar 6 semanas (42 dias) para garantir que todas as semanas sejam mostradas
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  // Navegação entre meses
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // Funções auxiliares
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() &&
           date.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Calendário</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.action.primary }]}
          onPress={() => navigation.navigate('AlarmesLembretes')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Navegação do mês */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.monthText, { color: theme.text.primary }]}>
          {getMonthName(currentMonth)}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekDays}>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
          <Text key={index} style={[styles.weekDay, { color: theme.text.muted }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid do calendário */}
      <View style={styles.calendar}>
        {calendarDays.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.day,
              isToday(date) && { backgroundColor: theme.action.primary },
              selectedDate.getTime() === date.getTime() && { 
                borderColor: theme.action.primary,
                borderWidth: 2
              }
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text style={[
              styles.dayText,
              { color: isCurrentMonth(date) ? theme.text.primary : theme.text.muted },
              isToday(date) && { color: '#fff', fontWeight: 'bold' }
            ]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data selecionada */}
      <View style={styles.selectedDateSection}>
        <Text style={[styles.selectedDateTitle, { color: theme.text.primary }]}>
          {selectedDate.toLocaleDateString('pt-BR', { 
            weekday: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  day: {
    width: (width - 40) / 7,
    aspectRatio: 1,
    
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDateSection: {
    marginTop: 20,
    padding: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});