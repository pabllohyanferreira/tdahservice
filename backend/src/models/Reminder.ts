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