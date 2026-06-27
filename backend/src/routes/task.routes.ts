import express from 'express';
import jwt from 'jsonwebtoken';
import Task from '../models/Task';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// Get all tasks for user
router.get('/', async (req: any, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create task
router.post('/', async (req: any, res) => {
  try {
    const { title, description, priority, category, status, dueDate, estimatedTime, tags } = req.body;
    
    const newTask = new Task({
      user: req.user.id,
      title,
      description,
      priority,
      category,
      status,
      dueDate,
      estimatedTime,
      tags
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update task
router.put('/:id', async (req: any, res) => {
  try {
    const { title, description, priority, category, status, dueDate, estimatedTime, tags } = req.body;
    
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    // Ensure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, priority, category, status, dueDate, estimatedTime, tags } },
      { new: true }
    );
    
    res.json(updatedTask);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete task
router.delete('/:id', async (req: any, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    
    // Ensure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
