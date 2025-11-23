import express from 'express';
const router = express.Router();
import { auth } from '../middleware/auth.js';
import TaskDependency from '../models/TaskDependency.js';

router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const dependencies = await TaskDependency.find({
      $or: [
        { taskId: req.params.taskId },
        { dependsOnTaskId: req.params.taskId },
      ],
    })
      .populate('taskId', 'title')
      .populate('dependsOnTaskId', 'title');

    res.json(dependencies.map(d => ({
      id: d._id.toString(),
      taskId: d.taskId._id.toString(),
      dependsOnTaskId: d.dependsOnTaskId._id.toString(),
      type: d.type,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { taskId, dependsOnTaskId, type } = req.body;

    const dependency = new TaskDependency({
      taskId,
      dependsOnTaskId,
      type,
    });

    await dependency.save();

    res.status(201).json({
      id: dependency._id.toString(),
      taskId: dependency.taskId.toString(),
      dependsOnTaskId: dependency.dependsOnTaskId.toString(),
      type: dependency.type,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await TaskDependency.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

