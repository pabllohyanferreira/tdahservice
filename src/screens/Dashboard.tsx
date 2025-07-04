import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard({ navigation }: any) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo, {user?.name}!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Seu Dashboard</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Tarefas Concluídas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Tarefas Pendentes</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.navigate('Cronograma')}
          >
            <Text style={styles.menuButtonText}>📅 Cronograma</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.navigate('AlarmesLembretes')}
          >
            <Text style={styles.menuButtonText}>⏰ Alarmes e Lembretes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.navigate('MainApp')}
          >
            <Text style={styles.menuButtonText}>🏠 Menu Principal</Text>
          </TouchableOpacity>
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