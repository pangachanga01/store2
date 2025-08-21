const express = require('express');
const { pool } = require('../db/pool');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all carousel slides
// @route   GET /api/carousel
// @access  Public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "CarouselSlide" ORDER BY "order" ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a carousel slide
// @route   POST /api/carousel
// @access  Admin
router.post('/', protect, checkRole('ADMIN'), async (req, res) => {
  const { title, subtitle, image_url, link_type, link_target, button_text, order, effect } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO "CarouselSlide" (title, subtitle, image_url, link_type, link_target, button_text, "order", effect, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [title, subtitle, image_url, link_type, link_target, button_text, order, effect]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a carousel slide
// @route   PUT /api/carousel/:id
// @access  Admin
router.put('/:id', protect, checkRole('ADMIN'), async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, image_url, link_type, link_target, button_text, order, effect } = req.body;
    try {
        const result = await pool.query(
            `UPDATE "CarouselSlide" SET title = $1, subtitle = $2, image_url = $3, link_type = $4, link_target = $5, button_text = $6, "order" = $7, effect = $8, updated_at = NOW()
             WHERE id = $9 RETURNING *`,
            [title, subtitle, image_url, link_type, link_target, button_text, order, effect, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Slide not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a carousel slide
// @route   DELETE /api/carousel/:id
// @access  Admin
router.delete('/:id', protect, checkRole('ADMIN'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "CarouselSlide" WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
