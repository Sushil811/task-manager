import express from 'express';
import jwt from 'jsonwebtoken';
import CodingProblem from '../models/CodingProblem';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// GET all coding problems
router.get('/', async (req: any, res) => {
  try {
    const problems = await CodingProblem.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(problems);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new coding problem
router.post('/', async (req: any, res) => {
  try {
    const { title, difficulty, link, notes, description } = req.body;
    
    const newProblem = new CodingProblem({
      user: req.user.id,
      title,
      difficulty: difficulty || 'Medium',
      link,
      notes,
      description
    });
    const savedProblem = await newProblem.save();
    res.json(savedProblem);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT update a coding problem
router.put('/:id', async (req: any, res) => {
  try {
    const { status, solutionCode, language, description } = req.body;
    let problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });
    if (problem.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

    if (status) problem.status = status;
    if (solutionCode !== undefined) problem.solutionCode = solutionCode;
    if (language !== undefined) problem.language = language;
    if (description !== undefined) problem.description = description;
    
    await problem.save();
    res.json(problem);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE a coding problem
router.delete('/:id', async (req: any, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    if (!problem) return res.status(404).json({ msg: 'Problem not found' });
    if (problem.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });
    
    await CodingProblem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Problem removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
