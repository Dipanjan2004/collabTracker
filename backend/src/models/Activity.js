import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['task', 'progress', 'user'],
    required: true,
  },
  targetId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Activity', activitySchema);

