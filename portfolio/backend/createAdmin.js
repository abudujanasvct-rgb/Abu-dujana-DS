// Run this ONCE locally to create your admin account.
// Usage: node createAdmin.js youremail@example.com yourStrongPassword
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: node createAdmin.js <email> <password>');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('Use a stronger password (10+ characters).');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error('Admin with this email already exists.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ email: email.toLowerCase(), passwordHash });

  console.log('Admin account created successfully:', admin.email);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
