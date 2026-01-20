
import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'A-1'
  type: { type: String, enum: ['1BHK', '2BHK'], required: true },
  totalFloors: { type: Number, default: 5 },
  flatsPerFloor: { type: Number, default: 4 },
  hasLift: { type: Boolean, default: true },
  parkingSpots: { type: Number, default: 20 }
}, { timestamps: true });

export default mongoose.model('Building', buildingSchema);
