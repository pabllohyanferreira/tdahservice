export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: Date;
  isCompleted: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  date: Date;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  date?: Date;
  isCompleted?: boolean;
} 