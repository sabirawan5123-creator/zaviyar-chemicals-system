const express = require('express');
const router = express.Router();
const db = require('../database');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    db.all('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC', [], (err, rows) => {
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

// @route   POST /api/users
// @desc    Create user
// @access  Private (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (row) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const sql = `INSERT INTO users (name, email, password, role) 
                   VALUES (?, ?, ?, ?)`;
      
      db.run(sql, [name, email, hashedPassword, role], function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        db.get('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [this.lastID], (err, row) => {
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (password) {
      // Update with new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const sql = `UPDATE users 
                   SET name = ?, email = ?, password = ?, role = ?
                   WHERE id = ?`;
      
      db.run(sql, [name, email, hashedPassword, role, req.params.id], function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        db.get('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [req.params.id], (err, row) => {
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
      // Update without changing password
      const sql = `UPDATE users 
                   SET name = ?, email = ?, role = ?
                   WHERE id = ?`;
      
      db.run(sql, [name, email, role, req.params.id], function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        db.get('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [req.params.id], (err, row) => {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
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
