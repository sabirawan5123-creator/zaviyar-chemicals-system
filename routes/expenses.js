const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        count: rows.length,
        data: rows
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/expenses
// @desc    Create expense
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { category, amount, date, paymentMethod, description } = req.body;
    
    const sql = `INSERT INTO expenses (category, amount, date, paymentMethod, description) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [category, amount, date, paymentMethod, description || ''], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      db.get('SELECT * FROM expenses WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        res.status(201).json({
          success: true,
          data: row
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private (admin, accountant)
router.put('/:id', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { category, amount, date, paymentMethod, description } = req.body;
    
    const sql = `UPDATE expenses 
                 SET category = ?, amount = ?, date = ?, paymentMethod = ?, description = ?
                 WHERE id = ?`;
    
    db.run(sql, [category, amount, date, paymentMethod, description || '', req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        res.json({
          success: true,
          data: row
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM expenses WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: {}
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
