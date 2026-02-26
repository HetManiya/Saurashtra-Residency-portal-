import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import Maintenance from '../models/Maintenance';
import Complaint from '../models/Complaint';
import Visitor from '../models/Visitor';

import User from '../models/User';

const router = express.Router();

// Get pending registrations
router.get('/pending-registrations', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const pending = await User.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Approve registration
router.post('/approve-registration/:id', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'APPROVED' }, { new: true });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Reject registration
router.post('/reject-registration/:id', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'REJECTED' }, { new: true });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/v1/admin/summary
 * @desc    Get high-level statistics for the Admin Dashboard
 * @access  Private/Admin/Committee
 */
router.get('/summary', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    console.log('📊 Fetching Admin Summary...');
    // 1. Calculate Maintenance Stats
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    let stats = { totalCollected: 0, totalPending: 0 };
    try {
      const maintenanceStats = await Maintenance.aggregate([
        { $match: { month: currentMonth, year: currentYear } },
        {
          $group: {
            _id: null,
            totalCollected: {
              $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] }
            },
            totalPending: {
              $sum: { $cond: [{ $eq: ["$status", "Pending"] }, "$amount", 0] }
            }
          }
        }
      ]);
      if (maintenanceStats.length > 0) stats = maintenanceStats[0];
    } catch (aggErr) {
      console.error('❌ Aggregate Error:', aggErr);
    }

    // 2. Count Open Complaints
    const openComplaintsCount = await Complaint.countDocuments({ status: 'OPEN' });

    // 3. Count Active Visitors
    const activeVisitorsCount = await Visitor.countDocuments({ status: 'IN' });

    // 4. Get Recent Unresolved Complaints (Last 3)
    const recentComplaints = await Complaint.find({ status: 'OPEN' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('userId', 'name');

    res.json({
      summary: {
        totalCollected: stats.totalCollected,
        totalPending: stats.totalPending,
        openComplaints: openComplaintsCount,
        activeVisitors: activeVisitorsCount
      },
      recentComplaints: recentComplaints.map(c => ({
        id: c._id,
        residentName: (c.userId as any)?.name || 'Unknown',
        flatId: c.flatId,
        subject: c.subject,
        createdAt: c.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/v1/admin/complaints/:id/resolve
 * @desc    Quickly resolve a complaint
 */
router.patch('/complaints/:id/resolve', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: 'RESOLVED' },
      { new: true }
    );
    res.json(complaint);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
