const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/bank-accounts
// @desc    Get all bank accounts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    db.all('SELECT * FROM bankAccounts ORDER BY createdAt DESC', [], (err, rows) => {
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

// @route   POST /api/bank-accounts
// @desc    Create bank account
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, balance } = req.body;
    
    const sql = `INSERT INTO bankAccounts (accountName, accountNumber, bankName, balance) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [accountName, accountNumber, bankName, balance || 0], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      db.get('SELECT * FROM bankAccounts WHERE id = ?', [this.lastID], (err, row) => {
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

// @route   PUT /api/bank-accounts/:id
// @desc    Update bank account
// @access  Private (admin, accountant)
router.put('/:id', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, balance } = req.body;
    
    const sql = `UPDATE bankAccounts 
                 SET accountName = ?, accountNumber = ?, bankName = ?, balance = ?
                 WHERE id = ?`;
    
    db.run(sql, [accountName, accountNumber, bankName, balance || 0, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
        });
      }

      db.get('SELECT * FROM bankAccounts WHERE id = ?', [req.params.id], (err, row) => {
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

// @route   DELETE /api/bank-accounts/:id
// @desc    Delete bank account
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM bankAccounts WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bank account not found'
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
