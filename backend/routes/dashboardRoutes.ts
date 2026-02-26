import express from 'express';
import { protect } from '../middleware/authMiddleware';
import User from '../models/User';
import Maintenance from '../models/Maintenance';
import Notice from '../models/Notice';

const router = express.Router();

/**
 * @route   GET /api/v1/dashboard/resident
 * @desc    Get dashboard data for a specific resident
 * @access  Private (Resident)
 */
router.get('/resident', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    let user = await User.findById(userId);

    if (!user) {
      // Fallback for demo IDs if DB is not ready
      if (userId === '507f1f77bcf86cd799439012') {
        user = { name: 'John Doe', flatId: 'A-1-101', role: 'RESIDENT' } as any;
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    // 1. Get Pending Dues
    const pendingDues = await Maintenance.find({
      flatId: user.flatId,
      status: { $in: ['Pending', 'Overdue'] }
    });

    const totalPendingAmount = pendingDues.reduce((sum, record) => sum + record.amount, 0);

    // 2. Get 2 Recent Notices
    const recentNotices = await Notice.find()
      .sort({ createdAt: -1 })
      .limit(2);

    // 3. Construct Response
    res.json({
      resident: {
        name: user.name,
        flatId: user.flatId,
        role: user.role
      },
      maintenance: {
        totalPending: totalPendingAmount,
        currency: 'INR',
        pendingRecords: pendingDues.map(d => ({
          month: d.month,
          year: d.year,
          amount: d.amount,
          status: d.status
        }))
      },
      announcements: recentNotices.map(n => ({
        id: n._id,
        title: n.title,
        content: n.content,
        category: n.category,
        date: n.date
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

export default router;
