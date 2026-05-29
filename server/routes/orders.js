import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sendOrderEmails } from '../utils/email.js';

const router = Router();

router.post('/send', authenticateToken, async (req, res) => {
  try {
    // Log the order first
    console.log('New order received:', {
      orderId: req.body.orderId,
      customer: req.body.shippingInfo?.email,
      total: req.body.cartTotal,
      items: req.body.items?.length
    });

    // Try to send emails but don't fail if email doesn't work
    try {
      await sendOrderEmails(req.body);
    } catch (emailErr) {
      console.error('Email failed but order is valid:', emailErr.message);
      // Continue - the order is still valid
    }

    res.json({ success: true, message: 'Order placed successfully' });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to process order: ' + err.message });
  }
});

export default router;