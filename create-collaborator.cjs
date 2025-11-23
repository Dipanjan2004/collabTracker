const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  avatarUrl: String,
  active: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createCollaborator = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'collaborator@collabtrack.app';
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      existingUser.role = 'collaborator';
      await existingUser.save();
      console.log('Existing user updated to collaborator');
      console.log(`Email: ${email}`);
    } else {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Collaborator123!', 10);
      
      const collaborator = new User({
        name: 'Collaborator',
        email: email,
        password: hashedPassword,
        role: 'collaborator',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Collaborator',
        active: true,
      });

      await collaborator.save();
      console.log('Collaborator user created');
      console.log(`Email: ${email}`);
      console.log('Password: Collaborator123!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createCollaborator();

