import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlarmesLembretes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarmes e Lembretes</Text>
      <Text style={styles.subtitle}>Aqui você poderá adicionar e remover alarmes e lembretes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#23272F' },
  title: { fontSize: 26, color: '#F5F6FA', fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, color: '#F5F6FA' },
});