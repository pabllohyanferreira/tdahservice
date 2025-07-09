# 🚀 TDAH Service - Backend

Backend da aplicação TDAH Service, construído com Node.js, Express, TypeScript e MongoDB.

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas

## 🚀 Como Executar

### Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **MongoDB** (local ou MongoDB Atlas)
3. **npm** ou **yarn**

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/     # Controladores da API
├── models/         # Modelos do MongoDB
├── routes/         # Rotas da API
├── middleware/     # Middlewares (auth, validação)
├── services/       # Lógica de negócio
├── utils/          # Utilitários
└── app.ts          # Arquivo principal
```

## 🔐 Autenticação

O backend usa JWT (JSON Web Tokens) para autenticação.

### Endpoints de Auth

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Login com Google

### Proteção de Rotas

Rotas protegidas requerem o header:
```
Authorization: Bearer <token>
```

## 📊 API Endpoints

### Lembretes
- `GET /api/reminders` - Listar lembretes
- `POST /api/reminders` - Criar lembrete
- `PUT /api/reminders/:id` - Atualizar lembrete
- `DELETE /api/reminders/:id` - Deletar lembrete

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tdahservice
JWT_SECRET=sua_chave_secreta_muito_segura
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
NODE_ENV=development
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executar em desenvolvimento com auto-reload
- `npm run build` - Compilar TypeScript
- `npm start` - Executar em produção
- `npm test` - Executar testes

## 📱 Integração com Frontend

O backend está configurado para aceitar requisições do frontend React Native na porta 3000.

### Exemplo de uso:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';

// Login
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## 🚀 Próximos Passos

1. ✅ Estrutura básica criada
2. ✅ Autenticação implementada
3. ✅ CRUD de lembretes
4. 🔄 Validação de dados
5. 🔄 Testes automatizados
6. 🔄 Deploy em produção

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue no repositório. 