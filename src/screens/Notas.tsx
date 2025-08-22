import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeBackground } from '../components/ThemeBackground';
import { NotesSection } from '../components/NotesSection';

export default function Notas() {
  const { theme } = useTheme();

  return (
    <ThemeBackground>
      <View style={styles.container}>
        <NotesSection isVisible={true} />
      </View>
    </ThemeBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
}); 