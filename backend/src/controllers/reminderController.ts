import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Reminder from '../models/Reminder';
import Joi from 'joi';
import logger from '../utils/logger';

// Esquema de validação para lembrete
const reminderSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  dateTime: Joi.date().iso().required(),
  status: Joi.string().valid('pending', 'completed', 'overdue').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  category: Joi.string().max(50).optional().allow('')
});

export const getReminders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, dateFrom, dateTo, priority, category } = req.query;
    const query: any = { userId };
    if (dateFrom || dateTo) {
      query.dateTime = {};
      if (dateFrom) query.dateTime.$gte = new Date(dateFrom as string);
      if (dateTo) query.dateTime.$lte = new Date(dateTo as string);
    }
    if (priority) query.priority = priority;
    if (category) query.category = { $regex: category, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const reminders = await Reminder.find(query)
      .sort({ dateTime: 1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Reminder.countDocuments(query);
    res.json({
      reminders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    logger.error('Erro ao buscar lembretes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createReminder = async (req: AuthRequest, res: Response) => {
  // Validação Joi
  const { error } = reminderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
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
    logger.info('Lembrete criado', { userId, reminderId: reminder._id, title: reminder.title });
    res.status(201).json(reminder);
  } catch (error) {
    logger.error('Erro ao criar lembrete:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response) => {
  // Validação Joi (parcial, pois update pode ser parcial)
  const updateSchema = reminderSchema.fork(['title', 'dateTime'], (field) => field.optional());
  const { error } = updateSchema.validate(req.body);
  if (error) {
    logger.error('Erro de validação no update:', { error: error.details[0].message, body: req.body });
    return res.status(400).json({ error: error.details[0].message });
  }
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updateData = req.body;

    // Validação do ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID do lembrete é obrigatório' });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }

    res.json(reminder);
    logger.info('Lembrete atualizado', { userId, reminderId: reminder._id });
  } catch (error) {
    logger.error('Erro ao atualizar lembrete:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validação do ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'ID do lembrete é obrigatório' });
    }

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({ error: 'Lembrete não encontrado' });
    }

    res.json({ message: 'Lembrete deletado com sucesso' });
    logger.info('Lembrete deletado', { userId, reminderId: reminder._id });
  } catch (error) {
    logger.error('Erro ao deletar lembrete:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 