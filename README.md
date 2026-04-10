# TDAH Service

Aplicativo mobile para apoio a pessoas com TDAH, com foco em organizacao pessoal, lembretes, notificacoes e acompanhamento de rotina.  
O projeto esta dividido em **frontend (React Native + Expo)** e **backend (Node.js + Express + MongoDB)**.

## 1) Objetivo do projeto

Desenvolver uma solucao pratica para:
- registrar lembretes e compromissos;
- enviar notificacoes no horario correto;
- oferecer interface simples e acessivel;
- manter dados do usuario com autenticacao e persistencia.

## 2) Arquitetura geral

- **Frontend mobile**: app em React Native com Expo.
- **Backend API REST**: servidor em Express com TypeScript.
- **Banco de dados**: MongoDB (via Mongoose).
- **Autenticacao**: JWT (login local e Google).

Fluxo resumido:
1. Usuario faz cadastro/login no app.
2. App recebe token JWT.
3. Requisicoes protegidas enviam token para API.
4. API valida token e executa CRUD de lembretes.

## 3) Tecnologias e linguagens utilizadas

### Linguagens
- TypeScript
- JavaScript

### Frontend
- React Native
- Expo
- React Navigation

### Backend
- Node.js
- Express
- Mongoose

## 4) Estrutura do projeto

```text
tdahservice/
|- App.tsx
|- app.json
|- package.json
|- tsconfig.json
|- index.js
|- assets/
|- src/
|  |- components/
|  |- contexts/
|  |- hooks/
|  |- screens/
|  |- services/
|  |- config/
|  |- theme/
|  |- types/
|  \- utils/
|- backend/
|  |- package.json
|  |- tsconfig.json
|  |- src/
|  |  |- app.ts
|  |  |- controllers/
|  |  |- middleware/
|  |  |- models/
|  |  |- routes/
|  |  |- services/
|  |  |- config/
|  |  \- utils/
|  \- .env
\- README.md
```

## 5) Modulos principais

### Frontend
- **Telas**: Dashboard, Alarmes/Lembretes, Calendario, Configuracoes, Notas, Onboarding.
- **Contextos globais**: tema, usuario, notificacoes, lembretes e toast.
- **Servicos**: notificacoes, vibracao, alarmes, backup e autenticacao offline.

### Backend
- **Autenticacao**: cadastro, login, login Google, recuperar senha, redefinir senha.
- **Lembretes**: CRUD com validacao e protecao por token.
- **Backup anonimo**: criacao, leitura, atualizacao e remocao por `device-id`.
- **Administracao**: rotas administrativas para usuarios/backups.

## 6) Endpoints principais da API

Base URL local: `http://localhost:3000`

- `GET /api/health` - status da API
- `POST /api/auth/register` - cadastro
- `POST /api/auth/login` - login
- `POST /api/auth/google` - login Google
- `POST /api/auth/forgot-password` - solicitar reset
- `POST /api/auth/reset-password` - redefinir senha
- `GET /api/reminders` - listar lembretes (protegido)
- `POST /api/reminders` - criar lembrete (protegido)
- `PUT /api/reminders/:id` - atualizar lembrete (protegido)
- `DELETE /api/reminders/:id` - remover lembrete (protegido)
- `POST /api/backup/anonymous` - criar backup anonimo

## 7) Como executar o projeto

### Pre-requisitos
- Node.js 18 ou superior
- npm
- MongoDB (local ou Atlas)
- Expo Go (celular) ou emulador Android/iOS

### Passo a passo
1. Instalar dependencias do frontend:
   - `npm install`
2. Instalar dependencias do backend:
   - `cd backend`
   - `npm install`
3. Configurar variaveis de ambiente em `backend/.env` (ex.: `MONGODB_URI`, `JWT_SECRET`).
4. Iniciar backend:
   - `npm run dev`
5. Em outro terminal, iniciar frontend (na raiz):
   - `npm start`

## 8) Requisitos funcionais atendidos

- Cadastro e autenticacao de usuarios.
- Gerenciamento de lembretes (criar, editar, concluir e excluir).
- Notificacoes e alarmes para tarefas.
- Organizacao por telas focadas em rotina e produtividade.
- Persistencia de dados e sincronizacao com API.

## 9) Limpeza aplicada para apresentacao

Durante a organizacao para entrega academica, foram removidos artefatos de apoio que nao sao necessarios para rodar o app, como:
- arquivos antigos de documentacao auxiliar;
- scripts de automacao de build/deploy em shell/powershell;
- arquivos de pipeline e configuracoes externas de deploy;
- arquivos de teste automatizado que nao impactam a execucao.

## 10) Autor e contexto

Projeto academico para apresentacao em faculdade, com foco em desenvolvimento mobile full stack e boas praticas de arquitetura em camadas.
