import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  flatId: { type: String, required: true },
  purpose: { type: String },
  passId: { type: String, unique: true, sparse: true },
  type: { type: String, enum: ['GUEST', 'DELIVERY', 'SERVICE'], default: 'GUEST' },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN', 'OUT'], 
    default: 'PENDING' 
  }
}, { timestamps: true });

export default mongoose.model('Visitor', visitorSchema);
