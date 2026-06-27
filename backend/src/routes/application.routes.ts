import express from 'express';
import jwt from 'jsonwebtoken';
import JobApplication from '../models/JobApplication';

const router = express.Router();

import { authMiddleware } from '../middleware/auth';

router.use(authMiddleware);

// GET all applications for a user
router.get('/', async (req: any, res) => {
  try {
    const applications = await JobApplication.find({ user: req.user.id }).sort({ appliedDate: -1 });
    res.json(applications);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST a new application
router.post('/', async (req: any, res) => {
  try {
    const { company, role, status, link, nextInterviewDate } = req.body;

    const newApplication = new JobApplication({
      user: req.user.id,
      company: company || 'New Company',
      role: role || 'Software Engineer',
      status: status || 'Applied',
      link,
      nextInterviewDate
    });

    const application = await newApplication.save();
    res.json(application);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT update an application
router.put('/:id', async (req: any, res) => {
  try {
    const { company, role, status, nextInterviewDate } = req.body;

    let application = await JobApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (company) application.company = company;
    if (role) application.role = role;
    if (status) application.status = status;
    if (nextInterviewDate !== undefined) application.nextInterviewDate = nextInterviewDate;

    await application.save();
    res.json(application);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE an application
router.delete('/:id', async (req: any, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Application removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
