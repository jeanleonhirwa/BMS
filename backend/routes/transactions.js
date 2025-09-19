const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Public
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT t.id, t.amount, t.description, t.type, t.transaction_date, c.name AS category_name FROM transactions t JOIN categories c ON t.category_id = c.id ORDER BY t.transaction_date DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching transactions from database:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
// @access  Public
router.post('/', async (req, res) => {
  const { amount, description, type, category } = req.body;

  // Basic validation
  if (!amount || !description || !type || !category) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Find or create category
    let [categories] = await connection.execute(
      'SELECT id FROM categories WHERE name = ?',
      [category]
    );

    let categoryId;
    if (categories.length === 0) {
      // Category does not exist, insert it
      const [result] = await connection.execute(
        'INSERT INTO categories (name) VALUES (?)',
        [category]
      );
      categoryId = result.insertId;
    } else {
      categoryId = categories[0].id;
    }

    // Insert transaction
    const [result] = await connection.execute(
      'INSERT INTO transactions (amount, description, type, category_id) VALUES (?, ?, ?, ?)',
      [amount, description, type, categoryId]
    );

    res.status(201).json({
      msg: 'Transaction added successfully',
      transactionId: result.insertId,
      transaction: { amount, description, type, category, categoryId }
    });

  } catch (error) {
    console.error('Error adding transaction to database:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Public
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, description, type, category } = req.body;

  if (!amount || !description || !type || !category) {
    return res.status(400).json({ msg: 'Please provide all fields for update' });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Find or create category
    let [categories] = await connection.execute(
      'SELECT id FROM categories WHERE name = ?',
      [category]
    );

    let categoryId;
    if (categories.length === 0) {
      const [result] = await connection.execute(
        'INSERT INTO categories (name) VALUES (?)',
        [category]
      );
      categoryId = result.insertId;
    } else {
      categoryId = categories[0].id;
    }

    const [result] = await connection.execute(
      'UPDATE transactions SET amount = ?, description = ?, type = ?, category_id = ? WHERE id = ?',
      [amount, description, type, categoryId, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json({ msg: 'Transaction updated successfully' });

  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Public
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'DELETE FROM transactions WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json({ msg: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Error deleting transaction:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
