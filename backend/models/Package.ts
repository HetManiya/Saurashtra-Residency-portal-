
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  flatId: { type: String, required: true, index: true },
  residentName: { type: String },
  carrier: { type: String, required: true }, // e.g., Amazon, Flipkart, Zomato
  trackingNumber: { type: String },
  status: { 
    type: String, 
    enum: ['AT_GATE', 'COLLECTED', 'RETURNED'], 
    default: 'AT_GATE' 
  },
  receivedAt: { type: Date, default: Date.now },
  collectedAt: { type: Date },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Security/Admin who received it
  notes: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

packageSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Package', packageSchema);
