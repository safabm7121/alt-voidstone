// server/routes/wishlist.js
import { Router } from 'express';
import Wishlist from '../models/Wishlist.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get user's wishlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.userId }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.userId, products: [] });
      wishlist = await wishlist.populate('products');
    }
    res.json({ wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to wishlist
router.post('/:productId', authenticateToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user.userId, products: [req.params.productId] });
    } else if (!wishlist.products.includes(req.params.productId)) {
      wishlist.products.push(req.params.productId);
      await wishlist.save();
    }
    wishlist = await wishlist.populate('products');
    res.json({ wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove product from wishlist
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
      await wishlist.save();
    }
    const updated = await Wishlist.findOne({ userId: req.user.userId }).populate('products');
    res.json({ wishlist: updated || { products: [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;