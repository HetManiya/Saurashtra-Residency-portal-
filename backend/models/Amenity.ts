import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number },
  hourlyRate: { type: Number, default: 0 },
  image: { type: String },
  status: { type: String, enum: ['AVAILABLE', 'MAINTENANCE', 'CLOSED'], default: 'AVAILABLE' }
}, { timestamps: true });

export default mongoose.model('Amenity', amenitySchema);
