import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingProblem extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'To Do' | 'Attempted' | 'Solved';
  link?: string;
  notes?: string;
  solutionCode?: string;
  language?: string;
  description?: string;
}

const CodingProblemSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['Easy', 'Medium', 'Hard'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['To Do', 'Attempted', 'Solved'], 
      default: 'To Do' 
    },
    link: { type: String },
    notes: { type: String },
    solutionCode: { type: String },
    language: { type: String, default: 'JavaScript' },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<ICodingProblem>('CodingProblem', CodingProblemSchema);
