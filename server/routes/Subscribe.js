import { Router } from 'express';
import Subscriber from '../models/Subscriber.js';
import nodemailer from 'nodemailer';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

// Public: Subscribe
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const exists = await Subscriber.findOne({ email: email.toLowerCase() });
    if (exists) {
      if (!exists.active) {
        exists.active = true;
        await exists.save();
        return res.json({ message: 'Welcome back! You have been re-subscribed.' });
      }
      return res.json({ message: 'You are already subscribed!' });
    }

    await Subscriber.create({ email: email.toLowerCase() });
    res.json({ message: 'Successfully subscribed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Unsubscribe (via link in email)
router.get('/unsubscribe/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();
    await Subscriber.findOneAndUpdate({ email }, { active: false });
    res.send('<h1>You have been unsubscribed.</h1><p>You will no longer receive emails from Voidstone Studio.</p>');
  } catch (err) {
    res.status(500).send('Error unsubscribing');
  }
});

// Admin: Get subscriber count
router.get('/count', authenticateToken, authorizeAdmin, async (req, res) => {
  const count = await Subscriber.countDocuments({ active: true });
  res.json({ count });
});

// Admin: Send newsletter to all active subscribers
router.post('/send', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { subject, content } = req.body;
    if (!subject || !content) return res.status(400).json({ error: 'Subject and content required' });

    const subscribers = await Subscriber.find({ active: true });
    if (subscribers.length === 0) return res.json({ message: 'No active subscribers' });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const apiUrl = process.env.API_URL || 'https://server--servervoidstone--mpfdn46pqp5y.code.run';

    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      try {
        const unsubscribeLink = `${apiUrl}/api/subscribe/unsubscribe/${encodeURIComponent(sub.email)}`;
        
        const emailHTML = `
          ${content}
          <br><br>
          <hr style="border:1px solid #333;margin:30px 0">
          <p style="font-size:10px;color:#666;text-align:center">
            © ${new Date().getFullYear()} Voidstone Studio. 
            <a href="${unsubscribeLink}" style="color:#ff6b35">Unsubscribe</a> if you no longer wish to receive these emails.
          </p>
        `;

        await transporter.sendMail({
          from: `"Voidstone Studio" <${process.env.EMAIL_USER}>`,
          to: sub.email,
          subject: subject,
          html: emailHTML
        });
        sent++;
        // 200ms delay to respect Gmail rate limits
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error(`Failed: ${sub.email}`, err.message);
        failed++;
      }
    }

    res.json({ message: `Sent to ${sent} subscribers${failed > 0 ? ` (${failed} failed)` : ''}` });
  } catch (err) {
    console.error('Newsletter send error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;