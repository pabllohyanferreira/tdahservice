import express from 'express';
import { register, login, googleAuth } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/authController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limit para login: 5 tentativas a cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router; 