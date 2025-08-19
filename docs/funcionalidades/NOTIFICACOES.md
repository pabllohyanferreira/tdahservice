# 🔔 Sistema de Notificações - TDAH Service

## 📱 Funcionalidades Implementadas

### ✅ Notificações Locais
- **Agendamento automático** de notificações para lembretes
- **Notificações de teste** para verificar funcionamento
- **Gerenciamento de permissões** automático
- **Integração com lembretes** - notificações são criadas automaticamente

### ✅ Configurações de Notificação
- **Ativar/Desativar** notificações
- **Teste de notificação** imediata
- **Status visual** no Dashboard
- **Persistência** das configurações

### ✅ Integração com Lembretes
- **Notificação automática** ao criar lembrete
- **Cancelamento automático** ao deletar lembrete
- **Reagendamento** ao editar lembrete
- **Validação de data** (não agenda para datas passadas)

## 🛠️ Como Funciona

### 1. Estrutura de Arquivos
```
src/
├── contexts/
│   └── NotificationContext.tsx    # Contexto principal
├── components/
│   └── NotificationManager.tsx    # Componente de UI
├── services/
│   └── NotificationService.ts     # Serviço de notificações
└── screens/
    └── Configuracoes.tsx          # Tela de configurações
```

### 2. Fluxo de Notificações

#### Criação de Lembrete
```
Usuário cria lembrete → ReminderContext → NotificationContext → Expo Notifications
```

#### Recebimento de Notificação
```
Expo Notifications → Sistema do dispositivo → Usuário vê notificação
```

### 3. Configuração Automática
- **Primeira execução**: Solicita permissões
- **Permissão negada**: Mostra alerta explicativo
- **Permissão concedida**: Configura canal Android e salva token

## 📋 Funcionalidades Detalhadas

### 🔧 NotificationContext
```typescript
interface NotificationContextData {
  isEnabled: boolean;                    // Status das notificações
  isLoading: boolean;                    // Estado de carregamento
  expoPushToken: string | null;          // Token do Expo
  enableNotifications: () => Promise<void>;     // Ativar notificações
  disableNotifications: () => Promise<void>;    // Desativar notificações
  scheduleReminderNotification: (reminder: Reminder) => Promise<string | null>;
  cancelReminderNotification: (reminderId: string) => Promise<void>;
  sendTestNotification: () => Promise<void>;    // Teste imediato
  checkPermissions: () => Promise<PermissionStatus>;
}
```

### 🎯 NotificationManager
- **Status visual** no Dashboard
- **Botão de ativação** se desabilitado
- **Botão de teste** se habilitado
- **Alerta automático** para ativar notificações

### ⚙️ Configurações
- **Switch** para ativar/desativar
- **Botão de teste** de notificação
- **Texto explicativo** sobre funcionalidades
- **Estado de carregamento** durante operações

## 🚀 Como Usar

### 1. Ativar Notificações
1. Vá para **Configurações**
2. Ative o switch **"Notificações"**
3. Conceda permissão quando solicitado
4. Teste com o botão **"Enviar Notificação de Teste"**

### 2. Criar Lembrete com Notificação
1. Vá para **Alarmes e Lembretes**
2. Crie um novo lembrete
3. Defina data/hora futura
4. A notificação será agendada automaticamente

### 3. Gerenciar Notificações
- **Editar lembrete**: Notificação é reagendada
- **Deletar lembrete**: Notificação é cancelada
- **Completar lembrete**: Notificação é cancelada

## 🔧 Configuração Técnica

### Expo Notifications
```json
// package.json
{
  "dependencies": {
    "expo-notifications": "^0.31.3",
    "expo-device": "^7.1.4"
  }
}
```

### 🔑 Token Push (Opcional)
Para **desenvolvimento local**, o token push não é necessário. As notificações locais funcionam perfeitamente sem ele.

Para **produção** com push notifications via servidor:
```typescript
// Descomente esta linha em NotificationContext.tsx
const token = await Notifications.getExpoPushTokenAsync({ 
  projectId: 'seu-project-id-aqui' 
});
```

### Permissões Android
```xml
<!-- app.json -->
{
  "expo": {
    "android": {
      "permissions": [
        "NOTIFICATIONS",
        "VIBRATE",
        "WAKE_LOCK"
      ]
    }
  }
}
```

### Canal de Notificação Android
```typescript
Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
});
```

## 🎨 Interface do Usuário

### Dashboard
- **Card de status** das notificações
- **Botão de ativação** se desabilitado
- **Botão de teste** se habilitado
- **Cores temáticas** (verde = ativo, laranja = inativo)

### Configurações
- **Seção dedicada** para notificações
- **Switch principal** para ativar/desativar
- **Botão de teste** com ícone
- **Texto explicativo** sobre funcionalidades

## 🔍 Debug e Testes

### Verificar Status
```typescript
const { isEnabled, expoPushToken } = useNotifications();
console.log('Notificações ativas:', isEnabled);
console.log('Token:', expoPushToken);
```

### Teste Manual
1. Vá para **Configurações**
2. Clique em **"Enviar Notificação de Teste"**
3. Verifique se a notificação aparece

### Logs de Debug
```typescript
// No console do React Native
console.log('Notificação agendada:', notificationId);
console.log('Token de notificação:', expoPushToken);
console.log('Permissões:', permissionStatus);
```

## 🚨 Solução de Problemas

### Notificação não aparece
1. **Verificar permissões**: Vá em Configurações do dispositivo
2. **Verificar token**: Console deve mostrar token válido
3. **Testar manualmente**: Use botão de teste
4. **Verificar data**: Lembrete deve ter data futura

### Erro de permissão
1. **Reiniciar app**: Às vezes resolve problemas de permissão
2. **Configurações do dispositivo**: Verificar se notificações estão ativas
3. **Reinstalar app**: Em casos extremos

### Notificação não agendada
1. **Verificar data**: Deve ser no futuro
2. **Verificar status**: Notificações devem estar ativas
3. **Verificar logs**: Console deve mostrar erros

## 🔮 Próximas Funcionalidades

### Planejadas
- [ ] **Notificações antecipadas** (15 min antes)
- [ ] **Sons personalizados** para diferentes tipos
- [ ] **Vibração configurável**
- [ ] **Notificações recorrentes**
- [ ] **Push notifications** via servidor

### Melhorias
- [ ] **Categorias de notificação**
- [ ] **Prioridades configuráveis**
- [ ] **Horários de silêncio**
- [ ] **Backup de configurações**

## 📊 Status Atual

### ✅ Implementado
- [x] Notificações locais básicas
- [x] Agendamento automático
- [x] Gerenciamento de permissões
- [x] Interface de configuração
- [x] Integração com lembretes
- [x] Teste de notificação
- [x] Status visual no Dashboard

### 🔄 Em Desenvolvimento
- [ ] Push notifications
- [ ] Notificações antecipadas
- [ ] Configurações avançadas

### 📋 Pendente
- [ ] Testes em dispositivos físicos
- [ ] Otimização de performance
- [ ] Documentação de API

## 🎉 Conclusão

O sistema de notificações está **funcionalmente completo** e integrado ao app TDAH Service. As notificações são agendadas automaticamente quando lembretes são criados, e o usuário tem controle total sobre as configurações através da interface amigável.

**Principais benefícios:**
- ✅ **Automático**: Não requer configuração manual
- ✅ **Confiável**: Validações e tratamento de erros
- ✅ **Flexível**: Fácil ativar/desativar
- ✅ **Integrado**: Funciona perfeitamente com lembretes
- ✅ **Testável**: Botão de teste para verificar funcionamento 