import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import ProgressLog from '../models/ProgressLog.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const logs = await ProgressLog.find({ taskId: req.params.taskId })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.json(logs.map(log => ({
      id: log._id.toString(),
      taskId: log.taskId.toString(),
      userId: log.userId._id.toString(),
      date: log.date.toISOString(),
      progressText: log.progressText,
      percentageComplete: log.percentageComplete,
      hoursSpent: log.hoursSpent,
      attachments: log.attachments,
      links: log.links,
      feedbackStatus: log.feedbackStatus,
      adminFeedback: log.adminFeedback,
      createdAt: log.createdAt.toISOString(),
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const logData = {
      ...req.body,
      userId: req.user._id,
      taskId: mongoose.Types.ObjectId.isValid(req.body.taskId) 
        ? new mongoose.Types.ObjectId(req.body.taskId) 
        : req.body.taskId,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    };

    const log = new ProgressLog(logData);
    await log.save();

    await Task.findByIdAndUpdate(req.body.taskId, { updatedAt: new Date() });

    const task = await Task.findById(req.body.taskId).populate('createdBy');
    if (task && task.createdBy._id.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: task.createdBy._id,
        type: 'progress_submitted',
        message: `${req.user.name} submitted progress for '${task.title}'`,
        payload: { taskId: task._id.toString(), progressId: log._id.toString() },
      });
      await notification.save();
    }

    res.status(201).json({
      id: log._id.toString(),
      taskId: log.taskId.toString(),
      userId: log.userId.toString(),
      date: log.date.toISOString(),
      progressText: log.progressText,
      percentageComplete: log.percentageComplete,
      hoursSpent: log.hoursSpent,
      attachments: log.attachments,
      links: log.links,
      feedbackStatus: log.feedbackStatus,
      createdAt: log.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { feedback } = req.body;
    const log = await ProgressLog.findByIdAndUpdate(
      req.params.id,
      {
        feedbackStatus: 'approved',
        adminFeedback: feedback || '',
      },
      { new: true }
    ).populate('userId', 'name');

    if (!log) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    const notification = new Notification({
      userId: log.userId._id,
      type: 'progress_approved',
      message: `Your progress was approved`,
      payload: { taskId: log.taskId.toString(), progressId: log._id.toString() },
    });
    await notification.save();

    const activity = new Activity({
      userId: req.user._id,
      userName: req.user.name,
      action: 'approved progress',
      targetType: 'progress',
      targetId: log._id.toString(),
    });
    await activity.save();

    res.json({
      id: log._id.toString(),
      feedbackStatus: log.feedbackStatus,
      adminFeedback: log.adminFeedback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { feedback } = req.body;
    const log = await ProgressLog.findByIdAndUpdate(
      req.params.id,
      {
        feedbackStatus: 'rejected',
        adminFeedback: feedback || '',
      },
      { new: true }
    ).populate('userId', 'name');

    if (!log) {
      return res.status(404).json({ error: 'Progress log not found' });
    }

    const notification = new Notification({
      userId: log.userId._id,
      type: 'progress_rejected',
      message: `Your progress was rejected`,
      payload: { taskId: log.taskId.toString(), progressId: log._id.toString() },
    });
    await notification.save();

    res.json({
      id: log._id.toString(),
      feedbackStatus: log.feedbackStatus,
      adminFeedback: log.adminFeedback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

