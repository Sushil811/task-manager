import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
  category: string;
  dueDate?: Date;
  estimatedTime?: string; // e.g. "25m"
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
    category: { type: String, default: 'Work' },
    dueDate: { type: Date },
    estimatedTime: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
