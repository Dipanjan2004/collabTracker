import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications.map(n => ({
      id: n._id.toString(),
      userId: n.userId.toString(),
      type: n.type,
      message: n.message,
      read: n.read,
      payload: n.payload,
      createdAt: n.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

