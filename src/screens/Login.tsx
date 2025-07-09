import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
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
    if (success) {
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Erro', 'Email ou senha incorretos');
    }
  }, [email, password, signIn, navigation]);

  const handleGoogleLogin = useCallback(async () => {
    const success = await signInWithGoogle();
    if (success) {
      navigation.navigate('Dashboard');
    } else {
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
        placeholderTextColor={colors.text.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Senha" 
        placeholderTextColor={colors.text.placeholder}
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
    backgroundColor: colors.background.primary 
  },
  title: { 
    fontSize: 28, 
    color: colors.text.primary, 
    fontWeight: 'bold', 
    marginBottom: 24 
  },
  input: { 
    width: 280, 
    height: 44, 
    backgroundColor: colors.input.background, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 12 
  },
  link: { 
    color: colors.action.primary, 
    marginTop: 12, 
    fontSize: 15 
  },
}); 