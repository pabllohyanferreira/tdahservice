import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ 
  onPress, 
  disabled = false, 
  title = 'Entrar com Google' 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={[styles.text, disabled && styles.disabledText]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285f4',
    marginRight: 8,
  },
  text: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    color: '#9aa0a6',
  },
}); 