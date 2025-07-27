# 🎨 Tema Roxo - Inspirado na Imagem

## 📱 Paleta de Cores Baseada na Imagem

O tema roxo foi criado inspirado na paleta de cores da imagem que você mostrou, com tons de roxo/lavanda e branco.

### 🎯 **Cores Principais**

```typescript
// Fundo
primary: '#F8F9FF'    // Fundo principal muito claro com tom lavanda
secondary: '#FFFFFF'  // Branco puro
card: '#FFFFFF'       // Cards brancos

// Texto
primary: '#2D1B69'    // Roxo escuro para texto principal
secondary: '#6B46C1'  // Roxo médio para texto secundário
placeholder: '#A78BFA' // Roxo claro para placeholders

// Ações
primary: '#7C3AED'    // Roxo vibrante para ações principais
success: '#10B981'    // Verde para sucesso
logout: '#EF4444'     // Vermelho para logout
```

### 🌈 **Gradientes Disponíveis**

```typescript
gradient: {
  primary: ['#7C3AED', '#8B5CF6'],     // Gradiente roxo principal
  secondary: ['#A78BFA', '#C4B5FD'],   // Gradiente roxo claro
  background: ['#F8F9FF', '#FFFFFF'],  // Gradiente de fundo
}
```

## 🚀 **Como Usar o Tema Roxo**

### 1. **Ativar o Tema**
```typescript
import { useTheme } from '../contexts/ThemeContext';

const { theme, themeType, toggleTheme } = useTheme();

// O tema muda automaticamente: dark → light → purple → dark
```

### 2. **Aplicar Cores**
```typescript
// Fundo
<View style={{ backgroundColor: theme.background.primary }}>

// Texto
<Text style={{ color: theme.text.primary }}>

// Botões
<TouchableOpacity style={{ backgroundColor: theme.action.primary }}>

// Cards
<View style={{ backgroundColor: theme.background.card }}>
```

### 3. **Usar Gradientes**
```typescript
import { GradientBackground } from '../components/GradientBackground';

// Gradiente de fundo
<GradientBackground type="background">
  {/* Conteúdo */}
</GradientBackground>

// Gradiente primário
<GradientBackground type="primary">
  {/* Conteúdo */}
</GradientBackground>
```

## 📋 **Arquivos Criados/Modificados**

### ✅ **Arquivos Modificados**
1. **`src/theme/colors.ts`** - Adicionado `purpleTheme`
2. **`src/contexts/ThemeContext.tsx`** - Suporte ao tema roxo

### ✅ **Arquivos Criados**
1. **`src/components/GradientBackground.tsx`** - Componente para gradientes
2. **`src/components/PurpleThemeExample.tsx`** - Exemplo de uso
3. **`TEMA_ROXO.md`** - Esta documentação

## 🎨 **Exemplo de Implementação**

### **Dashboard com Tema Roxo**
```typescript
import { PurpleThemeExample } from '../components/PurpleThemeExample';

// No seu componente
<PurpleThemeExample />
```

### **Aplicar no Dashboard Atual**
```typescript
// Em src/screens/Dashboard.tsx
const { theme, themeType, toggleTheme } = useTheme();

// O tema será aplicado automaticamente
<View style={[styles.container, { backgroundColor: theme.background.primary }]}>
```

## 🔧 **Personalização**

### **Modificar Cores**
```typescript
// Em src/theme/colors.ts
export const purpleTheme = {
  background: {
    primary: '#SUA_COR_AQUI', // Personalizar fundo
  },
  action: {
    primary: '#SUA_COR_AQUI', // Personalizar ações
  },
  // ... outras cores
};
```

### **Adicionar Novos Gradientes**
```typescript
gradient: {
  custom: ['#COR1', '#COR2', '#COR3'], // Novo gradiente
  // ... outros gradientes
}
```

## 🎯 **Características do Tema Roxo**

### ✅ **Baseado na Imagem**
- **Fundo claro** com tom lavanda sutil
- **Cards brancos** com sombras suaves
- **Texto roxo** em diferentes tonalidades
- **Botões roxos** vibrantes

### ✅ **Design Moderno**
- **Bordas arredondadas** em todos os elementos
- **Sombras sutis** para profundidade
- **Espaçamento generoso** para respiração
- **Tipografia clara** e legível

### ✅ **Acessibilidade**
- **Contraste adequado** entre texto e fundo
- **Cores semânticas** (verde para sucesso, vermelho para erro)
- **Tamanhos de fonte** apropriados

## 🚀 **Como Testar**

1. **Ativar o tema roxo**:
   - Vá para **Configurações**
   - Toque no switch "Tema escuro" várias vezes
   - O tema mudará: escuro → claro → roxo → escuro

2. **Ver o resultado**:
   - Fundo mudará para tom lavanda claro
   - Cards ficarão brancos
   - Textos ficarão em tons de roxo
   - Botões ficarão roxos vibrantes

3. **Usar gradientes**:
   - Importe `GradientBackground`
   - Aplique nos componentes desejados

## 🎉 **Resultado Final**

O tema roxo oferece:
- ✅ **Visual moderno** e clean
- ✅ **Inspirado na imagem** que você mostrou
- ✅ **Fácil implementação** com sistema de temas existente
- ✅ **Gradientes opcionais** para efeitos especiais
- ✅ **Totalmente responsivo** e acessível

**Agora você tem um tema roxo completo baseado na paleta da sua imagem!** 🎨 