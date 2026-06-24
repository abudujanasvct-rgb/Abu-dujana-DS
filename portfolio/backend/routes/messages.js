const express = require('express');
const Message = require('../models/Message');
const requireAuth = require('../middleware/requireAuth');
const { contactLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// PUBLIC: visitors send a message
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are all required.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message is too long.' });
    }

    await Message.create({
      name,
      email,
      message,
      ip: req.ip
    });

    res.status(201).json({ success: true, note: 'Message sent. Abu will get back to you.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not send message. Please try again.' });
  }
});

// PROTECTED: only Abu can read messages
router.get('/', requireAuth, async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(msg);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
