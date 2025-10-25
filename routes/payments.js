const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sql = `
      SELECT p.*, c.name as contactName
      FROM payments p
      LEFT JOIN contacts c ON p.contactId = c.id
      ORDER BY p.date DESC
    `;
    
    db.all(sql, [], (err, rows) => {
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

// @route   POST /api/payments
// @desc    Create payment
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { type, contactId, amount, paymentMethod, referenceNo, date, notes } = req.body;
    
    const sql = `INSERT INTO payments (type, contactId, amount, paymentMethod, referenceNo, date, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [type, contactId, amount, paymentMethod, referenceNo || '', date, notes || ''], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      db.get('SELECT * FROM payments WHERE id = ?', [this.lastID], (err, row) => {
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

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM payments WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
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
