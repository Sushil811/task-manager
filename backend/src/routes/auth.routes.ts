import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'Please login using OAuth provider' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update current user profile
router.put('/me', authMiddleware, async (req: any, res: any) => {
  try {
    const { name, email, avatar } = req.body;
    
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (email && email !== user.email) {
       const existingUser = await User.findOne({ email });
       if (existingUser) {
          return res.status(400).json({ msg: 'Email is already in use' });
       }
       user.email = email;
    }
    
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, avatar: user.avatar });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

import passport from 'passport';

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=true' }), (req: any, res: any) => {
  const payload = { user: { id: req.user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login?error=true' }), (req: any, res: any) => {
  const payload = { user: { id: req.user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
});

export default router;
