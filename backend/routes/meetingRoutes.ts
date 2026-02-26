import express from 'express';
import Meeting from '../models/Meeting';
import { protect, authorize } from '../middleware/authMiddleware';
import AuditLog from '../models/AuditLog';

const router = express.Router();

// Get all meetings
router.get('/', protect, async (req, res) => {
  try {
    const meetings = await Meeting.find().populate('rsvps.userId', 'name').sort({ date: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings' });
  }
});

// Schedule a meeting (Admin/Committee)
router.post('/', protect, authorize(['ADMIN', 'COMMITTEE']), async (req: any, res) => {
  try {
    const meeting = new Meeting({
      ...req.body,
      createdBy: req.user.id
    });
    await meeting.save();

    // Log action
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Schedule Meeting',
      entity: 'Meeting',
      details: `Scheduled: ${meeting.title} on ${meeting.date}`
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ message: 'Error scheduling meeting' });
  }
});

// RSVP to a meeting
router.post('/:id/rsvp', protect, async (req: any, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const rsvpIndex = meeting.rsvps.findIndex(r => r.userId.toString() === req.user.id);
    if (rsvpIndex > -1) {
      meeting.rsvps[rsvpIndex].status = status;
    } else {
      meeting.rsvps.push({ userId: req.user.id, status });
    }

    await meeting.save();
    res.json(meeting);
  } catch (error) {
    res.status(400).json({ message: 'Error updating RSVP' });
  }
});

export default router;
