import mongoose, { Schema, Document } from 'mongoose';

export interface IClassSchedule extends Document {
  user: mongoose.Types.ObjectId;
  course: string;
  type: 'Lecture' | 'Tutorial' | 'Focus' | 'Lab' | 'Other';
  room: string;
  time: string;
  credits: number;
  grade?: string;
  resourceLink?: string;
}

const ClassScheduleSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['Lecture', 'Tutorial', 'Focus', 'Lab', 'Other'], 
      default: 'Lecture' 
    },
    room: { type: String, default: 'TBD' },
    time: { type: String, required: true },
    credits: { type: Number, default: 3 },
    grade: { type: String },
    resourceLink: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IClassSchedule>('ClassSchedule', ClassScheduleSchema);
