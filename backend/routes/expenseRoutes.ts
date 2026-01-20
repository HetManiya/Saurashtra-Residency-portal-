
import express from 'express';
import Expense from '../models/Expense';
import { protect, authorizeAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Get all expenses - Public to all authenticated users for transparency
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, month, year } = req.query;
    let query: any = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0);
      query.date = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Create, Update, Delete - ADMIN ONLY
router.post('/', protect, authorizeAdmin, async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating expense record' });
  }
});

router.patch('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Update failed' });
  }
});

router.delete('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Delete failed' });
  }
});

export default router;
