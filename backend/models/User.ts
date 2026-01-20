import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'COMMITTEE', 'STAFF', 'RESIDENT', 'SECURITY'], 
    default: 'RESIDENT' 
  },
  // Granular permissions array to override or extend role defaults
  permissions: [{ type: String }], 
  flatId: { type: String }, // e.g., 'A-1-101'
  occupancyType: { type: String, enum: ['Owner', 'Tenant'] },
  phone: { type: String },
  lastLogin: { type: Date }
}, { timestamps: true });

export default mongoose.model('User', userSchema);