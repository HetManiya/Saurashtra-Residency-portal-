import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware';
import Maintenance from '../models/Maintenance';
import Complaint from '../models/Complaint';
import Visitor from '../models/Visitor';

const router = express.Router();

/**
 * @route   GET /api/v1/admin/summary
 * @desc    Get high-level statistics for the Admin Dashboard
 * @access  Private/Admin
 */
router.get('/summary', protect, adminOnly, async (req, res) => {
  try {
    // 1. Calculate Maintenance Stats
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

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

    const stats = maintenanceStats[0] || { totalCollected: 0, totalPending: 0 };

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
router.patch('/complaints/:id/resolve', protect, adminOnly, async (req, res) => {
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
