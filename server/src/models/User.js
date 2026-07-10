const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['citizen', 'authority', 'administrator'], default: 'citizen' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    reputationScore: { type: Number, default: 50, min: 0, max: 100 },
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    notificationEmail: { type: String, default: null },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Static: hash a password
userSchema.statics.hashPassword = async (plain) => bcrypt.hash(plain, 12);

const User = mongoose.model('User', userSchema);
module.exports = User;
