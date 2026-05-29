import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  mediaData: { type: String, required: true },
  mediaType: { type: String, required: true },
  mediaCategory: { type: String, enum: ['image', 'video'], required: true },
  title: { type: String, default: 'Voidstone Studio' },
  subtitle: { type: String, default: 'Handcrafted maximalism for the unique individual.' },
  buttonText: { type: String, default: 'Explore Collection' },
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileSize: Number,
  isUrl: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Hero', heroSchema);