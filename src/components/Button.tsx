import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'google' | 'logout' | 'disabled';
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
    padding: 12,
    borderRadius: 8,
    width: 280,
    alignItems: 'center',
    marginBottom: 8,
  },
  primary: {
    backgroundColor: colors.action.primary,
  },
  google: {
    backgroundColor: colors.action.google,
  },
  logout: {
    backgroundColor: colors.action.logout,
  },
  disabled: {
    backgroundColor: colors.state.disabled,
  },
  buttonText: {
    color: colors.text.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 