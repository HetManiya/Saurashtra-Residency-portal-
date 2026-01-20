
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['GARBAGE', 'BUILDING_CLEANING', 'SECURITY'], 
    required: true 
  },
  payeeName: { type: String, required: true }, // Cleaner name, Agency name, etc.
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Paid', 'Pending'], 
    default: 'Pending' 
  },
  // Specific metadata based on type
  details: {
    buildingName: { type: String }, // For BUILDING_CLEANING
    gateNumber: { type: String, enum: ['Gate 1', 'Gate 2'] }, // For SECURITY
    shift: { type: String, enum: ['Day', 'Night'] }, // For SECURITY
    remarks: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
