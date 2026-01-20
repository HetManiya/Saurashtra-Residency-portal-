
import mongoose from 'mongoose';

const fundSchema = new mongoose.Schema({
  purpose: { type: String, required: true }, // e.g., 'Ganesh Chaturthi'
  date: { type: Date, required: true },
  targetAmount: { type: Number, required: true },
  totalCollected: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Fund', fundSchema);
