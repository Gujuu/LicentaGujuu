const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const parsePagination = (req) => {
  const limitRaw = Number.parseInt(String(req.query.limit ?? '50'), 10);
  const offsetRaw = Number.parseInt(String(req.query.offset ?? '0'), 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;
  return { limit, offset };
};

const parseIsRead = (value) => {
  if (value === undefined) return undefined;
  if (value === 'true' || value === '1' || value === 1 || value === true) return true;
  if (value === 'false' || value === '0' || value === 0 || value === false) return false;
  return undefined;
};

// GET /api/contact - Get all contact messages (admin only)
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const isRead = parseIsRead(req.query.is_read);

    const messages = await query(
      typeof isRead === 'boolean'
        ? `SELECT * FROM contact_messages WHERE is_read = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
        : `SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      typeof isRead === 'boolean' ? [isRead] : []
    );
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// POST /api/contact - Send contact message
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    // Save to database
    const result = await query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );

    // TODO: Send email notification to admin
    console.log('New contact message:', { name, email, subject, message });

    res.json({
      message: 'Message sent successfully! We will get back to you soon.',
      messageId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// PUT /api/contact/:id/read - Mark message as read (admin only)
router.put('/:id/read', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    await query('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [id]);

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

// DELETE /api/contact/:id - Delete message (admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM contact_messages WHERE id = ?', [id]);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

module.exports = router;