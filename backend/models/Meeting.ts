import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['AGM', 'COMMITTEE', 'EMERGENCY', 'FESTIVAL'], default: 'COMMITTEE' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rsvps: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['YES', 'NO', 'MAYBE'] }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id
meetingSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model('Meeting', meetingSchema);
