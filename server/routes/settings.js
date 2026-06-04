// server/routes/settings.js
import { Router } from 'express';
import Settings from '../models/Settings.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

// Get settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      if (req.body.categoryBanners) {
        settings.categoryBanners = { ...settings.categoryBanners, ...req.body.categoryBanners };
      }
      if (req.body.highlightedProducts) {
        settings.highlightedProducts = req.body.highlightedProducts;
      }
      await settings.save();
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;