import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const isPastDate = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDayPress = useCallback((day: number) => {
    if (isPastDate(day)) return; // Não permitir selecionar datas passadas
    
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    onDateChange(newDate);
  }, [currentMonth, selectedDate, onDateChange]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateChange(today);
  }, [onDateChange]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Adicionar espaços vazios para os dias antes do primeiro dia do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const isPast = isPastDate(day);
      const isCurrentDay = isToday(day);
      const isSelectedDay = isSelected(day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isCurrentDay && styles.todayCell,
            isSelectedDay && styles.selectedCell,
            isPast && styles.pastDayCell,
          ]}
          onPress={() => handleDayPress(day)}
          disabled={isPast}
        >
          <Text style={[
            styles.dayText,
            isCurrentDay && styles.todayText,
            isSelectedDay && styles.selectedText,
            isPast && styles.pastDayText,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.monthContainer}>
          <Text style={styles.monthText}>{getMonthName(currentMonth)}</Text>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Hoje</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {renderCalendar()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.input.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  monthContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginRight: 12,
  },
  todayButton: {
    backgroundColor: colors.action.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayButtonText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  dayText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  todayCell: {
    backgroundColor: colors.action.primary,
    borderRadius: 20,
  },
  todayText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  selectedCell: {
    backgroundColor: colors.action.addLembrete,
    borderRadius: 20,
  },
  selectedText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  pastDayCell: {
    opacity: 0.3,
  },
  pastDayText: {
    color: colors.text.muted,
  },
}); 