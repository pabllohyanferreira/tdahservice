import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainApp from './src/screens/MainApp';
import { Splash } from './src/screens/Splash';
import Dashboard from './src/screens/Dashboard';
import AlarmesLembretes from './src/screens/AlarmesLembretes';
import Calendario from './src/screens/Calendario';
import Configuracoes from './src/screens/Configuracoes';
import DetalheLembrete from './src/screens/DetalheLembrete';
import Notas from './src/screens/Notas';
import Onboarding from './src/screens/Onboarding';
import { ReminderProvider } from './src/contexts/ReminderContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ToastProvider } from './src/contexts/ToastContext';
import { UserProvider, useUser } from './src/contexts/UserContext';
import {} from 'react-native-calendars';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { isLoading, isOnboardingCompleted } = useUser();

  // Mostrar splash enquanto carrega
  if (isLoading) {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isOnboardingCompleted ? "Dashboard" : "Onboarding"}
        screenOptions={{ headerShown: false }}
      >
        {!isOnboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={Onboarding} />
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="AlarmesLembretes" component={AlarmesLembretes} options={{ title: 'Alarmes e Lembretes' }} />
            <Stack.Screen name="Calendario" component={Calendario} options={{ title: 'Calendário' }} />
            <Stack.Screen name="Notas" component={Notas} options={{ title: 'Bloco de Notas' }} />
            <Stack.Screen name="DetalheLembrete" component={DetalheLembrete} options={{ title: 'Detalhe do Lembrete' }} />
            <Stack.Screen name="MainApp" component={MainApp} options={{ title: 'Menu Principal' }} />
            <Stack.Screen name="Configuracoes" component={Configuracoes} options={{ title: 'Configurações' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 6100);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <ReminderProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </ReminderProvider>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
