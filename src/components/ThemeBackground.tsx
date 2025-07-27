import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PurpleBackground } from './PurpleBackground';

interface ThemeBackgroundProps {
  children: React.ReactNode;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ children }) => {
  const { theme, themeType } = useTheme();

  // Se for tema roxo, usar PurpleBackground
  if (themeType === 'purple') {
    return (
      <PurpleBackground showPattern={true}>
        {children}
      </PurpleBackground>
    );
  }

  // Para outros temas, usar fundo simples
  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 