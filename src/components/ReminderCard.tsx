import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from '../types/reminder';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: () => void;  // Alterado de onPress para onEdit
  onToggle: () => void;
  onDelete: () => void;
  navigation?: any;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onEdit,  // Alterado de onPress para onEdit
  onToggle,
  onDelete,
  navigation,
}) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);
  
  // Animações para o estado de conclusão
  const [checkboxScale] = useState(new Animated.Value(1));
  const [checkboxOpacity] = useState(new Animated.Value(reminder.isCompleted ? 1 : 0));
  const [cardOpacity] = useState(new Animated.Value(reminder.isCompleted ? 0.7 : 1));
  const [strikethroughWidth] = useState(new Animated.Value(reminder.isCompleted ? 1 : 0));

  // Efeito para animar mudanças no estado de conclusão
  useEffect(() => {
    const isCompleted = reminder.isCompleted;
    
    // Animação do checkbox
    Animated.parallel([
      Animated.spring(checkboxScale, {
        toValue: isCompleted ? 1.2 : 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxOpacity, {
        toValue: isCompleted ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Volta ao tamanho normal após a animação
      if (isCompleted) {
        Animated.spring(checkboxScale, {
          toValue: 1,
          tension: 200,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }
    });

    // Animação da opacidade do card
    Animated.timing(cardOpacity, {
      toValue: isCompleted ? 0.7 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Animação do texto riscado
    Animated.timing(strikethroughWidth, {
      toValue: isCompleted ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [reminder.isCompleted]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = () => {
    if (navigation) {
      navigation.navigate('DetalheLembrete', { reminder });
    } else {
      onEdit(); // Alterado de onPress para onEdit
    }
  };

  const handleToggleWithAnimation = () => {
    // Animação de feedback imediato no checkbox
    Animated.sequence([
      Animated.spring(checkboxScale, {
        toValue: 0.8,
        tension: 400,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1.1,
        tension: 300,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Chama a função original
    onToggle();
  };

  const formatDateTime = (date: Date | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    const now = new Date();
    
    // Resetar as horas para comparar apenas as datas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = dateOnly.getTime() - nowOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Atrasado';
    } else if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Amanhã';
    } else {
      return `${diffDays} dias`;
    }
  };

  const getPriorityColor = () => {
    if (!reminder.dateTime || !(reminder.dateTime instanceof Date) || isNaN(reminder.dateTime.getTime())) {
      return theme.text.muted; // Cinza para datas inválidas
    }
    
    const now = new Date();
    const diffTime = reminder.dateTime.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours < 0) return theme.action.logout; // Atrasado
    if (diffHours < 24) return '#FF9800'; // Urgente (laranja)
    if (diffHours < 72) return '#FFC107'; // Moderado (amarelo)
    return theme.action.success; // Normal (verde)
  };

  const isOverdue = reminder.dateTime && reminder.dateTime instanceof Date && !isNaN(reminder.dateTime.getTime()) 
    ? reminder.dateTime < new Date() && !reminder.isCompleted 
    : false;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.background.card,
          transform: [{ scale: scaleAnim }],
          opacity: cardOpacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.leftSection}>
          <Animated.View
            style={[
              styles.checkboxContainer,
              {
                transform: [{ scale: checkboxScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.checkbox,
                {
                  backgroundColor: reminder.isCompleted
                    ? theme.action.success
                    : 'transparent',
                  borderColor: reminder.isCompleted
                    ? theme.action.success
                    : theme.state.border,
                },
              ]}
              onPress={handleToggleWithAnimation}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    opacity: checkboxOpacity,
                    transform: [{ scale: checkboxOpacity }],
                  },
                ]}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleContainer}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text.primary,
                  },
                ]}
                numberOfLines={2}
              >
                {reminder.title}
              </Text>
              {/* Linha animada para o efeito de riscado */}
              <Animated.View
                style={[
                  styles.strikethrough,
                  {
                    backgroundColor: theme.text.primary,
                    width: strikethroughWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            
            {reminder.description && (
              <Text
                style={[
                  styles.description,
                  { color: theme.text.secondary },
                ]}
                numberOfLines={1}
              >
                {reminder.description}
              </Text>
            )}
            
            <View style={styles.metaContainer}>
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
              <Text
                style={[
                  styles.dateTime,
                  { 
                    color: isOverdue 
                      ? theme.action.logout 
                      : theme.text.muted 
                  },
                ]}
              >
                {formatDateTime(reminder.dateTime)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.action.logout }]}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  strikethrough: {
    position: 'absolute',
    height: 1,
    top: '50%',
    left: 0,
    opacity: 0.8,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dateTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    marginLeft: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});