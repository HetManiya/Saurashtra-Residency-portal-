import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String, required: true },
  entity: { type: String, required: true }, // e.g., 'User', 'Meeting', 'Notice'
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);
