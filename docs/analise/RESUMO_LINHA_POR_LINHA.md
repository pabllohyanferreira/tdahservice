# 📱 RESUMO LINHA POR LINHA - TDAH Service

## 🏗️ ESTRUTURA GERAL DO PROJETO

### 📁 **Arquivo Principal: App.tsx (83 linhas)**

**Linhas 1-20: Imports e Setup**
```typescript
// 1-3: Imports do React Navigation
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 4-10: Imports das telas principais
import MainApp from './src/screens/MainApp';
import { Splash } from './src/screens/Splash';
import Login from './src/screens/Login';
import Cadastro from './src/screens/Cadastro';
import Dashboard from './src/screens/Dashboard';
import AlarmesLembretes from './src/screens/AlarmesLembretes';
import Calendario from './src/screens/Calendario';

// 11-18: Imports dos contextos e providers
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ReminderProvider } from './src/contexts/ReminderContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/contexts/ToastContext';
```

**Linhas 21-50: Navegação Condicional**
```typescript
// 21: Criação do stack navigator
const Stack = createNativeStackNavigator();

// 23-25: Componente principal com lógica de autenticação
function AppContent() {
  const { user, isLoading } = useAuth();

  // 27-29: Mostra splash enquanto carrega
  if (isLoading) {
    return <Splash />;
  }

  // 31-47: Navegação baseada no estado de autenticação
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Dashboard" : "Login"}>
        {user ? (
          // 33-39: Rotas autenticadas
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
            <Stack.Screen name="AlarmesLembretes" component={AlarmesLembretes} options={{ title: 'Alarmes e Lembretes' }} />
            <Stack.Screen name="Calendario" component={Calendario} options={{ title: 'Calendário' }} />
            <Stack.Screen name="DetalheLembrete" component={DetalheLembrete} options={{ title: 'Detalhe do Lembrete' }} />
            <Stack.Screen name="MainApp" component={MainApp} options={{ title: 'Menu Principal' }} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} options={{ title: 'Configurações' }} />
          </>
        ) : (
          // 40-43: Rotas de autenticação
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastro' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Linhas 51-83: App Principal com Providers**
```typescript
// 51-52: Componente principal com estado de splash
export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  // 54-59: Timer para mostrar splash por 6.1 segundos
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6100);
    return () => clearTimeout(timer);
  }, []);

  // 61-63: Retorna splash se ainda estiver ativo
  if (showSplash) {
    return <Splash />;
  }

  // 65-77: Providers aninhados para gerenciar estado global
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ReminderProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </ReminderProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### 📁 **AuthContext.tsx (348 linhas)**

**Linhas 1-30: Imports e Interfaces**
```typescript
// 1-7: Imports do React e hooks
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

// 8-9: Imports de utilitários
import Storage from "../utils/storage";
import { googleAuthSimple, GoogleUser } from "../utils/googleAuthSimple";

// 10-11: Imports da API
import { getApiBaseUrl, API_CONFIG } from "../config/api";
import { testConnection } from "../config/api";

// 12-15: Imports de validação
import { validateLoginData, validateSignupData, sanitizeString } from "../utils/validation";

// 16-20: Imports de tratamento de erro
import { handleApiError, handleJSError, showError, withErrorHandling } from "../utils/errorHandler";

// 22-28: Interface do usuário
interface User {
  id: string;
  name: string;
  email: string;
}

// 30-38: Interface do contexto de autenticação
interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}
```

**Linhas 40-60: Setup do Contexto**
```typescript
// 40-42: Criação do contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 44-50: Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 52-56: Provider principal
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
```

**Linhas 58-75: Carregamento de Usuário Salvo**
```typescript
// 58-75: Função para carregar usuário do storage
const loadStoredUser = useCallback(async () => {
  try {
    const storedUser = await Storage.getItem("@TDAHService:user");
    const storedToken = await Storage.getItem("@TDAHService:token");

    if (storedUser && storedToken) {
      setUser(storedUser);
    }
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
  } finally {
    setIsLoading(false);
  }
}, []);

// 77-79: Executa carregamento ao montar
useEffect(() => {
  loadStoredUser();
}, [loadStoredUser]);
```

**Linhas 81-120: Função de Login**
```typescript
// 81-85: Função de login com validação
const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
  try {
    setIsLoading(true);

    // 87-94: Validação dos dados de entrada
    const validation = validateLoginData(email, password);
    if (!validation.isValid) {
      const error = handleJSError(new Error(validation.errors.join(", ")), "Login - Validação");
      showError(error, "Dados Inválidos");
      return false;
    }

    // 96-98: Sanitização dos dados
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    const sanitizedPassword = password; // Não sanitizar senha

    // 100-102: Obter URL da API
    const apiBaseUrl = await getApiBaseUrl();
    console.log(`🔐 Tentando login em: ${apiBaseUrl}`);

    // 104-115: Requisição para o backend
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: sanitizedEmail,
        password: sanitizedPassword,
      }),
    });
```

---

## 📋 SISTEMA DE LEMBRETES

### 📁 **ReminderContext.tsx (676 linhas)**

**Linhas 1-25: Imports e Interfaces**
```typescript
// 1-6: Imports do React
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// 7-8: Imports de storage e tipos
import Storage from "../utils/storage";
import { Reminder, CreateReminderData } from "../types/reminder";

// 9-10: Imports da API
import { getApiBaseUrl, API_CONFIG } from "../config/api";
import { useNotifications } from "./NotificationContext";

// 12-15: Imports de validação
import { validateReminder, validateId, sanitizeString } from "../utils/validation";

// 17-20: Imports de tratamento de erro
import { handleApiError, handleJSError, showError, withErrorHandling } from "../utils/errorHandler";

// 22-29: Interface do contexto de lembretes
interface ReminderContextData {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (reminder: CreateReminderData) => Promise<boolean>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  toggleReminder: (id: string) => Promise<boolean>;
}
```

**Linhas 31-50: Setup do Contexto**
```typescript
// 31-36: Criação do contexto
const ReminderContext = createContext<ReminderContextData>({} as ReminderContextData);

// 38-44: Hook personalizado
export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
};

// 46-52: Provider principal
export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleReminderNotification, cancelReminderNotification } = useNotifications();
```

**Linhas 54-100: Carregamento de Lembretes**
```typescript
// 54-56: useEffect para carregar lembretes
useEffect(() => {
  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      // 59-65: Verificar token e carregar do backend ou local
      const token = await Storage.getItem("@TDAHService:token");
      if (!token) {
        const storedReminders = await Storage.getItem("@TDAHService:reminders");
        setReminders(Array.isArray(storedReminders) ? storedReminders : []);
        return;
      }

      // 67-69: Obter URL da API
      const apiBaseUrl = await getApiBaseUrl();
      console.log(`📋 Carregando lembretes de: ${apiBaseUrl}`);

      // 71-78: Requisição para o backend
      const response = await fetch(`${apiBaseUrl}/reminders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 79-95: Processar resposta
      if (response.ok) {
        const data = await response.json();
        const remindersArray = Array.isArray(data) ? data : Array.isArray(data.reminders) ? data.reminders : [];
        
        // 82-95: Mapear lembretes com validação de data
        const mappedReminders = remindersArray.map((reminder: any) => {
          let dateTime;
          if (!reminder.dateTime || isNaN(new Date(reminder.dateTime).getTime())) {
            dateTime = new Date();
          } else {
            dateTime = reminder.dateTime instanceof Date ? reminder.dateTime : new Date(reminder.dateTime);
          }

          // 90-95: Garantir ID válido
          const reminderId = reminder._id || reminder.id || Math.random().toString(36).substr(2, 9);
```

---

## 🎨 SISTEMA DE TEMAS

### 📁 **colors.ts (107 linhas)**

**Linhas 1-25: Tema Escuro**
```typescript
// 1-2: Tema escuro principal
export const darkColors = {
  background: {
    primary: '#0F0F0F', // Fundo muito escuro
    secondary: '#1A1A1A', // Secundário escuro
    card: '#1E1E1E', // Cards escuros
    input: '#1E1E1E', // Inputs escuros
  },
  text: {
    primary: '#FFFFFF', // Texto branco
    secondary: '#E0E0E0', // Texto secundário claro
    placeholder: '#888888', // Placeholder cinza
    muted: '#AAAAAA', // Texto mudo
  },
  action: {
    primary: '#7B3FF2', // Roxo para ações
    logout: '#FF4757', // Vermelho para logout
    success: '#4CAF50', // Verde para sucesso
    addLembrete: '#00FFFF', // Ciano para adicionar
  },
  state: {
    disabled: '#555555', // Cinza escuro para desabilitado
    shadow: '#000000', // Sombra preta
    border: '#333333', // Bordas escuras
    delete: '#FF4757', // Vermelho para deletar
  },
  input: {
    background: '#1E1E1E', // Fundo escuro para inputs
    border: '#333333', // Bordas escuras
  },
} as const;
```

**Linhas 27-50: Tema Claro**
```typescript
// 27-28: Tema claro
export const lightColors = {
  background: {
    primary: '#F5F6FA',
    secondary: '#fff',
    card: '#fff',
    input: '#fff',
  },
  text: {
    primary: '#23272F',
    secondary: '#181A20',
    placeholder: '#888',
    muted: '#A1A1AA',
  },
  action: {
    primary: '#7B3FF2',
    logout: '#ff4757',
    success: '#4CAF50',
    addLembrete: '#7B3FF2',
  },
  state: {
    disabled: '#ccc',
    shadow: '#000000',
    border: '#E0E0E0',
    delete: '#ff4757',
  },
  input: {
    background: '#fff',
    border: '#E0E0E0',
  },
} as const;
```

**Linhas 52-107: Tema Roxo (Principal)**
```typescript
// 52-53: Tema roxo inspirado na imagem
export const purpleTheme = {
  background: {
    primary: '#E6E6FA', // Fundo lavanda claro
    secondary: '#FFFFFF', // Branco puro
    card: '#FFFFFF', // Cards brancos com sombras
    input: '#FFFFFF', // Inputs brancos
    header: '#9370DB', // Cabeçalho roxo médio
  },
  text: {
    primary: '#1A0B4B', // Roxo escuro para contraste
    secondary: '#4C1D95', // Roxo médio escuro
    placeholder: '#7C3AED', // Roxo médio para placeholders
    muted: '#8B5CF6', // Roxo médio para texto mudo
    onHeader: '#FFFFFF', // Texto branco sobre cabeçalho
  },
  action: {
    primary: '#9370DB', // Roxo médio para ações
    logout: '#EF4444', // Vermelho para logout
    success: '#10B981', // Verde para sucesso
    addLembrete: '#8A2BE2', // Roxo vibrante
  },
  state: {
    disabled: '#D1D5DB', // Cinza para desabilitados
    shadow: '#E5E7EB', // Sombra sutil
    border: '#E5E7EB', // Bordas sutis
    delete: '#EF4444', // Vermelho para deletar
  },
  input: {
    background: '#FFFFFF', // Fundo branco para inputs
    border: '#E5E7EB', // Bordas sutis
  },
  gradient: {
    primary: ['#9370DB', '#8A2BE2'], // Gradiente roxo principal
    secondary: ['#A78BFA', '#C4B5FD'], // Gradiente roxo claro
    background: ['#E6E6FA', '#D8BFD8'], // Gradiente de fundo
    header: ['#9370DB', '#8A2BE2'], // Gradiente do cabeçalho
  },
  pattern: {
    primary: '#9370DB', // Cor do padrão orgânico
    secondary: '#8A2BE2', // Cor secundária do padrão
  },
} as const;
```

---

## 📱 TELAS PRINCIPAIS

### 📁 **Dashboard.tsx (382 linhas)**

**Linhas 1-20: Imports e Setup**
```typescript
// 1-2: Imports do React e React Native
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';

// 3-7: Imports de contextos e componentes
import { useAuth } from '../contexts/AuthContext';
import { useReminders } from '../contexts/ReminderContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationManager } from '../components/NotificationManager';

// 9-10: Imports de componentes
import { ThemeBackground } from '../components/ThemeBackground';

// 12: Obter dimensões da tela
const { width } = Dimensions.get('window');
```

**Linhas 14-30: Setup do Componente**
```typescript
// 14-15: Componente principal
export default function Dashboard({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { reminders } = useReminders();
  const { theme, themeType } = useTheme();
  
  // 19-20: Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  // 22-25: Estatísticas calculadas
  const completedTasks = reminders.filter(r => r.isCompleted).length;
  const pendingTasks = reminders.filter(r => !r.isCompleted).length;
  const totalTasks = reminders.length;
```

**Linhas 27-40: Animações de Entrada**
```typescript
// 27-28: useEffect para animações
useEffect(() => {
  // 29-40: Animação paralela de fade e slide
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }),
  ]).start();
}, []);
```

**Linhas 42-60: Funções de Navegação**
```typescript
// 42-44: Função de logout
const handleLogout = async () => {
  await signOut();
};

// 46-48: Função para ir às configurações
const handleGoToSettings = () => {
  navigation.navigate('Configuracoes');
};

// 50-55: Função para saudação baseada na hora
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

// 57-75: Função para mensagens motivacionais
const getMotivationalMessage = () => {
  const messages = [
    "Vamos organizar as tarefas? 📝",
    "Hora de ser produtivo! ⚡",
    "Vamos conquistar o dia! 🎯",
    "Organize, execute, conquiste! 🚀",
    "Cada tarefa é um passo para o sucesso! 💪",
    "Vamos fazer acontecer! ✨",
    "Produtividade é o caminho! 🎪",
    "Foco e determinação! 🔥"
  ];
  
  // 70-75: Escolher mensagem baseada na hora
  const hour = new Date().getHours();
  let index = 0;
  
  if (hour < 12) index = 0; // Manhã - organizar
  else if (hour < 15) index = 1; // Meio-dia - produtivo
  else if (hour < 18) index = 2; // Tarde - conquistar
  else index = 3; // Noite - executar
  
  return messages[index];
};
```

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### 📁 **NotificationManager.tsx (84 linhas)**

**Linhas 1-10: Imports e Setup**
```typescript
// 1-2: Imports do React e React Native
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

// 3-5: Imports de ícones e contextos
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';

// 7-8: Componente principal
export const NotificationManager: React.FC = () => {
  const { isEnabled, isLoading, enableNotifications, sendTestNotification } = useNotifications();
  const { theme } = useTheme();
```

**Linhas 10-25: Verificação de Permissões**
```typescript
// 10-11: useEffect para verificar permissões
useEffect(() => {
  // 12-20: Mostrar alerta se notificações não estiverem ativadas
  if (!isEnabled && !isLoading) {
    Alert.alert(
      'Notificações',
      'Ative as notificações para receber lembretes importantes!',
      [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Ativar', onPress: enableNotifications }
      ]
    );
  }
}, [isEnabled, isLoading, enableNotifications]);

// 22-28: Loading state
if (isLoading) {
  return (
    <View style={[styles.container, { backgroundColor: theme.background.card }]}>
      <Text style={[styles.text, { color: theme.text.secondary }]}>
        Configurando notificações...
      </Text>
    </View>
  );
}
```

**Linhas 30-50: Estados de Notificação**
```typescript
// 30-40: Estado quando notificações estão desabilitadas
if (!isEnabled) {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: '#FF9800' }]}
      onPress={enableNotifications}
    >
      <Ionicons name="notifications-off" size={24} color="#fff" />
      <Text style={styles.text}>Ativar Notificações</Text>
      <Ionicons name="chevron-forward" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

// 42-55: Estado quando notificações estão ativas
return (
  <View style={[styles.container, { backgroundColor: theme.action.success }]}>
    <Ionicons name="notifications" size={24} color="#fff" />
    <Text style={styles.text}>Notificações Ativas</Text>
    <TouchableOpacity 
      style={styles.testButton}
      onPress={sendTestNotification}
    >
      <Ionicons name="play" size={16} color="#fff" />
    </TouchableOpacity>
  </View>
);
```

---

## 🎯 COMPONENTE REMINDER CARD

### 📁 **ReminderCard.tsx (379 linhas)**

**Linhas 1-15: Imports e Interface**
```typescript
// 1-2: Imports do React e React Native
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

// 3-5: Imports de ícones e contextos
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from '../types/reminder';

// 7-13: Interface do componente
interface ReminderCardProps {
  reminder: Reminder;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  navigation?: any;
}
```

**Linhas 15-35: Setup do Componente**
```typescript
// 15-22: Componente principal
export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onEdit,
  onToggle,
  onDelete,
  navigation,
}) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);
  
  // 24-28: Animações para estado de conclusão
  const [checkboxScale] = useState(new Animated.Value(1));
  const [checkboxOpacity] = useState(new Animated.Value(reminder.isCompleted ? 1 : 0));
  const [cardOpacity] = useState(new Animated.Value(reminder.isCompleted ? 0.7 : 1));
  const [strikethroughWidth] = useState(new Animated.Value(reminder.isCompleted ? 1 : 0));
```

**Linhas 30-70: Animações de Estado**
```typescript
// 30-31: useEffect para animar mudanças no estado
useEffect(() => {
  const isCompleted = reminder.isCompleted;
  
  // 33-50: Animação do checkbox
  Animated.parallel([
    Animated.spring(checkboxScale, {
      toValue: isCompleted ? 1.2 : 1,
      tension: 300,
      friction: 8,
      useNativeDriver: true,
    }),
    Animated.timing(checkboxOpacity, {
      toValue: isCompleted ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }),
  ]).start(() => {
    // 45-50: Volta ao tamanho normal após animação
    if (isCompleted) {
      Animated.spring(checkboxScale, {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  });

  // 52-57: Animação da opacidade do card
  Animated.timing(cardOpacity, {
    toValue: isCompleted ? 0.7 : 1,
    duration: 400,
    useNativeDriver: true,
  }).start();

  // 59-65: Animação do texto riscado
  Animated.timing(strikethroughWidth, {
    toValue: isCompleted ? 1 : 0,
    duration: 500,
    useNativeDriver: false,
  }).start();
}, [reminder.isCompleted]);
```

**Linhas 67-90: Handlers de Interação**
```typescript
// 67-75: Handler de press in
const handlePressIn = () => {
  setIsPressed(true);
  Animated.spring(scaleAnim, {
    toValue: 0.95,
    useNativeDriver: true,
  }).start();
};

// 77-85: Handler de press out
const handlePressOut = () => {
  setIsPressed(false);
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
};

// 87-93: Handler de toque no card
const handleCardPress = () => {
  if (navigation) {
    navigation.navigate('DetalheLembrete', { reminder });
  } else {
    onEdit();
  }
};

// 95-110: Handler de toggle com animação
const handleToggleWithAnimation = () => {
  // 97-107: Animação de feedback imediato
  Animated.sequence([
    Animated.spring(checkboxScale, {
      toValue: 0.8,
      tension: 400,
      friction: 3,
      useNativeDriver: true,
    }),
    Animated.spring(checkboxScale, {
      toValue: 1.1,
      tension: 300,
      friction: 4,
      useNativeDriver: true,
    }),
  ]).start();

  // 109-110: Chama função original
  onToggle();
};
```

**Linhas 112-150: Funções de Formatação**
```typescript
// 112-113: Função para formatar data/hora
const formatDateTime = (date: Date | undefined) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Data inválida';
  }
  
  const now = new Date();
  
  // 119-122: Resetar horas para comparar apenas datas
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // 128-135: Retornar texto baseado na diferença
  if (diffDays < 0) {
    return 'Atrasado';
  } else if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Amanhã';
  } else {
    return `${diffDays} dias`;
  }
};

// 137-150: Função para cor de prioridade
const getPriorityColor = () => {
  if (!reminder.dateTime || !(reminder.dateTime instanceof Date) || isNaN(reminder.dateTime.getTime())) {
    return theme.text.muted; // Cinza para datas inválidas
  }
  
  const now = new Date();
  const diffTime = reminder.dateTime.getTime() - now.getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  
  if (diffHours < 0) return theme.action.logout; // Atrasado
  if (diffHours < 24) return '#FF9800'; // Urgente (laranja)
  if (diffHours < 72) return '#FFC107'; // Moderado (amarelo)
  return theme.action.success; // Normal (verde)
};
```

---

## 🔧 BACKEND - ESTRUTURA

### 📁 **app.ts (75 linhas)**

**Linhas 1-15: Imports e Setup**
```typescript
// 1-5: Imports principais
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// 6: Import de tipos
import { Request, Response, NextFunction } from 'express';

// 8-12: Imports de rotas
import authRoutes from './routes/auth';
import reminderRoutes from './routes/reminders';
import adminRoutes from './routes/admin';
import logger from './utils/logger';

// 14: Configurar variáveis de ambiente
dotenv.config();
```

**Linhas 16-25: Setup do Express**
```typescript
// 16: Criar app Express
const app = express();

// 18-20: Middleware de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());

// 22-30: Middleware de log de requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP %s %s %d %dms - IP: %s', req.method, req.originalUrl, res.statusCode, duration, req.ip);
  });
  next();
});
```

**Linhas 32-45: Middleware de Erro e Rotas**
```typescript
// 32-40: Middleware de tratamento de erros
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
});

// 42-45: Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', adminRoutes);
```

**Linhas 47-75: Health Check e Conexão MongoDB**
```typescript
// 47-50: Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 52-55: Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'TDAH Service API - Backend funcionando!' });
});

// 57-65: Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tdahservice';

mongoose.connect(MONGODB_URI)
  .then(() => logger.info('✅ Conectado ao MongoDB'))
  .catch(err => {
    logger.error('❌ Erro ao conectar ao MongoDB: %s', err.message);
    process.exit(1);
  });

// 67-75: Iniciar servidor
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger.info(`📱 API disponível em: http://localhost:${PORT}`);
  });
}
export default app;
```

---

## 📊 RESUMO ESTATÍSTICO

### 📈 **Estatísticas do Projeto:**

- **Total de Linhas de Código:** ~3,500+ linhas
- **Arquivos TypeScript:** 50+ arquivos
- **Componentes React Native:** 15+ componentes
- **Telas:** 8 telas principais
- **Contextos:** 5 contextos de estado
- **Backend:** API REST completa
- **Banco de Dados:** MongoDB com Mongoose
- **Autenticação:** JWT + Google OAuth
- **Notificações:** Push notifications
- **Temas:** 3 temas (Escuro, Claro, Roxo)

### 🎯 **Funcionalidades Principais:**

1. **Autenticação Completa**
   - Login/Registro local
   - Login com Google
   - JWT tokens
   - Recuperação de senha

2. **Sistema de Lembretes**
   - CRUD completo
   - Animações suaves
   - Prioridades visuais
   - Filtros e busca

3. **Notificações Push**
   - Agendamento automático
   - Permissões
   - Teste de notificações

4. **Sistema de Temas**
   - 3 temas diferentes
   - Transições suaves
   - Cores consistentes

5. **Dashboard Interativo**
   - Estatísticas em tempo real
   - Animações de entrada
   - Mensagens motivacionais

6. **Backend Robusto**
   - API REST completa
   - Validação de dados
   - Logging estruturado
   - Tratamento de erros

### 🚀 **Tecnologias Utilizadas:**

- **Frontend:** React Native + Expo
- **Backend:** Node.js + Express + TypeScript
- **Banco:** MongoDB + Mongoose
- **Autenticação:** JWT + Google OAuth
- **Notificações:** Expo Notifications
- **Navegação:** React Navigation
- **Estado:** React Context API
- **Animações:** React Native Animated
- **Validação:** Joi + Validação customizada
- **Logging:** Winston
- **Deploy:** Railway + Expo EAS

**Este é um projeto completo e profissional, pronto para produção! 🎉** 