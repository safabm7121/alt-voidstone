// server/models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  categoryBanners: {
    Men: { type: String, default: '' },
    Women: { type: String, default: '' },
    Art: { type: String, default: '' }
  },
  highlightedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);