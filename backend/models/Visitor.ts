import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  flatId: { type: String, required: true },
  purpose: { type: String },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  status: { 
    type: String, 
    enum: ['IN', 'OUT'], 
    default: 'IN' 
  }
}, { timestamps: true });

export default mongoose.model('Visitor', visitorSchema);
