export const darkColors = {
  background: {
    primary: '#181A20',
    secondary: '#23272F',
    card: '#23272F',
    input: '#23272F',
  },
  text: {
    primary: '#fff',
    secondary: '#F5F6FA',
    placeholder: '#A1A1AA',
    muted: '#B0B0B0',
  },
  action: {
    primary: '#7B3FF2',
    logout: '#ff4757',
    success: '#4CAF50',
    addLembrete: '#00ffff',
  },
  state: {
    disabled: '#888',
    shadow: '#000000',
    border: '#23272F',
    delete: '#ff4757',
  },
  input: {
    background: '#23272F',
    border: '#23272F',
  },
} as const;

export const lightColors = {
  background: {
    primary: '#F5F6FA',
    secondary: '#fff',
    card: '#fff',
    input: '#fff',
  },
  text: {
    primary: '#23272F',
    secondary: '#181A20',
    placeholder: '#888',
    muted: '#A1A1AA',
  },
  action: {
    primary: '#7B3FF2',
    logout: '#ff4757',
    success: '#4CAF50',
    addLembrete: '#7B3FF2',
  },
  state: {
    disabled: '#ccc',
    shadow: '#000000',
    border: '#E0E0E0',
    delete: '#ff4757',
  },
  input: {
    background: '#fff',
    border: '#E0E0E0',
  },
} as const;

export type ThemeColors = typeof darkColors | typeof lightColors; 