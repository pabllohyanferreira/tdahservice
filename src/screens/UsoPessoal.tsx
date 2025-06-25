import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UsoPessoal() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tarefas de Uso Pessoal!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2F38',
  },
  text: {
    fontSize: 24,
    color: '#F5F6FA',
    fontWeight: 'bold',
    alignItems: ''
  },
}); 