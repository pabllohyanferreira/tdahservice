import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeBackground } from '../components/ThemeBackground';
import { validateEmail, validatePassword, validateName, sanitizeString } from '../utils/validation';
import { handleJSError, showError } from '../utils/errorHandler';

export default function Cadastro({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, isLoading } = useAuth();
  const { theme, themeType } = useTheme();

  const handleSignUp = async () => {
    try {
      // Validação de campos obrigatórios
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos');
        return;
      }

      // Validação do nome
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        Alert.alert('Nome Inválido', nameValidation.errors.join('\n'));
        return;
      }

      // Validação do email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        Alert.alert('Email Inválido', emailValidation.errors.join('\n'));
        return;
      }

      // Validação da senha
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        Alert.alert('Senha Inválida', passwordValidation.errors.join('\n'));
        return;
      }

      // Validação de confirmação de senha
      if (password !== confirmPassword) {
        Alert.alert('Senhas Diferentes', 'A senha e a confirmação de senha devem ser iguais');
        return;
      }

      // Sanitizar dados
      const sanitizedName = sanitizeString(name.trim());
      const sanitizedEmail = sanitizeString(email.trim().toLowerCase());
      const sanitizedPassword = sanitizeString(password);

      const success = await signUp(sanitizedName, sanitizedEmail, sanitizedPassword);
      if (success) {
        Alert.alert('Sucesso', 'Conta criada com sucesso! Você já pode fazer login.');
      } else {
        Alert.alert('Erro no Cadastro', 'Este email já está cadastrado ou ocorreu um erro. Tente novamente.');
      }
    } catch (error) {
      const appError = handleJSError(error as Error, 'Cadastro - Formulário');
      Alert.alert('Erro Inesperado', 'Ocorreu um erro durante o cadastro. Tente novamente.');
      console.error('Erro no handleSignUp:', appError);
    }
  };

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Cadastro</Text>
      <TextInput 
        style={[styles.input, { 
          backgroundColor: theme.background.card,
          borderColor: theme.state.border,
          color: theme.text.primary
        }]} 
        placeholder="Nome" 
        placeholderTextColor={theme.text.placeholder}
        value={name}
        onChangeText={setName}
      />
      <TextInput 
        style={[styles.input, { 
          backgroundColor: theme.background.card,
          borderColor: theme.state.border,
          color: theme.text.primary
        }]} 
        placeholder="Email" 
        placeholderTextColor={theme.text.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput 
        style={[styles.input, { 
          backgroundColor: theme.background.card,
          borderColor: theme.state.border,
          color: theme.text.primary
        }]} 
        placeholder="Senha" 
        placeholderTextColor={theme.text.placeholder} 
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput 
        style={[styles.input, { 
          backgroundColor: theme.background.card,
          borderColor: theme.state.border,
          color: theme.text.primary
        }]} 
        placeholder="Confirmar Senha" 
        placeholderTextColor={theme.text.placeholder} 
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity 
        style={[
          styles.button, 
          { backgroundColor: theme.action.primary },
          isLoading && { backgroundColor: theme.state.disabled }
        ]} 
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.action.primary }]}>Já tem conta? Faça login</Text>
      </TouchableOpacity>
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { width: 280, height: 44, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1 },
  button: { padding: 12, borderRadius: 8, width: 280, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 12, fontSize: 15 },
}); 