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
  createdAt: Date;
  updatedAt: Date;
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
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema); 