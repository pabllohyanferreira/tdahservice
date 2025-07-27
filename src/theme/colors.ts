export const darkColors = {
  background: {
    primary: '#0F0F0F', // Fundo muito escuro
    secondary: '#1A1A1A', // Secundário escuro
    card: '#1E1E1E', // Cards escuros
    input: '#1E1E1E', // Inputs escuros
  },
  text: {
    primary: '#FFFFFF', // Texto branco
    secondary: '#E0E0E0', // Texto secundário claro
    placeholder: '#888888', // Placeholder cinza
    muted: '#AAAAAA', // Texto mudo
  },
  action: {
    primary: '#7B3FF2', // Roxo para ações
    logout: '#FF4757', // Vermelho para logout
    success: '#4CAF50', // Verde para sucesso
    addLembrete: '#00FFFF', // Ciano para adicionar
  },
  state: {
    disabled: '#555555', // Cinza escuro para desabilitado
    shadow: '#000000', // Sombra preta
    border: '#333333', // Bordas escuras
    delete: '#FF4757', // Vermelho para deletar
  },
  input: {
    background: '#1E1E1E', // Fundo escuro para inputs
    border: '#333333', // Bordas escuras
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

// Tema inspirado na imagem (tons de roxo/lavanda)
export const purpleTheme = {
  background: {
    primary: '#E6E6FA', // Fundo lavanda claro como na imagem
    secondary: '#FFFFFF', // Branco puro
    card: '#FFFFFF', // Cards brancos com sombras suaves
    input: '#FFFFFF', // Inputs brancos
    header: '#9370DB', // Cabeçalho roxo médio
  },
  text: {
    primary: '#1A0B4B', // Roxo mais escuro para melhor contraste
    secondary: '#4C1D95', // Roxo médio escuro para texto secundário
    placeholder: '#7C3AED', // Roxo médio para placeholders
    muted: '#8B5CF6', // Roxo médio para texto mudo (mais visível)
    onHeader: '#FFFFFF', // Texto branco sobre cabeçalho roxo
  },
  action: {
    primary: '#9370DB', // Roxo médio para ações principais
    logout: '#EF4444', // Vermelho para logout
    success: '#10B981', // Verde para sucesso
    addLembrete: '#8A2BE2', // Roxo vibrante para adicionar lembretes
  },
  state: {
    disabled: '#D1D5DB', // Cinza para elementos desabilitados
    shadow: '#E5E7EB', // Sombra sutil
    border: '#E5E7EB', // Bordas sutis
    delete: '#EF4444', // Vermelho para deletar
  },
  input: {
    background: '#FFFFFF', // Fundo branco para inputs
    border: '#E5E7EB', // Bordas sutis
  },
  gradient: {
    primary: ['#9370DB', '#8A2BE2'], // Gradiente roxo principal
    secondary: ['#A78BFA', '#C4B5FD'], // Gradiente roxo claro
    background: ['#E6E6FA', '#D8BFD8'], // Gradiente de fundo como na imagem
    header: ['#9370DB', '#8A2BE2'], // Gradiente do cabeçalho
  },
  pattern: {
    primary: '#9370DB', // Cor do padrão orgânico
    secondary: '#8A2BE2', // Cor secundária do padrão
  },
} as const;

export type ThemeColors = typeof darkColors | typeof lightColors | typeof purpleTheme; 