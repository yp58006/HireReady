import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  difficulty: { type: String, required: true },
  timeLimit: { type: Number, required: true },
  answer: { type: String },
  feedback: { type: String },
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  mode: {
    type: String,
    enum: ['hr', 'technical', 'managerial'],
    required: true,
  },
  resumeTxt: { type: String },
  skills: [{ type: String }],
  projects: [{
    name: { type: String },
    description: { type: String },
  }],
  finalScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['incomplete', 'completed'],
    default: 'incomplete',
  },
  questions: [questionSchema],
}, { timestamps: true });

export default mongoose.model('Interview', interviewSchema);