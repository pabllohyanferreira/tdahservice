import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { GoogleButton } from '../components/GoogleButton';
import { ThemeBackground } from '../components/ThemeBackground';
import { validateEmail, validatePassword, sanitizeString } from '../utils/validation';
import { handleJSError, showError } from '../utils/errorHandler';
import { initializeGoogleSignIn, handleGoogleSignIn } from '../services/googleAuth';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const { theme, themeType } = useTheme();

  const handleLogin = useCallback(async () => {
    try {
      // Validação de campos obrigatórios
      if (!email.trim() || !password.trim()) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
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

      // Sanitizar dados
      const sanitizedEmail = sanitizeString(email.trim().toLowerCase());
      const sanitizedPassword = sanitizeString(password);

      const success = await signIn(sanitizedEmail, sanitizedPassword);
      if (!success) {
        Alert.alert('Erro de Login', 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      }
    } catch (error) {
      const appError = handleJSError(error as Error, 'Login - Formulário');
      Alert.alert('Erro Inesperado', 'Ocorreu um erro durante o login. Tente novamente.');
      console.error('Erro no handleLogin:', appError);
    }
  }, [email, password, signIn]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const success = await signInWithGoogle();
      if (!success) {
        Alert.alert('Erro no Google Login', 'Falha no login com Google. Verifique sua conexão e tente novamente.');
      }
    } catch (error) {
      const appError = handleJSError(error as Error, 'Login - Google');
      Alert.alert('Erro no Google Login', 'Ocorreu um erro durante o login com Google. Tente novamente.');
      console.error('Erro no handleGoogleLogin:', appError);
    }
  }, [signInWithGoogle]);

  const handleNavigateToSignUp = useCallback(() => {
    navigation.navigate('Cadastro');
  }, [navigation]);

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Login</Text>
      
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
          autoComplete="email"
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
          <Text style={[styles.link, { color: theme.action.primary }]}>
            Não tem conta? Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 24 
  },
  input: { 
    width: 280, 
    height: 44, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 12,
    borderWidth: 1,
  },
  link: { 
    marginTop: 12, 
    fontSize: 15 
  },
});