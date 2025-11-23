import mongoose from 'mongoose';

const progressLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  progressText: {
    type: String,
    required: true,
  },
  percentageComplete: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  hoursSpent: {
    type: Number,
    min: 0,
    required: true,
  },
  attachments: [{
    type: String,
  }],
  links: [{
    type: String,
  }],
  feedbackStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminFeedback: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('ProgressLog', progressLogSchema);

