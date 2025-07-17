import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true); // Simulação
  const [vibration, setVibration] = useState(true); // Simulação

  const handleLogout = async () => {
    await signOut();
  };

  const handleNotificationsChange = () => {
    setNotifications((prev) => !prev);
    Alert.alert('Notificações', `Notificações ${!notifications ? 'ativadas' : 'desativadas'}! (simulação)`);
  };

  const handleVibrationChange = () => {
    setVibration((prev) => !prev);
    Alert.alert('Vibração', `Vibração ${!vibration ? 'ativada' : 'desativada'}! (simulação)`);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#23272F' }]}>
      <Text style={[styles.title, { color: '#F5F6FA' }]}>Configurações</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#F5F6FA' }]}>Preferências</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#F5F6FA' }]}>Tema escuro</Text>
          {/* Switch removido pois não há mais tema */}
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#F5F6FA' }]}>Notificações</Text>
          <Switch value={notifications} onValueChange={handleNotificationsChange} />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#F5F6FA' }]}>Vibração</Text>
          <Switch value={vibration} onValueChange={handleVibrationChange} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#F5F6FA' }]}>Sua Conta</Text>
        <Text style={[styles.userInfo, { color: '#F5F6FA' }]}>Nome: {user?.name}</Text>
        <Text style={[styles.userInfo, { color: '#F5F6FA' }]}>E-mail: {user?.email}</Text>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#ff4757' }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#F5F6FA' }]}>Sobre o App</Text>
        <Text style={[styles.aboutText, { color: '#B0B0B0' }]}>TDAH Service v1.0{"\n"}Desenvolvido por Você</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 4,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
}); 