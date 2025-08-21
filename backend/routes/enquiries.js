const express = require('express');
const { pool } = require('../db/pool');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// @desc    Create a new enquiry
// @route   POST /api/enquiries
// @access  Public
router.post('/', async (req, res) => {
  const { user_info, items, total_cents } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO "Enquiry" (user_info, items, total_cents, status, updated_at)
       VALUES ($1, $2, $3, 'NEW', NOW()) RETURNING *`,
      [user_info, items, total_cents]
    );
    // TODO: Trigger email notification here
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Admin
router.get('/', protect, checkRole('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Enquiry" ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
