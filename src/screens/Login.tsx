import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { GoogleButton } from '../components/GoogleButton';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, isLoading } = useAuth();

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const success = await signIn(email, password);
    if (!success) {
      Alert.alert('Erro', 'Email ou senha incorretos');
    }
  }, [email, password, signIn, navigation]);

  const handleGoogleLogin = useCallback(async () => {
    const success = await signInWithGoogle();
    if (!success) {
      Alert.alert('Erro', 'Falha no login com Google. Tente novamente.');
    }
  }, [signInWithGoogle, navigation]);

  const handleNavigateToSignUp = useCallback(() => {
    navigation.navigate('Cadastro');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Senha" 
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoComplete="password"
      />
      
      <Button
        title={isLoading ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={isLoading}
      />
      
      <GoogleButton
        onPress={handleGoogleLogin}
        disabled={isLoading}
        title={isLoading ? 'Entrando...' : 'Entrar com Google'}
      />
      
      <TouchableOpacity onPress={handleNavigateToSignUp}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#23272F' 
  },
  title: { 
    fontSize: 28, 
    color: '#fff', 
    fontWeight: 'bold', 
    marginBottom: 24 
  },
  input: { 
    width: 280, 
    height: 44, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 12 
  },
  link: { 
    color: '#007bff', 
    marginTop: 12, 
    fontSize: 15 
  },
}); 