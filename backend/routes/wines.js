const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

// GET /api/wines - Public list (available only)
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, region, description, full_description, price_glass, price_bottle, image_url, grape, pairing, is_available
       FROM wines
       WHERE is_available = 1
       ORDER BY id ASC`
    );

    const wines = rows.map((w) => ({
      ...w,
      pairing: parseJsonArray(w.pairing),
    }));

    res.json({ wines });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wines', error: error.message });
  }
});

// GET /api/wines/admin - Admin list (all wines)
router.get('/admin', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, name, region, description, full_description, price_glass, price_bottle, image_url, grape, pairing, is_available
       FROM wines
       ORDER BY id ASC`
    );

    const wines = rows.map((w) => ({
      ...w,
      pairing: parseJsonArray(w.pairing),
    }));

    res.json({ wines });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wines', error: error.message });
  }
});

// POST /api/wines - Create wine (admin only)
router.post('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const {
      name,
      region,
      description,
      full_description,
      price_glass,
      price_bottle,
      image_url,
      grape,
      pairing,
      is_available = true,
    } = req.body;

    const result = await query(
      `INSERT INTO wines
        (name, region, description, full_description, price_glass, price_bottle, image_url, grape, pairing, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ,
      [
        name,
        region ?? null,
        description ?? null,
        full_description ?? null,
        price_glass ?? null,
        price_bottle ?? null,
        image_url ?? null,
        grape ?? null,
        typeof pairing === 'string' ? pairing : JSON.stringify(pairing ?? []),
        is_available ? 1 : 0,
      ]
    );

    res.status(201).json({ message: 'Wine created successfully', wineId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating wine', error: error.message });
  }
});

// PUT /api/wines/:id - Update wine (admin only, partial-safe)
router.put('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      region,
      description,
      full_description,
      price_glass,
      price_bottle,
      image_url,
      grape,
      pairing,
      is_available,
    } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (region !== undefined) {
      updates.push('region = ?');
      params.push(region);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (full_description !== undefined) {
      updates.push('full_description = ?');
      params.push(full_description);
    }
    if (price_glass !== undefined) {
      updates.push('price_glass = ?');
      params.push(price_glass);
    }
    if (price_bottle !== undefined) {
      updates.push('price_bottle = ?');
      params.push(price_bottle);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (grape !== undefined) {
      updates.push('grape = ?');
      params.push(grape);
    }
    if (pairing !== undefined) {
      updates.push('pairing = ?');
      params.push(typeof pairing === 'string' ? pairing : JSON.stringify(pairing ?? []));
    }
    if (is_available !== undefined) {
      updates.push('is_available = ?');
      params.push(is_available ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    params.push(id);
    await query(`UPDATE wines SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Wine updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wine', error: error.message });
  }
});

// DELETE /api/wines/:id - Delete wine (admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM wines WHERE id = ?', [id]);
    res.json({ message: 'Wine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting wine', error: error.message });
  }
});

module.exports = router;
