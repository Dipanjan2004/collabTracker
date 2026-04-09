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

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: npm run make-admin <email>');
      console.log('Example: npm run make-admin your@email.com');
      process.exit(1);
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    
    console.log(`User ${user.name} (${email}) is now an admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();

