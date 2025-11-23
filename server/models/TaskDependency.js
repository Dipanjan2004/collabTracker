import mongoose from 'mongoose';

const taskDependencySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  dependsOnTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  type: {
    type: String,
    enum: ['blocks', 'required_by'],
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('TaskDependency', taskDependencySchema);

