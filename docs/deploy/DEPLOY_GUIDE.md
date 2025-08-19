# 🚀 Guia de Deploy - TDAH Service

Este guia te ajudará a colocar seu projeto em produção para que outras pessoas possam usar.

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Expo (gratuita)
- Conta no MongoDB Atlas (gratuita)
- Conta no Railway/Render/Vercel (para backend)
- Conta no Google Cloud Console (para autenticação)

## 🏗️ Estrutura do Projeto

```
tdahservice/
├── frontend/          # App React Native (Expo)
└── backend/           # API Node.js/Express
```

## 🔧 1. Preparação do Backend

### 1.1 Configurar Variáveis de Ambiente

Crie um arquivo `.env` no backend:

```bash
# Backend/.env
PORT=3000
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster.mongodb.net/tdahservice
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_2024
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
NODE_ENV=production
```

### 1.2 Configurar MongoDB Atlas

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie uma conta gratuita
3. Crie um cluster (gratuito)
4. Configure usuário e senha
5. Configure IP whitelist (0.0.0.0/0 para produção)
6. Copie a string de conexão

### 1.3 Deploy do Backend

#### Opção A: Railway (Recomendado)

1. Acesse [Railway](https://railway.app)
2. Conecte seu repositório GitHub
3. Selecione a pasta `backend`
4. Configure as variáveis de ambiente
5. Deploy automático

#### Opção B: Render

1. Acesse [Render](https://render.com)
2. Crie um novo Web Service
3. Conecte seu repositório
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node

#### Opção C: Vercel

1. Acesse [Vercel](https://vercel.com)
2. Importe o projeto
3. Configure as variáveis de ambiente
4. Deploy

## 📱 2. Preparação do Frontend

### 2.1 Configurar Expo

1. Instale o EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Faça login no Expo:
```bash
eas login
```

3. Configure o projeto:
```bash
eas build:configure
```

### 2.2 Atualizar Configuração da API

Edite `src/config/api.ts`:

```typescript
const POSSIBLE_ENDPOINTS = [
  'https://seu-backend.railway.app/api',  // URL do seu backend
  'https://seu-backend.onrender.com/api', // URL alternativa
  'http://localhost:3000/api',            // Fallback local
];
```

### 2.3 Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto
3. Ative a API Google+ 
4. Configure OAuth 2.0:
   - URIs autorizados: `https://auth.expo.io/@seu-usuario/tdahservice`
   - URIs de redirecionamento: `https://auth.expo.io/@seu-usuario/tdahservice`

## 🚀 3. Deploy do Frontend

### 3.1 Build para Produção

```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build para Web
expo build:web
```

### 3.2 Publicar no Expo

```bash
# Publicar para desenvolvimento
expo publish

# Ou usar EAS Update
eas update --branch production
```

### 3.3 Distribuição

#### Android:
1. Gere APK/AAB via EAS Build
2. Publique na Google Play Store
3. Ou distribua via link direto

#### iOS:
1. Gere IPA via EAS Build
2. Publique na App Store
3. Ou use TestFlight

#### Web:
1. Deploy no Vercel/Netlify
2. Configure domínio personalizado

## 🔐 4. Configurações de Segurança

### 4.1 Backend

```typescript
// Adicione no app.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting mais rigoroso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP'
});
```

### 4.2 Frontend

```typescript
// Adicione validação de certificados SSL
const API_CONFIG = {
  // ... outras configs
  SSL_VERIFY: true,
  TIMEOUT: 15000,
};
```

## 📊 5. Monitoramento e Analytics

### 5.1 Logs

```typescript
// Backend - Winston com Sentry
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "sua-dsn-sentry",
  environment: "production",
});

// Frontend - Expo Analytics
import * as Analytics from 'expo-analytics';

Analytics.initialize('seu-tracking-id');
```

### 5.2 Métricas

- Uptime monitoring (UptimeRobot)
- Performance monitoring (New Relic)
- Error tracking (Sentry)

## 🔄 6. CI/CD Pipeline

### 6.1 GitHub Actions

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Scripts de deploy

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Expo
        run: |
          npm install -g @expo/eas-cli
          eas login --non-interactive
          eas update --branch production
```

## 📱 7. Distribuição para Usuários

### 7.1 App Stores

#### Google Play Store:
1. Crie conta de desenvolvedor ($25)
2. Prepare assets (ícones, screenshots)
3. Configure ficha do app
4. Submeta para revisão

#### Apple App Store:
1. Crie conta de desenvolvedor ($99/ano)
2. Prepare assets
3. Configure App Store Connect
4. Submeta para revisão

### 7.2 Distribuição Direta

#### Android:
```bash
# Gerar APK para distribuição
eas build --platform android --profile preview
```

#### iOS:
```bash
# Usar TestFlight
eas build --platform ios --profile preview
```

### 7.3 Web App

```bash
# Deploy no Vercel
vercel --prod

# Ou Netlify
netlify deploy --prod
```

## 🎯 8. Checklist Final

- [ ] Backend deployado e funcionando
- [ ] Frontend configurado com URL correta
- [ ] Google OAuth configurado
- [ ] MongoDB conectado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS ativo
- [ ] Testes passando
- [ ] Monitoramento configurado
- [ ] App publicado nas stores
- [ ] Documentação atualizada

## 🆘 9. Troubleshooting

### Problemas Comuns:

1. **CORS Errors**: Configure CORS no backend
2. **MongoDB Connection**: Verifique string de conexão
3. **JWT Errors**: Verifique JWT_SECRET
4. **Google Auth**: Verifique URIs autorizados
5. **Build Failures**: Verifique dependências

### Logs Úteis:

```bash
# Backend logs
railway logs

# Frontend logs
expo logs

# MongoDB logs
# Verificar no Atlas Dashboard
```

## 📞 10. Suporte

- **Documentação**: Mantenha README atualizado
- **FAQ**: Crie seção de perguntas frequentes
- **Contato**: Configure canal de suporte
- **Updates**: Mantenha app atualizado

---

## 🎉 Próximos Passos

1. Execute o deploy seguindo este guia
2. Teste todas as funcionalidades
3. Publique nas app stores
4. Configure monitoramento
5. Anuncie para usuários!

**Boa sorte com o lançamento! 🚀** 