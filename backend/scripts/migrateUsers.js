require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Count applications for this user
      const totalApplications = await Application.countDocuments({ userId: user._id });
      const pendingApplications = await Application.countDocuments({ 
        userId: user._id, 
        status: 'pending' 
      });
      const approvedApplications = await Application.countDocuments({ 
        userId: user._id, 
        status: 'approved' 
      });

      // Update user with actual counts
      await User.findByIdAndUpdate(user._id, {
        totalApplications,
        pendingApplications,
        approvedApplications
      });

      console.log(`Updated user ${user.email}: Total=${totalApplications}, Pending=${pendingApplications}, Approved=${approvedApplications}`);
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateUsers();
