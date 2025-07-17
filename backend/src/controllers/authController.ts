import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Joi from 'joi';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logger from '../utils/logger';

// Esquemas de validação
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin', 'manager').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const googleAuthSchema = Joi.object({
  googleId: Joi.string().required(),
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  picture: Joi.string().uri().optional().allow('')
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

export const register = async (req: Request, res: Response) => {
  // Validação Joi
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // Criar novo usuário
    let role = 'user';
    if (req.body.role && ['admin', 'manager'].includes(req.body.role)) {
      // Só permitir criar admin/manager se já estiver autenticado como admin (futuro, via rota protegida)
      // Por enquanto, só permite 'user' no cadastro público
      role = 'user';
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      role
    });
    await user.save();
    logger.info('Usuário salvo no cadastro', { user: user.toObject() });

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info('Novo cadastro realizado', { userId: user._id, email: user.email, provider: 'local' });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export { register as registerUser };

export const login = async (req: Request, res: Response) => {
  // Validação Joi
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ email });
    logger.info('Usuário buscado no login', { user });
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info('Login realizado', { userId: user._id, email: user.email, provider: 'local' });

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  // Validação Joi
  const { error } = googleAuthSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { googleId, name, email, picture } = req.body;

    // Buscar usuário existente
    let user = await User.findOne({ email });

    if (user) {
      if (user.authProvider === 'local') {
        return res.status(400).json({ error: 'Este e-mail foi cadastrado com senha. Faça login usando e-mail e senha.' });
      }
      // Atualizar dados do Google se necessário
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.picture && picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) await user.save();
    } else {
      // Criar novo usuário do Google
      user = new User({
        name,
        email,
        googleId,
        picture,
        authProvider: 'google',
        password: 'google_auth', // Senha dummy para usuários do Google
        role: 'user'
      });
      await user.save();
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    logger.info('Login Google realizado', { userId: user._id, email: user.email, provider: 'google' });

    res.json({
      message: 'Login com Google realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Erro no login com Google:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.authProvider !== 'local') {
      return res.status(400).json({ error: 'Usuário não encontrado ou não pode redefinir senha.' });
    }
    // Gerar token e expiração
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();
    // Configurar transporte de e-mail (exemplo com Gmail, ajustar para produção)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:19006'}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Redefinição de senha',
      text: `Para redefinir sua senha, acesse: ${resetUrl}`
    });
    logger.info('Solicitação de reset de senha enviada', { userId: user._id, email: user.email });
    res.json({ message: 'E-mail de redefinição enviado.' });
  } catch (err) {
    logger.error('Erro no forgotPassword:', err);
    res.status(500).json({ error: 'Erro ao enviar e-mail de redefinição.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    logger.info('Senha redefinida com sucesso', { userId: user._id, email: user.email });
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    logger.error('Erro no resetPassword:', err);
    res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
};

// Listar todos os usuários (admin)
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, email, role } = req.query;
    const query: any = {};
    if (email) query.email = { $regex: email, $options: 'i' };
    if (role) query.role = role;
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query, '-password')
      .skip(skip)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
};

// Promover/demover papel de usuário (admin)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin', 'manager'].includes(role)) {
      return res.status(400).json({ error: 'Papel inválido.' });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true, fields: '-password' });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    logger.info('Papel de usuário atualizado', { userId: user._id, role });
    res.json(user);
  } catch (error) {
    logger.error('Erro ao atualizar papel do usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar papel do usuário.' });
  }
};

// Deletar usuário (admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    logger.info('Usuário deletado', { userId: user._id });
    res.json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
    logger.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
}; 