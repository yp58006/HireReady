import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  credits: { type: Number, default: 100 },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
