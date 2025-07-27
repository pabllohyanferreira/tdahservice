import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export const PurpleThemeExample: React.FC = () => {
  const { theme, themeType, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header inspirado na imagem */}
      <View style={[styles.header, { backgroundColor: theme.background.secondary }]}>
        <Text style={[styles.greeting, { color: theme.text.primary }]}>
          Olá, {themeType === 'purple' ? 'Usuário' : 'Usuário'}!
        </Text>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          TDAH Service
        </Text>
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: theme.action.primary }]}
          onPress={toggleTheme}
        >
          <Ionicons name="color-palette" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Card principal inspirado na imagem */}
      <View style={[styles.mainCard, { backgroundColor: theme.background.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text.primary }]}>
          {themeType === 'purple' ? 'Organize suas tarefas' : 'Organize suas tarefas'}
        </Text>
        <Text style={[styles.cardSubtitle, { color: theme.text.secondary }]}>
          {themeType === 'purple' ? 'Mantenha o foco e a produtividade' : 'Mantenha o foco e a produtividade'}
        </Text>
      </View>

      {/* Cards de estatísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
          <Ionicons name="checkmark-circle" size={24} color={theme.action.success} />
          <Text style={[styles.statNumber, { color: theme.text.primary }]}>5</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Concluídas</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
          <Ionicons name="time" size={24} color={theme.action.primary} />
          <Text style={[styles.statNumber, { color: theme.text.primary }]}>3</Text>
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Pendentes</Text>
        </View>
      </View>

      {/* Botão de ação principal */}
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: theme.action.primary }]}
      >
        <Text style={styles.actionButtonText}>Criar Lembrete</Text>
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeButton: {
    padding: 12,
    borderRadius: 12,
  },
  mainCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 