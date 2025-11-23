import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';

router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: 1 });

    res.json(comments.map(c => ({
      id: c._id.toString(),
      taskId: c.taskId.toString(),
      userId: c.userId._id.toString(),
      userName: c.userName,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt ? c.updatedAt.toISOString() : undefined,
      parentId: c.parentId ? c.parentId.toString() : undefined,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { taskId, content, parentId } = req.body;

    const comment = new Comment({
      taskId,
      userId: req.user._id,
      userName: req.user.name,
      content,
      parentId,
    });

    await comment.save();

    const activity = new Activity({
      userId: req.user._id,
      userName: req.user.name,
      action: 'commented on task',
      targetType: 'task',
      targetId: taskId,
    });
    await activity.save();

    res.status(201).json({
      id: comment._id.toString(),
      taskId: comment.taskId.toString(),
      userId: comment.userId.toString(),
      userName: comment.userName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      parentId: parentId || undefined,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    comment.content = req.body.content;
    comment.updatedAt = new Date();
    await comment.save();

    res.json({
      id: comment._id.toString(),
      content: comment.content,
      updatedAt: comment.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

