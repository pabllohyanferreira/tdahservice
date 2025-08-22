import express from 'express';
import { BackupController } from '../controllers/backupController';

const router = express.Router();
const backupController = new BackupController();

// Rota para fazer backup anônimo (sem autenticação)
router.post('/anonymous', backupController.createAnonymousBackup);

// Rota para recuperar backup anônimo
router.get('/anonymous/:deviceId', backupController.getAnonymousBackup);

// Rota para atualizar backup anônimo
router.put('/anonymous/:deviceId', backupController.updateAnonymousBackup);

// Rota para deletar backup anônimo
router.delete('/anonymous/:deviceId', backupController.deleteAnonymousBackup);

// Rota para listar backups (para administração)
router.get('/admin/list', backupController.listAllBackups);

export default router; 