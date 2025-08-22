import mongoose, { Document, Schema } from 'mongoose';

export interface IBackup extends Document {
  deviceId: string;
  reminders: any[];
  userData: {
    name: string;
    age: string;
    gender: 'masculino' | 'feminino' | 'outro' | '';
  };
  settings: any;
  lastBackup: string;
  createdAt: Date;
  updatedAt: Date;
}

const BackupSchema = new Schema<IBackup>({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  reminders: {
    type: Schema.Types.Mixed,
    default: []
  },
  userData: {
    name: {
      type: String,
      default: ''
    },
    age: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['masculino', 'feminino', 'outro', ''],
      default: ''
    }
  },
  settings: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastBackup: {
    type: String,
    required: true
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'backups'
});

// Índices para melhor performance
BackupSchema.index({ deviceId: 1 });
BackupSchema.index({ createdAt: -1 });
BackupSchema.index({ updatedAt: -1 });

export const BackupModel = mongoose.model<IBackup>('Backup', BackupSchema); 