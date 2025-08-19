# 🚀 Backend Setup - TDAH Service

## Visão Geral

Para criar um backend robusto para o TDAH Service, recomendo usar **Node.js + Express + MongoDB** com autenticação JWT e APIs RESTful.

## 🛠️ Stack Tecnológica Recomendada

### Core
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB

### Autenticação & Segurança
- **JWT** - JSON Web Tokens
- **bcrypt** - Hash de senhas
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Segurança HTTP

### Desenvolvimento
- **TypeScript** - Tipagem estática
- **nodemon** - Auto-reload
- **dotenv** - Variáveis de ambiente
- **jest** - Testes

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── reminderController.ts
│   │   └── scheduleController.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Reminder.ts
│   │   └── Schedule.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── reminders.ts
│   │   └── schedules.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── reminderService.ts
│   │   └── notificationService.ts
│   ├── utils/
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── app.ts
├── tests/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Primeiros Passos

### 1. Criar Estrutura do Projeto

```bash
# Criar diretório do backend
mkdir backend
cd backend

# Inicializar projeto
npm init -y

# Instalar dependências principais
npm install express mongoose bcryptjs jsonwebtoken cors helmet dotenv

# Instalar dependências de desenvolvimento
npm install -D typescript @types/node @types/express @types/mongoose @types/bcryptjs @types/jsonwebtoken @types/cors nodemon ts-node jest @types/jest
```

### 2. Configurar TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Configurar Scripts

```json
// package.json
{
  "scripts": {
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "test": "jest"
  }
}
```

## 📊 Modelos de Dados

### User Model
```typescript
// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  picture?: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  picture: { type: String },
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' }
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
```

### Reminder Model
```typescript
// src/models/Reminder.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dateTime: Date;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<IReminder>('Reminder', ReminderSchema);
```

## 🔐 Autenticação

### JWT Middleware
```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
```

## 🛣️ Rotas da API

### Auth Routes
```typescript
// src/routes/auth.ts
import express from 'express';
import { register, login, googleAuth } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

export default router;
```

### Reminder Routes
```typescript
// src/routes/reminders.ts
import express from 'express';
import { auth } from '../middleware/auth';
import { 
  getReminders, 
  createReminder, 
  updateReminder, 
  deleteReminder 
} from '../controllers/reminderController';

const router = express.Router();

router.use(auth); // Proteger todas as rotas

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

export default router;
```

## 🔧 Configuração Principal

### App.ts
```typescript
// src/app.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import reminderRoutes from './routes/reminders';
import userRoutes from './routes/users';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/users', userRoutes);

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

## 🌍 Variáveis de Ambiente

```env
# .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tdahservice
JWT_SECRET=sua_chave_secreta_muito_segura
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
NODE_ENV=development
```

## 📱 Integração com Frontend

### Atualizar AuthContext
```typescript
// No frontend, atualizar src/contexts/AuthContext.tsx
const API_BASE_URL = 'http://localhost:3000/api';

const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (response.ok) {
      // Salvar token e dados do usuário
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
```

## 🚀 Próximos Passos

1. **Configurar MongoDB** (local ou MongoDB Atlas)
2. **Implementar controllers** para cada funcionalidade
3. **Adicionar validação** com Joi ou Yup
4. **Implementar testes** com Jest
5. **Configurar CI/CD** (GitHub Actions)
6. **Deploy** (Heroku, Vercel, AWS)

## 🔒 Segurança

- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ JWT com expiração
- ✅ Hash de senhas com bcrypt

## 📈 Escalabilidade

- 🔄 Cache com Redis
- 🔄 Paginação de resultados
- 🔄 Compressão de resposta
- 🔄 Logs estruturados
- 🔄 Monitoramento de performance

Quer que eu ajude a implementar alguma parte específica do backend? 