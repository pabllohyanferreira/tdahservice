// Serviço de autenticação offline para testes
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class OfflineAuthService {
  private users: User[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadUsers();
  }

  private async loadUsers() {
    try {
      const savedUsers = await AsyncStorage.getItem('offline_users');
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  }

  private async saveUsers() {
    try {
      await AsyncStorage.setItem('offline_users', JSON.stringify(this.users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    // Verificar se usuário já existe
    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    // Criar novo usuário
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    await this.saveUsers();

    // Gerar token simples
    const token = `offline_token_${Date.now()}`;

    return {
      user: newUser,
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Simular verificação de senha (sempre aceita)
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      // Criar usuário automaticamente se não existir
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0], // Usar parte do email como nome
        createdAt: new Date().toISOString(),
      };

      this.users.push(newUser);
      await this.saveUsers();

      const token = `offline_token_${Date.now()}`;
      return {
        user: newUser,
        token,
      };
    }

    const token = `offline_token_${Date.now()}`;
    return {
      user,
      token,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('current_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
    }
    return null;
  }

  async setCurrentUser(user: User, token: string) {
    try {
      this.currentUser = user;
      await AsyncStorage.setItem('current_user', JSON.stringify(user));
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Erro ao salvar usuário atual:', error);
    }
  }

  async logout() {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

export const offlineAuthService = new OfflineAuthService();

// Função para mostrar alerta de modo offline
export const showOfflineModeAlert = () => {
  Alert.alert(
    'Modo Offline Ativo',
    'O app está funcionando em modo offline. Algumas funcionalidades podem estar limitadas.',
    [
      {
        text: 'Entendi',
        style: 'default',
      },
    ]
  );
}; 