import express from 'express';
import mongoose from 'mongoose';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import ProgressLog from '../models/ProgressLog.js';
import TaskDependency from '../models/TaskDependency.js';

router.get('/', auth, async (req, res) => {
  try {
    const {
      assignedTo,
      status,
      tags,
      search,
      archived,
      projectId,
    } = req.query;

    let query = {};

    if (archived === undefined || archived === 'false') {
      query.archived = false;
    } else if (archived === 'true') {
      query.archived = true;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) {
      query.status = status;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (projectId) {
      query.projectId = projectId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      assignedTo: t.assignedTo.map(u => u._id.toString()),
      tags: t.tags,
      status: t.status,
      priority: t.priority,
      estimatedHours: t.estimatedHours,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      createdBy: t.createdBy._id.toString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      archived: t.archived,
      projectId: t.projectId ? t.projectId.toString() : undefined,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Handle assignedTo - could be populated objects or ObjectIds
    let assignedToIds = [];
    if (task.assignedTo && task.assignedTo.length > 0) {
      assignedToIds = task.assignedTo.map(u => {
        // If populated, use _id, otherwise it's already an ObjectId
        return u._id ? u._id.toString() : u.toString();
      });
    }

    res.json({
      id: task._id.toString(),
      title: task.title,
      description: task.description || '',
      assignedTo: assignedToIds,
      tags: task.tags || [],
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours || 0,
      deadline: task.deadline ? task.deadline.toISOString() : null,
      createdBy: task.createdBy._id ? task.createdBy._id.toString() : task.createdBy.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      archived: task.archived || false,
      projectId: task.projectId ? task.projectId.toString() : undefined,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id,
      assignedTo: (req.body.assignedTo || []).map(id => 
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
      ),
      deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
    };

    const task = new Task(taskData);
    await task.save();

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    const creator = await User.findById(req.user._id);

    for (const userId of task.assignedTo) {
      const userIdValue = userId._id || userId;
      const notification = new Notification({
        userId: userIdValue,
        type: 'task_assigned',
        message: `New task assigned: '${task.title}' — Due ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}`,
        payload: { taskId: task._id.toString() },
      });
      await notification.save();
    }

    const activity = new Activity({
      userId: req.user._id,
      userName: creator.name,
      action: 'created task',
      targetType: 'task',
      targetId: task._id.toString(),
    });
    await activity.save();

    res.status(201).json({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.map(u => u._id.toString()),
      tags: task.tags,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      deadline: task.deadline ? task.deadline.toISOString() : null,
      createdBy: task.createdBy._id.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      archived: task.archived,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    
    if (updateData.assignedTo) {
      updateData.assignedTo = updateData.assignedTo.map(id => 
        mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
      );
    }
    
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('assignedTo', 'name email avatarUrl')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo.map(u => u._id.toString()),
      tags: task.tags,
      status: task.status,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      deadline: task.deadline ? task.deadline.toISOString() : null,
      createdBy: task.createdBy._id.toString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      archived: task.archived,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ taskId: req.params.id });
    await ProgressLog.deleteMany({ taskId: req.params.id });
    await TaskDependency.deleteMany({
      $or: [
        { taskId: req.params.id },
        { dependsOnTaskId: req.params.id },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/archive', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      id: task._id.toString(),
      archived: task.archived,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/unarchive', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      id: task._id.toString(),
      archived: task.archived,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/clone', auth, async (req, res) => {
  try {
    const original = await Task.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const cloned = new Task({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      assignedTo: [],
      status: 'todo',
      createdBy: req.user._id,
      archived: false,
    });

    await cloned.save();

    const user = await User.findById(req.user._id);
    const activity = new Activity({
      userId: req.user._id,
      userName: user.name,
      action: 'cloned task',
      targetType: 'task',
      targetId: cloned._id.toString(),
    });
    await activity.save();

    res.json({
      id: cloned._id.toString(),
      title: cloned.title,
      description: cloned.description,
      assignedTo: [],
      tags: cloned.tags,
      status: cloned.status,
      priority: cloned.priority,
      estimatedHours: cloned.estimatedHours,
      deadline: cloned.deadline ? cloned.deadline.toISOString() : null,
      createdBy: cloned.createdBy.toString(),
      createdAt: cloned.createdAt.toISOString(),
      updatedAt: cloned.updatedAt.toISOString(),
      archived: cloned.archived,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

