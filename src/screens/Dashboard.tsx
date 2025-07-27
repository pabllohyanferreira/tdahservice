import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useReminders } from '../contexts/ReminderContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationManager } from '../components/NotificationManager';
import { ThemeBackground } from '../components/ThemeBackground';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { reminders } = useReminders();
  const { theme, themeType } = useTheme();
  
  // Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // Estatísticas calculadas
  const completedTasks = reminders.filter(r => r.isCompleted).length;
  const pendingTasks = reminders.filter(r => !r.isCompleted).length;
  const totalTasks = reminders.length;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Verificação de segurança para evitar erro caso theme esteja indefinido
  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.errorText, { color: theme.text.primary }]}>
          Erro: usuário não carregado.
        </Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  const handleGoToSettings = () => {
    navigation.navigate('Configuracoes');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Vamos organizar as tarefas? 📝",
      "Hora de ser produtivo! ⚡",
      "Vamos conquistar o dia! 🎯",
      "Organize, execute, conquiste! 🚀",
      "Cada tarefa é um passo para o sucesso! 💪",
      "Vamos fazer acontecer! ✨",
      "Produtividade é o caminho! 🎪",
      "Foco e determinação! 🔥"
    ];
    
    // Escolher mensagem baseada na hora do dia
    const hour = new Date().getHours();
    let index = 0;
    
    if (hour < 12) index = 0; // Manhã - organizar
    else if (hour < 15) index = 1; // Meio-dia - produtivo
    else if (hour < 18) index = 2; // Tarde - conquistar
    else index = 3; // Noite - executar
    
    return messages[index];
  };

  return (
    <ThemeBackground>
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: theme.text.secondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              {user?.name}!
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: theme.action.primary }]} 
              onPress={handleGoToSettings}
              accessibilityLabel="Configurações"
              accessibilityHint="Abre as configurações do app"
            >
              <Ionicons name="settings-sharp" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: theme.action.logout }]} 
              onPress={handleLogout}
              accessibilityLabel="Sair da conta"
              accessibilityHint="Faz logout da conta atual"
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={[styles.motivationalContainer, { backgroundColor: theme.background.card }]}>
        <Text style={[styles.subtitle, { color: theme.text.primary }]}>
            {getMotivationalMessage()}
        </Text>
        </View>
        
        <NotificationManager />
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color={theme.action.success} />
            </View>
            <Text style={[styles.statNumber, { color: theme.action.success }]}>
              {completedTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Concluídas
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={24} color={theme.action.primary} />
            </View>
            <Text style={[styles.statNumber, { color: theme.action.primary }]}>
              {pendingTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Pendentes
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="list-outline" size={24} color={theme.text.muted} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text.muted }]}>
              {totalTasks}
            </Text>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              Total
            </Text>
          </View>
        </View>

        {totalTasks === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.background.card }]}>
            <Ionicons name="add-circle-outline" size={48} color={theme.text.muted} />
            <Text style={[styles.emptyStateText, { color: theme.text.muted }]}>
              Nenhum lembrete ainda
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.text.placeholder }]}>
              Crie seu primeiro lembrete para começar
            </Text>
          </View>
        )}

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: theme.action.primary }]} 
            onPress={() => navigation.navigate('AlarmesLembretes')}
            accessibilityLabel="Gerenciar lembretes"
            accessibilityHint="Abre a tela de alarmes e lembretes"
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="alarm" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>⏰ Alarmes e Lembretes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: theme.action.success }]} 
            onPress={() => navigation.navigate('Calendario')}
            accessibilityLabel="Calendário"
            accessibilityHint="Abre a visualização do calendário"
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="calendar" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>📅 Calendário</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      </ScrollView>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#23272F' 
  },
  header: { 
    padding: 20, 
    paddingTop: 60 
  },
  headerContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greeting: { 
    fontSize: 16, 
    fontWeight: '500',
    marginBottom: 4,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold',
    lineHeight: 32,
  },
  logoutButton: { 
    padding: 12, 
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: { 
    padding: 20 
  },
  subtitle: { 
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 28,
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 32,
    gap: 12,
  },
  statCard: { 
    padding: 20, 
    borderRadius: 16, 
    flex: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: { 
    fontSize: 28, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: 12, 
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  menuContainer: { 
    gap: 16 
  },
  menuButton: { 
    padding: 20, 
    borderRadius: 16, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  motivationalContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 