import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  resetPasswordCode: String,
  resetPasswordExpires: Number
}, { timestamps: true });

export default mongoose.model('User', userSchema);