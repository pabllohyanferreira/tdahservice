# 🧪 Teste Rápido - Backend TDAH Service

## 🚀 Executar o Backend

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env (opcional - já tem valores padrão)
```

### 2. Instalar MongoDB (se não tiver)

**Opção A: MongoDB Local**
```bash
# Windows (com Chocolatey)
choco install mongodb

# Ou baixar do site oficial: https://www.mongodb.com/try/download/community
```

**Opção B: MongoDB Atlas (Gratuito)**
1. Acesse: https://www.mongodb.com/atlas
2. Crie conta gratuita
3. Crie cluster
4. Copie a string de conexão
5. Substitua no .env

### 3. Executar o Backend

```bash
# Instalar dependências (se ainda não fez)
npm install

# Executar em desenvolvimento
npm run dev
```

### 4. Testar a API

**Teste Básico:**
```bash
# Verificar se está funcionando
curl http://localhost:3000
# Deve retornar: {"message":"TDAH Service API - Backend funcionando!"}
```

**Teste de Registro:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuário",
    "email": "teste@email.com",
    "password": "123456"
  }'
```

**Teste de Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "123456"
  }'
```

## 📱 Teste com Frontend

### 1. Atualizar Frontend

No arquivo `src/contexts/AuthContext.tsx` do frontend, adicionar:

```typescript
const API_BASE_URL = 'http://localhost:3000/api';

const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Salvar token
      await Storage.setItem('@TDAHService:token', data.token);
      // Salvar usuário
      await Storage.setItem('@TDAHService:user', data.user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro no login:', error);
    return false;
  }
};
```

### 2. Testar Login

1. Execute o backend: `npm run dev`
2. Execute o frontend: `npm start`
3. Tente fazer login com as credenciais de teste

## 🔧 Solução de Problemas

### Erro: "Cannot connect to MongoDB"
- Verifique se o MongoDB está rodando
- Verifique a string de conexão no .env
- Para MongoDB local: `mongodb://localhost:27017/tdahservice`

### Erro: "Port 3000 already in use"
- Mude a porta no .env: `PORT=3001`
- Ou pare outros serviços na porta 3000

### Erro: "Module not found"
- Execute: `npm install`
- Verifique se todas as dependências estão instaladas

## ✅ Checklist de Teste

- [ ] Backend inicia sem erros
- [ ] MongoDB conecta com sucesso
- [ ] Rota `/` retorna mensagem de boas-vindas
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Token JWT é gerado
- [ ] Frontend consegue conectar ao backend

## 🎯 Próximos Passos

1. ✅ Backend funcionando
2. 🔄 Integrar com frontend
3. 🔄 Testar CRUD de lembretes
4. 🔄 Implementar validações
5. 🔄 Adicionar testes automatizados 