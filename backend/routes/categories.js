const express = require('express');
const { pool } = require('../db/pool');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Category" ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
router.post('/', protect, checkRole('ADMIN'), async (req, res) => {
  const { name, slug, sort_order } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "Category" (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, sort_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
router.put('/:id', protect, checkRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { name, slug, sort_order } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Category" SET name = $1, slug = $2, sort_order = $3 WHERE id = $4 RETURNING *',
      [name, slug, sort_order, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
router.delete('/:id', protect, checkRole('ADMIN'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM "Category" WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    // Handle foreign key constraint error
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Cannot delete category. It is associated with existing products.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
