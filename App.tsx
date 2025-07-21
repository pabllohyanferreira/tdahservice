import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainApp from './src/screens/MainApp';
import { Splash } from './src/screens/Splash';
import Login from './src/screens/Login';
import Cadastro from './src/screens/Cadastro';
import Dashboard from './src/screens/Dashboard';
import AlarmesLembretes from './src/screens/AlarmesLembretes';
import Configuracoes from './src/screens/Configuracoes';
import DetalheLembrete from './src/screens/DetalheLembrete';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ReminderProvider } from './src/contexts/ReminderContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
        
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
            <Stack.Screen name="AlarmesLembretes" component={AlarmesLembretes} options={{ title: 'Alarmes e Lembretes' }} />
            <Stack.Screen name="DetalheLembrete" component={DetalheLembrete} options={{ title: 'Detalhe do Lembrete' }} />
            <Stack.Screen name="MainApp" component={MainApp} options={{ title: 'Menu Principal' }} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} options={{ title: 'Configurações' }} />
          </>
        ) : (
          
          <>
            <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
            <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastro' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 6100);
    return () => clearTimeout(timer);
    }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ReminderProvider>
          <AppContent />
        </ReminderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
