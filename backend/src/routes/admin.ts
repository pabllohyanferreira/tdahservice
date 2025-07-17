import express from 'express';
import { listUsers, updateUserRole, deleteUser } from '../controllers/authController';
import { auth, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Todas as rotas abaixo exigem autenticação e papel admin
router.use(auth, authorizeRoles('admin'));

// Listar usuários
router.get('/users', listUsers);
// Atualizar papel
router.patch('/users/:id/role', updateUserRole);
// Deletar usuário
router.delete('/users/:id', deleteUser);

export default router; 