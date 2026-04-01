import express from 'express';
import Complaint from '../models/Complaint';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/v1/complaints
 * @desc    Get all complaints (Admin/Committee sees all, Resident sees their own)
 * @access  Private
 */
router.get('/', protect, async (req: any, res) => {
  try {
    let query: any = {};
    if (req.user.role === 'RESIDENT') {
      query.userId = req.user.id;
    }
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name flatId');
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/v1/complaints
 * @desc    Create a new complaint
 * @access  Private/Resident
 */
router.post('/', protect, async (req: any, res) => {
  try {
    const complaint = new Complaint({
      ...req.body,
      userId: req.user.id,
      flatId: req.user.flatId || 'N/A' // Fallback if user has no flatId
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/v1/complaints/:id
 * @desc    Update complaint status or priority
 * @access  Private
 */
router.patch('/:id', protect, async (req: any, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isAdmin = ['ADMIN', 'COMMITTEE'].includes(req.user.role);
    const isOwner = complaint.userId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (isAdmin) {
      if (req.body.status) complaint.status = req.body.status;
      if (req.body.priority) complaint.priority = req.body.priority;
      if (req.body.category) complaint.category = req.body.category;
    } else {
      // Resident can only close their own complaint
      if (req.body.status === 'CLOSED') {
        complaint.status = 'CLOSED';
      } else {
        return res.status(403).json({ message: 'Residents can only close their own tickets' });
      }
    }

    await complaint.save();
    res.json(complaint);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/v1/complaints/:id
 * @desc    Delete a complaint
 * @access  Private/Admin/Committee
 */
router.delete('/:id', protect, authorize(['ADMIN', 'COMMITTEE']), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
