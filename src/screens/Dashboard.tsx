import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useReminders } from '../contexts/ReminderContext';
import { useUser } from '../contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface DashboardProps {
  navigation: any;
}

export default function Dashboard({ navigation }: DashboardProps) {
  const { reminders } = useReminders();
  const { userData } = useUser();
  const { theme } = useTheme();
  
  // Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // Estatísticas calculadas
  const completedTasks = reminders.filter(r => r.isCompleted).length;
  const pendingTasks = reminders.filter(r => !r.isCompleted).length;
  const totalTasks = reminders.length;

  // Função para extrair primeiro e segundo nome
  const getFirstAndSecondName = (fullName: string): string => {
    if (!fullName || typeof fullName !== 'string') {
      return 'Bem-vindo';
    }
    
    // Remove espaços extras e divide por espaços
    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
    
    // Se tem apenas um nome, retorna ele
    if (nameParts.length === 1) {
      const firstName = nameParts[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    
    // Se tem dois ou mais nomes, retorna primeiro + segundo
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const secondName = nameParts[1];
      
      const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      const formattedSecondName = secondName.charAt(0).toUpperCase() + secondName.slice(1).toLowerCase();
      
      return `${formattedFirstName} ${formattedSecondName}`;
    }
    
    return 'Bem-vindo';
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingTop: 40 }}
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
                {getFirstAndSecondName(userData?.name || '')}!
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

        <View style={styles.menuContainer}>
          <TouchableOpacity 
              style={[styles.menuButton, { backgroundColor: '#4A90E2' }]} 
            onPress={() => navigation.navigate('AlarmesLembretes')}
            accessibilityLabel="Gerenciar lembretes"
            accessibilityHint="Abre a tela de alarmes e lembretes"
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="alarm" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>Alarmes e Lembretes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
              style={[styles.menuButton, { backgroundColor: '#1ABC9C' }]} 
            onPress={() => navigation.navigate('Calendario')}
            accessibilityLabel="Calendário"
            accessibilityHint="Abre a visualização do calendário"
          >
            <View style={styles.menuButtonContent}>
              <Ionicons name="calendar" size={24} color="#fff" />
              <Text style={styles.menuButtonText}>Calendário</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuButton, { backgroundColor: theme.action.primary }]} 
              onPress={() => navigation.navigate('Notas')}
              accessibilityLabel="Bloco de Notas"
              accessibilityHint="Abre o bloco de notas"
            >
              <View style={styles.menuButtonContent}>
                <Ionicons name="document-text" size={24} color="#fff" />
                <Text style={styles.menuButtonText}>Bloco de Notas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
      </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: { 
    padding: 20, 
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 10,
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
    textAlign: 'left',
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
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
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
    marginBottom: 40,
    gap: 12,
    width: '100%',
    maxWidth: 400,
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
  menuContainer: { 
    gap: 16,
    width: '100%',
    maxWidth: 400,
    marginBottom: 50,
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
    padding: 20,
  },
  motivationalContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
}); 