import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Configuracoes() {
  const { user, signOut } = useAuth();
  const { theme, themeType, toggleTheme } = useTheme();
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
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>Configurações</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Preferências</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Tema escuro</Text>
          <Switch value={themeType === 'dark'} onValueChange={toggleTheme} />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Notificações</Text>
          <Switch value={notifications} onValueChange={handleNotificationsChange} />
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text.primary }]}>Vibração</Text>
          <Switch value={vibration} onValueChange={handleVibrationChange} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Sua Conta</Text>
        <Text style={[styles.userInfo, { color: theme.text.primary }]}>Nome: {user?.name}</Text>
        <Text style={[styles.userInfo, { color: theme.text.primary }]}>E-mail: {user?.email}</Text>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.action.logout }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Sobre o App</Text>
        <Text style={[styles.aboutText, { color: theme.text.muted }]}>TDAH Service v1.0{"\n"}Desenvolvido por Você</Text>
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