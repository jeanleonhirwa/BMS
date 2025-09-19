const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// @route   GET /api/goals
// @desc    Get all savings goals
// @access  Public
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, name, target_amount, current_amount FROM savings_goals ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching savings goals:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   POST /api/goals
// @desc    Create a new savings goal
// @access  Public
router.post('/', async (req, res) => {
  const { name, target_amount } = req.body;

  if (!name || !target_amount) {
    return res.status(400).json({ msg: 'Please enter goal name and target amount' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO savings_goals (name, target_amount, current_amount) VALUES (?, ?, 0)',
      [name, target_amount]
    );
    res.status(201).json({
      msg: 'Savings goal created successfully',
      goalId: result.insertId,
      goal: { id: result.insertId, name, target_amount, current_amount: 0 }
    });
  } catch (error) {
    console.error('Error creating savings goal:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a savings goal (e.g., current_amount)
// @access  Public
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { current_amount } = req.body;

  if (!current_amount && current_amount !== 0) {
    return res.status(400).json({ msg: 'Please provide current_amount to update' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'UPDATE savings_goals SET current_amount = ? WHERE id = ?',
      [current_amount, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Savings goal not found' });
    }

    res.json({ msg: 'Savings goal updated successfully' });
  } catch (error) {
    console.error('Error updating savings goal:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
