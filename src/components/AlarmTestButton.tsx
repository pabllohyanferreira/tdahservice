import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { alarmService } from '../services/AlarmService';
import { Audio } from 'expo-av';

interface AlarmTestButtonProps {
  title?: string;
}

export function AlarmTestButton({ title = "Testar Alarme" }: AlarmTestButtonProps) {
  const { theme } = useTheme();

  const testAlarm = async () => {
    try {
      Alert.alert(
        'Teste de Alarme',
        'Escolha como testar o alarme (duração: 35 segundos):',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Som Imediato',
            onPress: async () => {
              try {
                // Forçar recarregamento do som customizado
                await alarmService.forceReloadCustomSound();
                
                // Testar som imediatamente
                await alarmService.playAlarmSound();
                
                Alert.alert(
                  'Som Tocado', 
                  'O som do alarme foi tocado e tocará por 35 segundos!'
                );
              } catch (error) {
                Alert.alert('Erro', 'Erro ao tocar som customizado');
              }
            }
          },
          {
            text: 'Alarme em 5s',
            onPress: async () => {
              // Criar um lembrete de teste
              const testReminder = {
                id: 'test-alarm-' + Date.now(),
                title: 'Teste de Alarme',
                description: 'Este é um teste do sistema de alarme',
                dateTime: new Date(Date.now() + 5000), // 5 segundos no futuro
                isCompleted: false,
                userId: 'test',
                createdAt: new Date(),
                updatedAt: new Date(),
              };

              // Agendar alarme de teste
              const success = await alarmService.scheduleAlarm(testReminder);
              
              if (success) {
                Alert.alert(
                  'Alarme Agendado',
                  'O alarme será tocado em 5 segundos e tocará por 35 segundos. Verifique se as notificações estão ativadas!'
                );
              } else {
                Alert.alert(
                  'Erro',
                  'Não foi possível agendar o alarme. Verifique as permissões de notificação.'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro no teste de alarme:', error);
      Alert.alert('Erro', 'Erro ao testar alarme');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.action.primary }]}
      onPress={testAlarm}
    >
      <Text style={styles.buttonText}>🔔 {title}</Text>
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