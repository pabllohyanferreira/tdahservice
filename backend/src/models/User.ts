import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  picture?: string;
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  role: 'user' | 'admin' | 'manager';
  createdAt: Date;
  updatedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },
  picture: { type: String },
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' }
  },
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema); 