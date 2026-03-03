import mongoose from 'mongoose';

const amenityBookingSchema = new mongoose.Schema({
  amenityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Amenity', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flatId: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number }, // Duration in hours
  purpose: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' },
  totalAmount: { type: Number, default: 0 }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id
amenityBookingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('AmenityBooking', amenityBookingSchema);
