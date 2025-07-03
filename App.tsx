import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainApp from './src/screens/MainApp';
import UsoPessoal from './src/screens/UsoPessoal';
import { Splash } from './src/screens/Splash';

const Stack = createNativeStackNavigator();

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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainApp">
        <Stack.Screen name="MainApp" component={MainApp} options={{ title: 'Menu Principal' }} />
        <Stack.Screen name="UsoPessoal" component={UsoPessoal} options={{ title: 'Uso Pessoal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
