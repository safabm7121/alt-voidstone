import { Router } from 'express';
import Product from '../models/Product.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';
import { productSchema } from '../validators/product.js';

const router = Router();

router.get('/', async (req, res) => {
  const products = await Product.find({ is_active: true }).sort({ createdAt: -1 });
  res.json({ products });
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const product = await Product.create({ ...req.body, created_by: req.user.userId });
  res.status(201).json({ product });
});

router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

export default router;