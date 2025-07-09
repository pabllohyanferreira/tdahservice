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