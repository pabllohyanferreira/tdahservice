import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Reminder from '../models/Reminder';

export const getReminders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const reminders = await Reminder.find({ userId }).sort({ dateTime: 1 });
    
    res.json(reminders);
  } catch (error) {
    console.error('Erro ao buscar lembretes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createReminder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { title, description, dateTime, priority, category } = req.body;

    const reminder = new Reminder({
      userId,
      title,
      description,
      dateTime: new Date(dateTime),
      priority: priority || 'medium',
      category
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Erro ao criar lembrete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updateData = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Lembrete não encontrado' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Erro ao atualizar lembrete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({ message: 'Lembrete não encontrado' });
    }

    res.json({ message: 'Lembrete deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lembrete:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 