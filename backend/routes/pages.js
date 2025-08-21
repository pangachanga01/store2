const express = require('express');
const { pool } = require('../db/pool');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, slug, published, created_at, updated_at FROM "Page" WHERE published = true ORDER BY title ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get a single page by slug (admin)
// @route   GET /api/pages/admin/:slug
// @access  Admin
router.get('/admin/:slug', protect, checkRole('ADMIN'), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Page" WHERE slug = $1', [req.params.slug]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get a single page by slug
// @route   GET /api/pages/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Page" WHERE slug = $1 AND published = true', [req.params.slug]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a page
// @route   POST /api/pages
// @access  Admin
router.post('/', protect, checkRole('ADMIN'), async (req, res) => {
    const { title, slug, content_html, published } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO "Page" (title, slug, content_html, published, updated_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
            [title, slug, content_html, published]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all pages (admin)
// @route   GET /api/admin/pages
// @access  Admin
router.get('/admin/all', protect, checkRole('ADMIN'), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Page" ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Update a page
// @route   PUT /api/pages/:id
// @access  Admin
router.put('/:id', protect, checkRole('ADMIN'), async (req, res) => {
    const { id } = req.params;
    const { title, slug, content_html, published } = req.body;
    try {
        const result = await pool.query(
            `UPDATE "Page" SET title = $1, slug = $2, content_html = $3, published = $4, updated_at = NOW()
             WHERE id = $5 RETURNING *`,
            [title, slug, content_html, published, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Admin
router.delete('/:id', protect, checkRole('ADMIN'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "Page" WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
