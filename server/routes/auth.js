import { Router } from 'express';
import User from '../models/User.js';
import { hashPassword, comparePasswords, generateToken, generateRefreshToken, generateVerificationCode } from '../utils/helpers.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate verification code (UPPERCASE)
    const code = generateVerificationCode().toUpperCase();

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      verificationCode: code,
      isVerified: false,
      resetPasswordCode: null,
      resetPasswordExpires: null
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, code, firstName);
    } catch (emailErr) {
      console.log('Verification email failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'User created. Please verify your email.',
      email: user.email,
      code: process.env.NODE_ENV === 'development' ? code : undefined // Only for testing
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await comparePasswords(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }
    
    // Case insensitive match
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      verificationCode: { $regex: new RegExp(`^${code}$`, 'i') }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Return success even if user not found for security
      return res.json({ message: 'If the email exists, a reset code has been sent.' });
    }

    // Generate UPPERCASE code
    const code = generateVerificationCode().toUpperCase();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(`Reset code for ${email}: ${code}`); // Log for debugging

    try {
      await sendPasswordResetEmail(email, code, user.firstName);
    } catch (emailErr) {
      console.log('Reset email failed:', emailErr.message);
    }

    res.json({ 
      message: 'If the email exists, a reset code has been sent.',
      ...(process.env.NODE_ENV === 'development' && { code }) // Only for testing
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    // Validate required fields
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    console.log('Reset attempt:', { email, code: code.toUpperCase() });
    
    // Case insensitive code matching
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordCode: { $regex: new RegExp(`^${code}$`, 'i') },
      resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('User found:', !!user);
    if (user) {
      console.log('Stored code:', user.resetPasswordCode);
      console.log('Provided code:', code);
      console.log('Expires:', new Date(user.resetPasswordExpires));
      console.log('Now:', new Date(Date.now()));
    }
    
    if (!user) {
      // Check if code exists but expired
      const userWithCode = await User.findOne({ 
        email: email.toLowerCase(), 
        resetPasswordCode: { $regex: new RegExp(`^${code}$`, 'i') }
      });
      if (userWithCode) {
        return res.status(400).json({ error: 'Reset code has expired. Request a new one.' });
      }
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Reset password
    user.password = await hashPassword(newPassword);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -verificationCode -resetPasswordCode -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;