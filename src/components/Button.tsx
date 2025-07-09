import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

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
    const baseStyle = [styles.button, styles[variant]];
    if (disabled) baseStyle.push(styles.disabled);
    if (style) baseStyle.push(style as any);
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>
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
  primary: {
    backgroundColor: colors.action.primary,
  },

  logout: {
    backgroundColor: colors.action.logout,
  },
  addLembrete: {
    backgroundColor: colors.action.addLembrete,
  },
  disabled: {
    backgroundColor: colors.state.disabled,
  },
  buttonText: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 