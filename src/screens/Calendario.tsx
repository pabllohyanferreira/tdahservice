import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useReminders } from '../contexts/ReminderContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { NotesSection } from '../components/NotesSection';

const { width } = Dimensions.get('window');

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

export default function Calendario({ navigation }: any) {
  const { reminders } = useReminders();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'reminders' | 'notes'>('reminders');

  // Formatar data para o calendário (YYYY-MM-DD)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
    
  // Função para criar data sem problemas de timezone
  const createDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day, 12, 0, 0, 0); // Meio-dia para evitar problemas de timezone
  };

  // Verificar se um dia tem lembretes
  const hasReminders = (date: Date) => {
    return reminders.some(reminder => {
      if (!reminder.dateTime || !(reminder.dateTime instanceof Date)) return false;

      // Normalizar as datas para comparar apenas dia/mês/ano
      const reminderDate = new Date(reminder.dateTime);
      const compareDate = new Date(date);
      
      return (
        reminderDate.getDate() === compareDate.getDate() &&
        reminderDate.getMonth() === compareDate.getMonth() &&
        reminderDate.getFullYear() === compareDate.getFullYear()
      );
    });
  };

  // Obter lembretes de uma data específica
  const getRemindersForDate = (date: Date) => {
    return reminders.filter(reminder => {
      if (!reminder.dateTime || !(reminder.dateTime instanceof Date)) return false;
      
      // Normalizar as datas para comparar apenas dia/mês/ano
      const reminderDate = new Date(reminder.dateTime);
      const compareDate = new Date(date);
      
    return (
        reminderDate.getDate() === compareDate.getDate() &&
        reminderDate.getMonth() === compareDate.getMonth() &&
        reminderDate.getFullYear() === compareDate.getFullYear()
    );
    });
  };

  // Criar objeto de marcações para o calendário
  const markedDates = useMemo(() => {
    const marked: any = {};
    
    // Marcar o dia selecionado
    const selectedDateStr = formatDate(selectedDate);
    marked[selectedDateStr] = {
      selected: true,
      selectedColor: theme.action.primary,
    };

    // Marcar dias com lembretes
    reminders.forEach(reminder => {
      if (reminder.dateTime && reminder.dateTime instanceof Date) {
        const dateStr = formatDate(reminder.dateTime);
        if (!marked[dateStr]) {
          marked[dateStr] = {
            marked: true,
            dotColor: reminder.isCompleted ? theme.action.success : theme.action.primary,
          };
        } else {
          // Se já tem marcação, adicionar o dot
          marked[dateStr].marked = true;
          marked[dateStr].dotColor = reminder.isCompleted ? theme.action.success : theme.action.primary;
        }
      }
    });

    return marked;
  }, [reminders, selectedDate, theme]);

  // Marcar o dia de hoje
  const today = new Date();
  const todayStr = formatDate(today);
  if (!markedDates[todayStr]) {
    markedDates[todayStr] = {
      today: true,
      todayTextColor: theme.action.primary,
    };
  } else {
    markedDates[todayStr].today = true;
    markedDates[todayStr].todayTextColor = theme.action.primary;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

        {/* Calendário Oficial */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={formatDate(createDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()))}
            onDayPress={(day) => {
              // Criar data usando a função helper para evitar problemas de timezone
              const selectedDate = createDate(day.year, day.month, day.day);
              console.log(`Dia clicado: ${day.day}/${day.month}/${day.year}`);
              console.log(`Data criada: ${selectedDate.toLocaleDateString()}`);
              setSelectedDate(selectedDate);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.background.primary,
              calendarBackground: theme.background.primary,
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

        {/* Abas Stack */}
        <View style={[styles.tabsContainer, { backgroundColor: theme.background.card }]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'reminders' && { backgroundColor: theme.action.primary }
            ]}
            onPress={() => setActiveTab('reminders')}
          >
            <Ionicons 
              name="alarm" 
              size={20} 
              color={activeTab === 'reminders' ? '#fff' : theme.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'reminders' ? '#fff' : theme.text.secondary }
            ]}>
              Lembretes
          </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'notes' && { backgroundColor: theme.action.primary }
            ]}
            onPress={() => setActiveTab('notes')}
          >
            <Ionicons 
              name="document-text" 
              size={20} 
              color={activeTab === 'notes' ? '#fff' : theme.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'notes' ? '#fff' : theme.text.secondary }
            ]}>
              Notas
            </Text>
          </TouchableOpacity>
      </View>

        {/* Conteúdo das Abas */}
        {activeTab === 'reminders' && (
          <View style={styles.tabContent}>
        <Text style={[styles.selectedDateTitle, { color: theme.text.primary }]}>
          {selectedDate.toLocaleDateString('pt-BR', { 
            weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
            
            {/* Lembretes da data selecionada */}
            {(() => {
              const dayReminders = getRemindersForDate(selectedDate);
            if (dayReminders.length === 0) {
              return (
                <View style={[styles.noRemindersContainer, { backgroundColor: theme.background.card }]}>
                  <Ionicons name="calendar-outline" size={24} color={theme.text.muted} />
                  <Text style={[styles.noRemindersText, { color: theme.text.muted }]}>
                    Nenhum lembrete para esta data
                  </Text>
                </View>
              );
            }
            
            return (
              <View style={styles.remindersContainer}>
                <Text style={[styles.remindersTitle, { color: theme.text.primary }]}>
                  Lembretes ({dayReminders.length})
                </Text>
                {dayReminders.map((reminder, index) => (
                  <View 
                    key={reminder.id} 
                    style={[styles.reminderItem, { backgroundColor: theme.background.card }]}
                  >
                    <View style={styles.reminderHeader}>
                      <Text style={[styles.reminderTitle, { color: theme.text.primary }]}>
                        {reminder.title}
                      </Text>
                      <View style={[
                        styles.reminderStatus, 
                        { backgroundColor: reminder.isCompleted ? theme.action.success : theme.action.primary }
                      ]}>
                        <Text style={styles.reminderStatusText}>
                          {reminder.isCompleted ? '✓' : '⏰'}
                        </Text>
                      </View>
                    </View>
                    {reminder.description && (
                      <Text style={[styles.reminderDescription, { color: theme.text.secondary }]}>
                        {reminder.description}
                      </Text>
                    )}
                    <Text style={[styles.reminderTime, { color: theme.text.muted }]}>
                      {reminder.dateTime?.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
          })}
        </Text>
      </View>
                ))}
              </View>
            );
          })()}
        </View>
        )}

        {activeTab === 'notes' && (
          <View style={styles.tabContent}>
            <NotesSection isVisible={true} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 40,
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
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
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
    marginRight: 12,
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  reminderIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  selectedDateSection: {
    marginTop: 20,
    padding: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 16,
  },
  noRemindersContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  noRemindersText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  remindersContainer: {
    marginTop: 8,
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reminderItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  reminderStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  reminderDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  reminderTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});