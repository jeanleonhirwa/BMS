const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// @route   GET /api/summary
// @desc    Get summary data for the dashboard
// @access  Public
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calculate total income for the current month
    const [incomeRows] = await connection.execute(
      `SELECT SUM(amount) AS total_income FROM transactions WHERE type = 'income' AND transaction_date BETWEEN ? AND ?`,
      [startOfMonth, endOfMonth]
    );
    const totalIncome = incomeRows[0].total_income || 0;

    // Calculate total expenses for the current month
    const [expenseRows] = await connection.execute(
      `SELECT SUM(amount) AS total_expenses FROM transactions WHERE type = 'expense' AND transaction_date BETWEEN ? AND ?`,
      [startOfMonth, endOfMonth]
    );
    const totalExpenses = expenseRows[0].total_expenses || 0;

    // Calculate overall balance
    const [balanceRows] = await connection.execute(
      `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS current_balance FROM transactions`
    );
    const currentBalance = balanceRows[0].current_balance || 0;

    const summaryData = {
      balance: currentBalance,
      income: totalIncome,
      expenses: totalExpenses,
    };
    res.json(summaryData);

  } catch (error) {
    console.error('Error fetching summary data from database:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

// @route   GET /api/summary/category-spending
// @desc    Get spending data grouped by category for the current month
// @access  Public
router.get('/category-spending', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [rows] = await connection.execute(
      `SELECT c.name AS category_name, SUM(t.amount) AS total_spent
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense' AND t.transaction_date BETWEEN ? AND ?
       GROUP BY c.name
       ORDER BY total_spent DESC`,
      [startOfMonth, endOfMonth]
    );

    res.json(rows);

  } catch (error) {
    console.error('Error fetching category spending data:', error.message);
    res.status(500).json({ msg: 'Server error', error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
