import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Calendar, LocaleConfig } from 'react-native-calendars';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

// Configurar localização para português brasileiro
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};

LocaleConfig.defaultLocale = 'pt-br';

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const { theme } = useTheme();

  // Formatar data para o calendário (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para criar data sem problemas de timezone
  const createDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  };

  // Criar objeto de marcações para o calendário
  const markedDates = {
    [formatDate(selectedDate)]: {
      selected: true,
      selectedColor: theme.action.primary,
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.card }]}>
      <Calendar
        current={formatDate(selectedDate)}
        onDayPress={(day) => {
          const newDate = createDate(day.year, day.month, day.day);
          newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
          onDateChange(newDate);
        }}
        markedDates={markedDates}
        theme={{
          backgroundColor: theme.background.card,
          calendarBackground: theme.background.card,
          textSectionTitleColor: theme.text.primary,
          selectedDayBackgroundColor: theme.action.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.action.primary,
          dayTextColor: theme.text.primary,
          textDisabledColor: theme.text.muted,
          dotColor: theme.action.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.action.primary,
          monthTextColor: theme.text.primary,
          indicatorColor: theme.action.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        firstDay={1} // Segunda-feira
        enableSwipeMonths={true}
        hideExtraDays={false}
        disableMonthChange={false}
        showWeekNumbers={false}
        onPressArrowLeft={(subtractMonth) => subtractMonth()}
        onPressArrowRight={(addMonth) => addMonth()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
}); 