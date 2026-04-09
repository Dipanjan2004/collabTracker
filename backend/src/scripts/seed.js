import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'demo.admin@collabtrack.app' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Dipanjan',
      email: 'demo.admin@collabtrack.app',
      password: 'DemoPass123',
      role: 'admin',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dipanjan',
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: demo.admin@collabtrack.app');
    console.log('🔑 Password: DemoPass123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
};

seedAdmin();

