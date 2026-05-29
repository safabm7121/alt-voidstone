import { Router } from 'express';
import Hero from '../models/Hero.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/active', async (req, res) => {
  const hero = await Hero.findOne({ isActive: true }).sort({ createdAt: -1 });
  res.json({ hero });
});

router.post('/upload', authenticateToken, authorizeAdmin, async (req, res) => {
  const { imageData, imageType, fileSize, mediaUrl } = req.body;

  let mediaData, mediaType, isUrl;
  if (mediaUrl) {
    mediaData = mediaUrl;
    mediaType = imageType || 'image/jpeg';
    isUrl = true;
  } else {
    mediaData = imageData;
    mediaType = imageType;
    isUrl = false;
  }

  await Hero.updateMany({ isActive: true }, { isActive: false });
  const hero = await Hero.create({
    mediaData, mediaType,
    mediaCategory: mediaType.startsWith('video') ? 'video' : 'image',
    uploadedBy: req.user.userId,
    fileSize: fileSize || 0,
    isUrl
  });

  res.json({ hero });
});

router.delete('/image', authenticateToken, authorizeAdmin, async (req, res) => {
  await Hero.deleteMany({});
  res.json({ message: 'Hero media deleted' });
});

router.put('/text', authenticateToken, authorizeAdmin, async (req, res) => {
  const hero = await Hero.findOne({ isActive: true });
  if (!hero) return res.status(404).json({ error: 'No active hero' });
  if (req.body.title) hero.title = req.body.title;
  if (req.body.subtitle) hero.subtitle = req.body.subtitle;
  if (req.body.buttonText) hero.buttonText = req.body.buttonText;
  await hero.save();
  res.json({ hero });
});

export default router;