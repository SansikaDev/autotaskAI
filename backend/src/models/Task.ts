import mongoose from 'mongoose';

export interface ITask extends mongoose.Document {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  user: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  ai_task_type?: string;
  ai_confidence?: number;
  ai_suggested_actions?: string[];
}

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    dueDate: {
      type: Date
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    ai_task_type: {
      type: String,
      required: false
    },
    ai_confidence: {
      type: Number,
      required: false
    },
    ai_suggested_actions: [{
      type: String,
      required: false
    }]
  },
  {
    timestamps: true
  }
);

// Index for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema); 