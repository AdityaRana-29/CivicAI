require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear collections
  await Department.deleteMany({});
  await User.deleteMany({});

  // Create departments
  const departments = await Department.insertMany([
    { name: 'Roads & Infrastructure', issueTypes: ['pothole', 'damaged_road'] },
    { name: 'Electrical', issueTypes: ['broken_streetlight'] },
    { name: 'Waste Management', issueTypes: ['overflowing_garbage'] },
    { name: 'Parks & Environment', issueTypes: ['fallen_tree'] },
    { name: 'Water & Utilities', issueTypes: ['water_leakage'] },
    { name: 'General', issueTypes: ['other'] },
  ]);

  console.log('Departments created:', departments.map((d) => d.name));

  const roadsDept = departments.find((d) => d.name === 'Roads & Infrastructure');

  // Hash passwords
  const adminHash = await User.hashPassword('admin123');
  const authHash = await User.hashPassword('auth123');
  const citizenHash = await User.hashPassword('citizen123');

  const users = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@civicai.com',
      passwordHash: adminHash,
      role: 'administrator',
      notificationEmail: 'admin@civicai.com',
    },
    {
      name: 'Authority User',
      email: 'authority@civicai.com',
      passwordHash: authHash,
      role: 'authority',
      department: roadsDept._id,
      notificationEmail: 'authority@civicai.com',
    },
    {
      name: 'Test Citizen',
      email: 'citizen@civicai.com',
      passwordHash: citizenHash,
      role: 'citizen',
      notificationEmail: 'citizen@civicai.com',
    },
  ]);

  console.log('Users created:');
  users.forEach((u) => console.log(`  ${u.role}: ${u.email} / password: ${u.role === 'administrator' ? 'admin123' : u.role === 'authority' ? 'auth123' : 'citizen123'}`));

  await mongoose.disconnect();
  console.log('Seed complete.');
};

seed().catch((e) => { console.error(e); process.exit(1); });
