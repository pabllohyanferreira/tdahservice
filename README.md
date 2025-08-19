# 📱 TDAH Service

Um aplicativo completo de lembretes e organização para pessoas com TDAH, desenvolvido em React Native com Expo.

## 🚀 Características Principais

- ✅ **Autenticação Completa** - Login local e Google OAuth
- ✅ **Sistema de Lembretes** - CRUD completo com animações
- ✅ **Notificações Push** - Agendamento automático
- ✅ **Temas Dinâmicos** - Escuro, Claro e Roxo
- ✅ **Backend Robusto** - API REST com MongoDB
- ✅ **Interface Moderna** - UI/UX otimizada para TDAH

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

### 📁 **Estrutura da Documentação**
```
docs/
├── README.md                    # Índice principal
├── deploy/                      # Guias de deploy
├── bugs/                        # Bugs e correções
├── temas/                       # Sistema de temas
├── funcionalidades/             # Funcionalidades do app
├── testes/                      # Testes e relatórios
└── analise/                     # Análise do código
```

### 🎯 **Guias Rápidos**

- **[📖 Documentação Completa](./docs/README.md)** - Índice de toda a documentação
- **[🚀 Deploy Rápido](./docs/deploy/README_DEPLOY.md)** - Como fazer deploy
- **[🐛 Correções](./docs/bugs/CORREÇÕES_IMPLEMENTADAS.md)** - Bugs corrigidos
- **[🎨 Temas](./docs/temas/TEMA_ROXO_FINAL.md)** - Sistema de temas

## 🛠️ Tecnologias

### Frontend
- **React Native** + **Expo**
- **TypeScript**
- **React Navigation**
- **React Context API**
- **Expo Notifications**

### Backend
- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT Authentication**
- **Google OAuth**

### Deploy
- **Railway** (Backend)
- **Expo EAS** (Frontend)
- **MongoDB Atlas** (Database)

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- Expo CLI
- MongoDB Atlas (gratuito)

### Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd tdahservice
```

2. **Instale as dependências**
```bash
npm install
cd backend && npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Backend
cp backend/env.example backend/.env
# Edite backend/.env com suas configurações
```

4. **Execute o projeto**
```bash
# Backend
cd backend && npm run dev

# Frontend (em outro terminal)
npm start
```

## 📱 Funcionalidades

### 🔐 Autenticação
- Registro e login local
- Login com Google
- Recuperação de senha
- Tokens JWT seguros

### 📋 Lembretes
- Criar, editar, deletar lembretes
- Animações suaves
- Prioridades visuais
- Filtros e busca

### 🔔 Notificações
- Push notifications
- Agendamento automático
- Permissões configuráveis
- Teste de notificações

### 🎨 Temas
- Tema escuro
- Tema claro
- Tema roxo (principal)
- Transições suaves

## 🧪 Testes

```bash
# Testes de validação
npm test -- --testPathPattern=validation.test.ts
```

## 📊 Status do Projeto

- ✅ **Frontend:** Completo e testado
- ✅ **Backend:** API REST completa
- ✅ **Database:** MongoDB configurado
- ✅ **Deploy:** Configurado para produção
- ✅ **Documentação:** 100% documentado
- ✅ **Bugs:** Corrigidos e testados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

- **Documentação:** [docs/README.md](./docs/README.md)
- **Issues:** pabllohyanferreira Issues
- **Email:** pablohyan64@gmail.com

---

**Desenvolvido com ❤️ para a comunidade TDAH** 