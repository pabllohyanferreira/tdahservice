import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Cronograma() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu Cronograma</Text>
      <Text style={styles.subtitle}>Aqui você poderá visualizar e editar seus cronogramas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#23272F' },
  title: { fontSize: 26, color: '#F5F6FA', fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, color: '#F5F6FA' },
}); 