import express from 'express';
import AuditLog from '../models/AuditLog';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Get all audit logs (Admin/Committee)
router.get('/', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

export default router;
