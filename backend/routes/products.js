const express = require('express');
const { pool } = require('../db/pool');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products, with optional category filtering
// @route   GET /api/products?category=...
// @access  Public
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let query = 'SELECT p.*, c.name as category_name FROM "Product" p JOIN "Category" c ON p.category_id = c.id';
    const params = [];
    if (category) {
      query += ' WHERE c.slug = $1';
      params.push(category);
    }
    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single product by slug
// @route   GET /api/products/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT p.*, c.name as category_name FROM "Product" p JOIN "Category" c ON p.category_id = c.id WHERE p.slug = $1', [req.params.slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
router.post('/', protect, checkRole('ADMIN'), async (req, res) => {
  const { sku, name, slug, description_html, price_cents, category_id, main_image_url, images, metadata } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO "Product" (sku, name, slug, description_html, price_cents, category_id, main_image_url, images, metadata, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *`,
      [sku, name, slug, description_html, price_cents, category_id, main_image_url, images, metadata]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
router.put('/:id', protect, checkRole('ADMIN'), async (req, res) => {
    const { id } = req.params;
    const { sku, name, slug, description_html, price_cents, category_id, main_image_url, images, metadata } = req.body;
    try {
        const result = await pool.query(
            `UPDATE "Product" SET sku = $1, name = $2, slug = $3, description_html = $4, price_cents = $5, category_id = $6, main_image_url = $7, images = $8, metadata = $9, updated_at = NOW()
             WHERE id = $10 RETURNING *`,
            [sku, name, slug, description_html, price_cents, category_id, main_image_url, images, metadata, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
router.delete('/:id', protect, checkRole('ADMIN'), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM "Product" WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


module.exports = router;
