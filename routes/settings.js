const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/settings
// @desc    Get settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    db.get('SELECT * FROM settings WHERE id = 1', [], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        data: row || {}
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/settings
// @desc    Update settings
// @access  Private (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { businessName, businessAddress, businessPhone, businessEmail, currency, taxRate, dateFormat, fiscalYearStart } = req.body;
    
    // Check if settings exist
    db.get('SELECT id FROM settings WHERE id = 1', [], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (row) {
        // Update existing settings
        const sql = `UPDATE settings 
                     SET businessName = ?, businessAddress = ?, businessPhone = ?, businessEmail = ?,
                         currency = ?, taxRate = ?, dateFormat = ?, fiscalYearStart = ?
                     WHERE id = 1`;
        
        db.run(sql, [businessName, businessAddress || '', businessPhone || '', businessEmail || '', 
                     currency, taxRate || 0, dateFormat, fiscalYearStart], function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message
            });
          }

          db.get('SELECT * FROM settings WHERE id = 1', [], (err, row) => {
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
      } else {
        // Insert new settings
        const sql = `INSERT INTO settings (id, businessName, businessAddress, businessPhone, businessEmail, 
                                          currency, taxRate, dateFormat, fiscalYearStart) 
                     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [businessName, businessAddress || '', businessPhone || '', businessEmail || '', 
                     currency, taxRate || 0, dateFormat, fiscalYearStart], function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message
            });
          }

          db.get('SELECT * FROM settings WHERE id = 1', [], (err, row) => {
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
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
