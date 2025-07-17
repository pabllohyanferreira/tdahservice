import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'logout' | 'disabled' | 'addLembrete';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle: any[] = [styles.button];
    if (variant === 'primary') baseStyle.push({ backgroundColor: '#5e4bfe' });
    if (variant === 'logout') baseStyle.push({ backgroundColor: '#ff6b6b' });
    if (variant === 'addLembrete') baseStyle.push({ backgroundColor: '#4caf50' });
    if (disabled) baseStyle.push({ backgroundColor: '#e0e0e0' });
    if (style) baseStyle.push(style);
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: '#fff' }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 