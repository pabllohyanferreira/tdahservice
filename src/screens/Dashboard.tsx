import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard({ navigation }: any) {
  const { user, signOut } = useAuth();

  // Verificação de segurança para evitar erro caso theme esteja indefinido
  if (!user) { // Changed from theme to user
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#23272F' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Erro: usuário não carregado.</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await signOut();
  };

  const handleGoToSettings = () => {
    navigation.navigate('Configuracoes');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#23272F' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#F5F6FA' }]}>Bem-vindo, {user?.name}!</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.settingsButton, { backgroundColor: '#5e4bfe' }]} onPress={handleGoToSettings}>
            <Ionicons name="settings-sharp" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#ff4757' }]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: '#F5F6FA' }]}>Seu Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#2C2F38' }]}>
            <Text style={[styles.statNumber, { color: '#5e4bfe' }]}>0</Text>
            <Text style={[styles.statLabel, { color: '#F5F6FA' }]}>Tarefas Concluídas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#2C2F38' }]}>
            <Text style={[styles.statNumber, { color: '#5e4bfe' }]}>0</Text>
            <Text style={[styles.statLabel, { color: '#F5F6FA' }]}>Tarefas Pendentes</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: '#5e4bfe' }]} 
            onPress={() => navigation.navigate('Cronograma')}
          >
            <Text style={styles.menuButtonText}>📅 Cronograma</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuButton, { backgroundColor: '#5e4bfe' }]} 
            onPress={() => navigation.navigate('AlarmesLembretes')}
          >
            <Text style={styles.menuButtonText}>⏰ Alarmes e Lembretes</Text>
          </TouchableOpacity>

          {/* Botão Menu Principal removido */}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23272F' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 60 
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginRight: 12,
    backgroundColor: '#5e4bfe',
    borderRadius: 20,
    padding: 8,
  },
  title: { fontSize: 24, color: '#F5F6FA', fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#ff4757', padding: 8, borderRadius: 6 },
  logoutText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  content: { padding: 20 },
  subtitle: { fontSize: 20, color: '#F5F6FA', marginBottom: 20 },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 30 
  },
  statCard: { 
    backgroundColor: '#2C2F38', 
    padding: 20, 
    borderRadius: 12, 
    flex: 1, 
    marginHorizontal: 5,
    alignItems: 'center'
  },
  statNumber: { fontSize: 32, color: '#5e4bfe', fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#F5F6FA', marginTop: 5 },
  menuContainer: { gap: 15 },
  menuButton: { 
    backgroundColor: '#5e4bfe', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  menuButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
}); 