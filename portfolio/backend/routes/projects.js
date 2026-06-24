const express = require('express');
const Project = require('../models/Project');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// PUBLIC: anyone visiting the site can read projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Could not load projects.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Could not load project.' });
  }
});

// PROTECTED: only Abu (logged in via fingerprint/password) can create/edit/delete
router.post('/', requireAuth, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: 'Could not create project. Check your input.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: 'Could not update project.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete project.' });
  }
});

module.exports = router;
