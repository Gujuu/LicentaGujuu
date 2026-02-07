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

// GET /api/reservations - Get all reservations (admin only)
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const { status } = req.query;

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    const hasStatusFilter = typeof status === 'string' && validStatuses.includes(status);

    const reservations = await query(
      hasStatusFilter
        ? `SELECT * FROM reservations WHERE status = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
        : `SELECT * FROM reservations ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      hasStatusFilter ? [status] : []
    );
    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// GET /api/reservations/my - Get user's own reservations
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req);
    const { status } = req.query;

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    const hasStatusFilter = typeof status === 'string' && validStatuses.includes(status);

    const reservations = await query(
      hasStatusFilter
        ? `SELECT * FROM reservations WHERE email = ? AND status = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
        : `SELECT * FROM reservations WHERE email = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      hasStatusFilter ? [req.user.email, status] : [req.user.email]
    );
    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

// POST /api/reservations - Create a new reservation
router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Please provide a valid phone number'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide a valid time'),
  body('guests').isInt({ min: 1, max: 20 }).withMessage('Number of guests must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, date, time, guests, specialRequests } = req.body;

    const result = await query(
      'INSERT INTO reservations (customer_name, email, phone, date, time, guests, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, date, time, guests, specialRequests || null]
    );

    res.status(201).json({
      message: 'Reservation created successfully',
      reservationId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reservation', error: error.message });
  }
});

// PUT /api/reservations/:id - Update reservation status (admin only)
router.put('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'Reservation updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation', error: error.message });
  }
});

// DELETE /api/reservations/:id - Cancel reservation (user can cancel their own, admin can cancel any)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns this reservation or is admin
    const reservations = await query('SELECT * FROM reservations WHERE id = ?', [id]);
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const reservation = reservations[0];
    if (req.user.role !== 'admin' && reservation.email !== req.user.email) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await query('UPDATE reservations SET status = "cancelled" WHERE id = ?', [id]);

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling reservation', error: error.message });
  }
});

module.exports = router;