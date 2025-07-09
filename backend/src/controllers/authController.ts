import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.authProvider === 'google') {
        return res.status(400).json({ message: 'Este e-mail foi cadastrado via Google. Faça login com Google.' });
      }
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local'
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { googleId, name, email, picture } = req.body;

    // Buscar usuário existente
    let user = await User.findOne({ email });

    if (user) {
      if (user.authProvider === 'local') {
        return res.status(400).json({ message: 'Este e-mail foi cadastrado com senha. Faça login usando e-mail e senha.' });
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
        password: 'google_auth' // Senha dummy para usuários do Google
      });
      await user.save();
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login com Google realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Erro no login com Google:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 