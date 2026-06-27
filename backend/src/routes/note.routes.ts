import express from 'express';
import jwt from 'jsonwebtoken';
import Note from '../models/Note';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// Get all notes for user
router.get('/', async (req: any, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create note
router.post('/', async (req: any, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const newNote = new Note({
      user: req.user.id,
      title: title || 'Untitled Note',
      content: content || 'Start writing...',
      tags: tags || []
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update note
router.put('/:id', async (req: any, res) => {
  try {
    const { title, content, tags } = req.body;
    
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: { title, content, tags } },
      { new: true }
    );
    
    res.json(updatedNote);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete note
router.delete('/:id', async (req: any, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Note removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
