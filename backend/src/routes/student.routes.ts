import express from 'express';
import jwt from 'jsonwebtoken';
import ClassSchedule from '../models/ClassSchedule';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// GET all classes for user
router.get('/classes', async (req: any, res) => {
  try {
    const classes = await ClassSchedule.find({ user: req.user.id });
    res.json(classes);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new class
router.post('/classes', async (req: any, res) => {
  try {
    const { course, type, room, time, credits, grade, resourceLink } = req.body;
    const newClass = new ClassSchedule({
      user: req.user.id,
      course,
      type,
      room,
      time,
      credits: credits || 3,
      grade,
      resourceLink
    });
    const savedClass = await newClass.save();
    res.json(savedClass);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT update a class (e.g. to add a grade)
router.put('/classes/:id', async (req: any, res) => {
  try {
    const { course, type, room, time, credits, grade, resourceLink } = req.body;
    
    let classItem = await ClassSchedule.findById(req.params.id);
    if (!classItem) return res.status(404).json({ msg: 'Class not found' });
    if (classItem.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    classItem = await ClassSchedule.findByIdAndUpdate(
      req.params.id,
      { $set: { course, type, room, time, credits, grade, resourceLink } },
      { new: true }
    );

    res.json(classItem);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE a class
router.delete('/classes/:id', async (req: any, res) => {
  try {
    const classItem = await ClassSchedule.findById(req.params.id);
    if (!classItem) return res.status(404).json({ msg: 'Class not found' });
    if (classItem.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await ClassSchedule.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Class removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
