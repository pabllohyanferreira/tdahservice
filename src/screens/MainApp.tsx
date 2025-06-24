import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function MainApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione uma tarefa</Text>
      <Text style={styles.Text}>Bem Vindo</Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Uso Pessoal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5e4bfe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 50,
    fontSize: 30,
    color: 'white',
  },
  Text: {
    color: 'white',
    fontSize: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
