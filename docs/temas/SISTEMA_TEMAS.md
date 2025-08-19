 # 🎨 Sistema de Temas - TDAH Service

## 📱 **Visão Geral**

O TDAH Service agora possui um sistema completo de temas com **3 opções**:
- 🌙 **Tema Escuro** (padrão)
- ☀️ **Tema Claro** 
- 🎨 **Tema Roxo** (inspirado na imagem)

## 🚀 **Como Usar**

### **1. Selecionar Tema nas Configurações**

1. Abra o app
2. Vá para **Configurações** (ícone de engrenagem)
3. Na seção **"Aparência"**, você verá 3 botões:
   - 🌙 **Escuro** - Tema escuro padrão
   - ☀️ **Claro** - Tema claro
   - 🎨 **Roxo** - Tema roxo inspirado na imagem

4. Toque no tema desejado para ativá-lo

### **2. Mudança Automática**

O tema selecionado será:
- ✅ **Salvo automaticamente** no dispositivo
- ✅ **Aplicado em todas as telas** do app
- ✅ **Restaurado** na próxima abertura do app

## 🎯 **Temas Disponíveis**

### 🌙 **Tema Escuro**
```typescript
// Cores principais
background.primary: '#181A20'    // Fundo principal escuro
background.card: '#23272F'       // Cards escuros
text.primary: '#fff'             // Texto branco
action.primary: '#7B3FF2'        // Botões roxos
```

### ☀️ **Tema Claro**
```typescript
// Cores principais
background.primary: '#F5F6FA'    // Fundo claro
background.card: '#fff'          // Cards brancos
text.primary: '#23272F'          // Texto escuro
action.primary: '#7B3FF2'        // Botões roxos
```

### 🎨 **Tema Roxo (Inspirado na Imagem)**
```typescript
// Cores principais
background.primary: '#F8F9FF'    // Fundo lavanda claro
background.card: '#FFFFFF'       // Cards brancos
text.primary: '#2D1B69'          // Texto roxo escuro
action.primary: '#7C3AED'        // Botões roxo vibrante
gradient.primary: ['#7C3AED', '#8B5CF6'] // Gradientes roxos
```

## 📋 **Telas com Tema Aplicado**

### ✅ **Telas Completamente Tematizadas**
1. **Dashboard** - Tela principal com estatísticas
2. **Configurações** - Seleção de temas e preferências
3. **Login** - Tela de autenticação
4. **Cadastro** - Tela de criação de conta
5. **Alarmes e Lembretes** - Gerenciamento de lembretes
6. **Calendário** - Visualização do calendário
7. **Detalhe do Lembrete** - Informações detalhadas
8. **MainApp** - Tela de seleção de categoria

### 🎬 **Telas Especiais**
- **Splash** - Usa vídeo, não precisa de tema

## 🔧 **Implementação Técnica**

### **Arquivos Principais**
```typescript
// Definição dos temas
src/theme/colors.ts

// Contexto do tema
src/contexts/ThemeContext.tsx

// Componente de gradientes
src/components/GradientBackground.tsx
```

### **Como Aplicar em Novas Telas**
```typescript
import { useTheme } from '../contexts/ThemeContext';

export default function MinhaTela() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Meu Título
      </Text>
    </View>
  );
}
```

### **Usar Gradientes (Opcional)**
```typescript
import { GradientBackground } from '../components/GradientBackground';

<GradientBackground type="background">
  {/* Conteúdo */}
</GradientBackground>
```

## 🎨 **Características dos Temas**

### **Tema Escuro**
- ✅ **Ideal para uso noturno**
- ✅ **Economia de bateria** (OLED)
- ✅ **Menos cansaço visual**
- ✅ **Contraste alto**

### **Tema Claro**
- ✅ **Ideal para uso diurno**
- ✅ **Melhor legibilidade** em ambientes claros
- ✅ **Design clean** e minimalista
- ✅ **Aparência profissional**

### **Tema Roxo**
- ✅ **Inspirado na imagem** fornecida
- ✅ **Design moderno** e elegante
- ✅ **Paleta roxo/lavanda** harmoniosa
- ✅ **Gradientes opcionais** para efeitos especiais

## 🚀 **Funcionalidades**

### **Seleção de Tema**
- ✅ **3 opções** de tema
- ✅ **Interface visual** com ícones
- ✅ **Seleção direta** (não precisa alternar)
- ✅ **Feedback visual** do tema ativo

### **Persistência**
- ✅ **Salvo automaticamente** no AsyncStorage
- ✅ **Restaurado** na abertura do app
- ✅ **Sincronizado** entre todas as telas

### **Aplicação Automática**
- ✅ **Todas as telas** recebem o tema
- ✅ **Componentes** adaptam-se automaticamente
- ✅ **Cores dinâmicas** baseadas no tema

## 🎯 **Exemplo de Uso**

### **Antes (Cores Hardcoded)**
```typescript
<View style={{ backgroundColor: '#23272F' }}>
  <Text style={{ color: '#fff' }}>Título</Text>
</View>
```

### **Depois (Tema Dinâmico)**
```typescript
const { theme } = useTheme();

<View style={{ backgroundColor: theme.background.primary }}>
  <Text style={{ color: theme.text.primary }}>Título</Text>
</View>
```

## 🎉 **Benefícios**

### **Para o Usuário**
- ✅ **Personalização** da experiência
- ✅ **Conforto visual** em diferentes ambientes
- ✅ **Acessibilidade** melhorada
- ✅ **Preferências** salvas

### **Para o Desenvolvedor**
- ✅ **Código limpo** sem cores hardcoded
- ✅ **Manutenção fácil** de temas
- ✅ **Escalabilidade** para novos temas
- ✅ **Consistência** visual

## 🔮 **Futuras Melhorias**

### **Possíveis Adições**
- 🌈 **Mais temas** (verde, azul, etc.)
- 🎨 **Temas personalizados** pelo usuário
- 🌅 **Tema automático** baseado na hora
- 📱 **Tema do sistema** (iOS/Android)

### **Otimizações**
- ⚡ **Performance** melhorada
- 🎯 **Acessibilidade** aprimorada
- 📐 **Animações** de transição
- 🎪 **Efeitos visuais** especiais

## 🎊 **Resultado Final**

O TDAH Service agora oferece:
- ✅ **3 temas completos** e funcionais
- ✅ **Interface intuitiva** para seleção
- ✅ **Aplicação automática** em todas as telas
- ✅ **Persistência** das preferências
- ✅ **Design consistente** e profissional

**O sistema de temas está 100% funcional e pronto para uso!** 🎨✨