import express from 'express';
import Amenity from '../models/Amenity';
import AmenityBooking from '../models/AmenityBooking';
import Notification from '../models/Notification';
import User from '../models/User';
import { protect, authorize } from '../middleware/authMiddleware';
import AuditLog from '../models/AuditLog';

const router = express.Router();

// Get all amenities
router.get('/', protect, async (req, res) => {
  try {
    const amenities = await Amenity.find();
    res.json(amenities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching amenities' });
  }
});

// Get all bookings (Admin sees all, Resident sees their own)
router.get('/bookings', protect, async (req: any, res) => {
  try {
    let query: any = {};
    if (req.user.role === 'RESIDENT') {
      query.userId = req.user.id;
    }
    const bookings = await AmenityBooking.find(query).populate('amenityId').populate('userId', 'name').sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Create a booking
router.post('/bookings', protect, async (req: any, res) => {
  try {
    const { amenityId, date, startTime, endTime } = req.body;

    // Prevent double-booking: Check for overlapping approved or pending bookings
    const existingBooking = await AmenityBooking.findOne({
      amenityId,
      date: new Date(date),
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Amenity is already booked for this time slot.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const booking = new AmenityBooking({
      ...req.body,
      userId: req.user.id,
      flatId: user.flatId || 'N/A'
    });
    await booking.save();
    
    // Populate for immediate frontend update
    const populatedBooking = await AmenityBooking.findById(booking._id)
      .populate('amenityId')
      .populate('userId', 'name');

    // Log action
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Amenity Booking',
      entity: 'AmenityBooking',
      details: `Booked: ${booking.amenityId} on ${booking.date}`
    });

    res.status(201).json(populatedBooking);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Error creating booking' });
  }
});

// Update booking status and priority (Admin/Committee)
router.patch('/bookings/:id', protect, authorize(['ADMIN', 'COMMITTEE']), async (req: any, res) => {
  try {
    const { status, priority } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const booking = await AmenityBooking.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('amenityId');
    
    if (booking && status) {
      // Create notification for user
      const amenityName = (booking.amenityId as any)?.name || 'Facility';
      await Notification.create({
        userId: booking.userId,
        title: `Booking ${status}`,
        message: `Your booking for ${amenityName} on ${new Date(booking.date).toLocaleDateString()} has been ${status.toLowerCase()}.`,
        type: 'AMENITY_BOOKING'
      });
      
      // Log action
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Update Booking Status',
        entity: 'AmenityBooking',
        details: `Status updated to ${status} for booking ${req.params.id}`
      });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error updating booking' });
  }
});

// Bulk update bookings (Admin/Committee)
router.post('/bookings/bulk-update', protect, authorize(['ADMIN', 'COMMITTEE']), async (req: any, res) => {
  try {
    const { bookingIds, status } = req.body;
    
    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ message: 'No bookings selected' });
    }

    await AmenityBooking.updateMany(
      { _id: { $in: bookingIds } },
      { $set: { status } }
    );

    // Fetch updated bookings to return
    const updatedBookings = await AmenityBooking.find({ _id: { $in: bookingIds } })
      .populate('amenityId')
      .populate('userId', 'name');

    // Notify users
    for (const booking of updatedBookings) {
      const amenityName = (booking.amenityId as any)?.name || 'Facility';
      await Notification.create({
        userId: booking.userId,
        title: `Booking ${status}`,
        message: `Your booking for ${amenityName} on ${new Date(booking.date).toLocaleDateString()} has been ${status.toLowerCase()}.`,
        type: 'AMENITY_BOOKING'
      });
    }

    // Log action
    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      action: 'Bulk Update Bookings',
      entity: 'AmenityBooking',
      details: `Bulk updated ${bookingIds.length} bookings to ${status}`
    });

    res.json(updatedBookings);
  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk update' });
  }
});

export default router;
