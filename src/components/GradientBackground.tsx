import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface GradientBackgroundProps {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'background';
  style?: any;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  children, 
  type = 'background',
  style 
}) => {
  const { theme } = useTheme();

  // Se o tema não tiver gradientes, usar fundo sólido
  if (!('gradient' in theme)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }, style]}>
        {children}
      </View>
    );
  }

  const gradientColors = theme.gradient[type];

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 