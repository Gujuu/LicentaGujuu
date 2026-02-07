const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { getStorageDriver, ensureFolderPlaceholder, toPascalCase } = require('../config/mediaStorage');

const router = express.Router();

// GET /api/menu - Get all menu items with categories
router.get('/', async (req, res) => {
  try {
    // Get categories with their items
    const categories = await query(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.image_url as category_image,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', i.id,
            'name', i.name,
            'description', i.description,
            'short_description', i.short_description,
            'full_description', i.full_description,
            'allergens', i.allergens,
            'ingredients', i.ingredients,
            'price', i.price,
            'image_url', i.image_url,
            'is_available', i.is_available
          )
        ) as items
      FROM menu_categories c
      LEFT JOIN menu_items i ON c.id = i.category_id
      GROUP BY c.id, c.name, c.description, c.image_url
      ORDER BY c.id
    `);

    // Parse the JSON items
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image_url: category.category_image,
      items: (() => {
        if (!category.items) return [];

        const parseItemsArray = (value) => {
          if (!value) return [];
          if (Array.isArray(value)) return value;
          if (Buffer.isBuffer(value)) {
            return parseItemsArray(value.toString('utf8'));
          }
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed)) return parsed;
              if (parsed && typeof parsed === 'object') return [parsed];
              return [];
            } catch {
              return [];
            }
          }
          if (typeof value === 'object') {
            return Array.isArray(value) ? value : [value];
          }
          return [];
        };

        const parseJsonArray = (value) => {
          if (!value) return [];
          if (Array.isArray(value)) return value;
          if (Buffer.isBuffer(value)) {
            return parseJsonArray(value.toString('utf8'));
          }
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

        return parseItemsArray(category.items)
          .filter((item) => item && item.id !== null)
          .map((item) => ({
            ...item,
            allergens: parseJsonArray(item.allergens),
            ingredients: parseJsonArray(item.ingredients),
          }));
      })()
    }));

    res.json({ categories: formattedCategories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
});

// GET /api/menu/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM menu_categories ORDER BY id');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// POST /api/menu/categories - Create new category (admin only)
router.post('/categories', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    const result = await query(
      'INSERT INTO menu_categories (name, description, image_url) VALUES (?, ?, ?)',
      [name, description, image_url]
    );

    // Best-effort: create an S3 "folder" for this category so console organization matches.
    // S3 doesn't require folders to exist, but a placeholder object makes it visible.
    try {
      if (getStorageDriver() === 's3' && typeof name === 'string' && name.trim()) {
        const folder = `site/${toPascalCase(name)}`;
        await ensureFolderPlaceholder(folder);
      }
    } catch (e) {
      console.warn('Failed to create S3 folder placeholder for category:', e?.message || e);
    }

    res.status(201).json({
      message: 'Category created successfully',
      categoryId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// PUT /api/menu/categories/:id - Update category (admin only)
router.put('/categories/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    params.push(id);
    await query(`UPDATE menu_categories SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

// DELETE /api/menu/categories/:id - Delete category (admin only)
router.delete('/categories/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM menu_categories WHERE id = ?', [id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// POST /api/menu/items - Create new menu item (admin only)
router.post('/items', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      short_description,
      full_description,
      allergens,
      ingredients,
      price,
      image_url,
      is_available = true,
    } = req.body;

    const toNull = (value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === 'string' && value.trim().length === 0) return null;
      return value;
    };

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedCategoryId = Number(category_id);
    const normalizedPrice = Number(price);

    if (!Number.isFinite(normalizedCategoryId)) {
      return res.status(400).json({ message: 'category_id is required and must be a number' });
    }
    if (normalizedName.length === 0) {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!Number.isFinite(normalizedPrice)) {
      return res.status(400).json({ message: 'price is required and must be a number' });
    }

    const normalizeListField = (value) => {
      if (value === undefined || value === null) return JSON.stringify([]);
      if (typeof value === 'string') {
        return value.trim().length === 0 ? JSON.stringify([]) : value;
      }
      return JSON.stringify(value);
    };

    const result = await query(
      'INSERT INTO menu_items (category_id, name, description, short_description, full_description, allergens, ingredients, price, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        normalizedCategoryId,
        normalizedName,
        toNull(description),
        toNull(short_description),
        toNull(full_description),
        normalizeListField(allergens),
        normalizeListField(ingredients),
        normalizedPrice,
        toNull(image_url),
        is_available ? 1 : 0,
      ]
    );

    res.status(201).json({
      message: 'Menu item created successfully',
      itemId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item', error: error.message });
  }
});

// PUT /api/menu/items/:id - Update menu item (admin only)
router.put('/items/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      short_description,
      full_description,
      allergens,
      ingredients,
      price,
      image_url,
      is_available,
    } = req.body;

    const updates = [];
    const params = [];

    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (short_description !== undefined) {
      updates.push('short_description = ?');
      params.push(short_description);
    }
    if (full_description !== undefined) {
      updates.push('full_description = ?');
      params.push(full_description);
    }
    if (allergens !== undefined) {
      updates.push('allergens = ?');
      params.push(typeof allergens === 'string' ? allergens : JSON.stringify(allergens ?? []));
    }
    if (ingredients !== undefined) {
      updates.push('ingredients = ?');
      params.push(typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients ?? []));
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    if (is_available !== undefined) {
      updates.push('is_available = ?');
      params.push(is_available);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    params.push(id);
    await query(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu item', error: error.message });
  }
});

// DELETE /api/menu/items/:id - Delete menu item (admin only)
router.delete('/items/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM menu_items WHERE id = ?', [id]);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item', error: error.message });
  }
});

module.exports = router;