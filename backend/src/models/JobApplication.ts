import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  user: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: 'Applied' | 'Phone Screen' | 'Take-home' | 'Onsite' | 'Offer' | 'Rejected';
  appliedDate: Date;
  nextInterviewDate?: Date;
  notes?: string;
  link?: string;
}

const JobApplicationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['Applied', 'Phone Screen', 'Take-home', 'Onsite', 'Offer', 'Rejected'], 
      default: 'Applied' 
    },
    appliedDate: { type: Date, default: Date.now },
    nextInterviewDate: { type: Date },
    notes: { type: String },
    link: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
