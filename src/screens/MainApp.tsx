import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack' with { 'resolution-mode': 'import' };

type RootStackParamList = {
  MainApp: undefined;
  UsoPessoal: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainApp'>;
};

export default function MainApp({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione uma Categoria</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UsoPessoal')}
      >
        <Text style={styles.buttonText}>Uso Pessoal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23272F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    top: 50,
    fontSize: 30,
    color: '#F5F6FA',
    fontWeight: 'bold',
    

  },
  button: {
    backgroundColor: '#5e4bfe',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

});
