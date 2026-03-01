import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  capacity: { type: Number },
  hourlyRate: { type: Number, default: 0 },
  image: { type: String },
  status: { type: String, enum: ['AVAILABLE', 'MAINTENANCE', 'CLOSED'], default: 'AVAILABLE' }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id
amenitySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Amenity', amenitySchema);
