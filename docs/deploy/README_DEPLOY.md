# 🚀 Deploy Rápido - TDAH Service

Guia rápido para colocar seu projeto em produção.

## ⚡ Deploy em 5 Minutos

### 1. Backend (Railway - Gratuito)

```bash
# 1. Acesse https://railway.app
# 2. Conecte seu GitHub
# 3. Selecione a pasta 'backend'
# 4. Configure variáveis de ambiente:
```

**Variáveis de Ambiente:**
```
PORT=3000
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/tdahservice
JWT_SECRET=sua_chave_secreta_muito_segura_aqui_2024
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
NODE_ENV=production
```

### 2. Frontend (Expo)

```bash
# 1. Instale EAS CLI
npm install -g @expo/eas-cli

# 2. Faça login
eas login

# 3. Configure o projeto
eas build:configure

# 4. Atualize a URL da API em src/config/api.ts
```

### 3. MongoDB Atlas (Gratuito)

1. Acesse [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie conta gratuita
3. Crie cluster (gratuito)
4. Configure usuário/senha
5. Copie string de conexão

## 🔧 Configuração Rápida

### Atualizar URL da API

Edite `src/config/api.ts`:

```typescript
const POSSIBLE_ENDPOINTS = [
  'https://seu-backend.railway.app/api',  // ← Sua URL do Railway
  'http://localhost:3000/api',            // Fallback local
];
```

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com)
2. Crie projeto
3. Ative Google+ API
4. Configure OAuth:
   - URIs: `https://auth.expo.io/@seu-usuario/tdahservice`
   - Redirect: `https://auth.expo.io/@seu-usuario/tdahservice`

## 🚀 Deploy Automatizado

### Usando Scripts

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1 all
```

**Linux/Mac:**
```bash
./scripts/deploy.sh all
```

### GitHub Actions

Configure secrets no GitHub:
- `RAILWAY_TOKEN`
- `EXPO_TOKEN`
- `MONGODB_URI_TEST`

## 📱 Distribuição

### Android
```bash
# Gerar APK
eas build --platform android --profile preview

# Ou AAB para Play Store
eas build --platform android --profile production
```

### iOS
```bash
# Para TestFlight
eas build --platform ios --profile preview
```

### Web
```bash
# Build web
expo build:web

# Deploy no Vercel
vercel --prod
```

## 🔍 Verificação

1. **Backend**: `https://seu-backend.railway.app/api/health`
2. **Frontend**: Teste no Expo Go
3. **Database**: Verifique no MongoDB Atlas
4. **Auth**: Teste login/registro

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| CORS Error | Configure CORS no backend |
| MongoDB Connection | Verifique string de conexão |
| JWT Error | Verifique JWT_SECRET |
| Build Fail | Verifique dependências |

## 📞 Suporte

- **Documentação**: [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
- **Issues**: GitHub Issues
- **Logs**: Railway Dashboard / Expo Dashboard

---

**🎉 Seu app está pronto para uso!** 