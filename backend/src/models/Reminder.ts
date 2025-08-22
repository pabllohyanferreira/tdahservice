import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  dateTime: Date;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
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
  category: { type: String },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Índices para otimizar consultas
ReminderSchema.index({ userId: 1, dateTime: 1 }); // Consultas por usuário e data
ReminderSchema.index({ userId: 1, status: 1 }); // Consultas por usuário e status
ReminderSchema.index({ userId: 1, priority: 1 }); // Consultas por usuário e prioridade
ReminderSchema.index({ userId: 1, category: 1 }); // Consultas por usuário e categoria
ReminderSchema.index({ dateTime: 1, status: 1 }); // Lembretes por data e status
ReminderSchema.index({ createdAt: -1 }); // Ordenação por criação
ReminderSchema.index({ isDeleted: 1 }); // Soft delete

// Middleware para filtrar registros deletados
ReminderSchema.pre('find', function() {
  this.where({ isDeleted: { $ne: true } });
});

ReminderSchema.pre('findOne', function() {
  this.where({ isDeleted: { $ne: true } });
});

export default mongoose.model<IReminder>('Reminder', ReminderSchema); 