import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// Get gamification stats
router.get('/', async (req: any, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      if (req.user.id === '000000000000000000000000') {
        // Create mock dev user
        user = new User({
          _id: req.user.id,
          name: 'Developer',
          email: 'dev@local.com',
          xp: 850,
          level: 12,
          streak: 14
        });
        await user.save();
      } else {
        return res.status(404).json({ msg: 'User not found' });
      }
    }
    res.json({ xp: user.xp, level: user.level, streak: user.streak });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Award XP to user
router.post('/award-xp', async (req: any, res) => {
  try {
    const { amount } = req.body;
    let user = await User.findById(req.user.id);
    
    if (!user) {
       if (req.user.id === '000000000000000000000000') {
          user = new User({
            _id: req.user.id,
            name: 'Developer',
            email: 'dev@local.com',
            xp: 850,
            level: 12,
            streak: 14
          });
       } else {
          return res.status(404).json({ msg: 'User not found' });
       }
    }
    
    user.xp += amount;
    
    // Simple level up logic: 100 XP per level
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }
    
    await user.save();
    res.json({ xp: user.xp, level: user.level, streak: user.streak });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
