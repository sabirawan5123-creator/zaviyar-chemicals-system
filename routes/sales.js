const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/sales
// @desc    Get all sales
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sql = `
      SELECT s.*, c.name as customerName
      FROM sales s
      LEFT JOIN contacts c ON s.customerId = c.id
      ORDER BY s.createdAt DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Sales fetch error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      // Parse items JSON for each sale, handle null/empty
      const sales = (rows || []).map(row => {
        try {
          return {
            ...row,
            items: row.items ? JSON.parse(row.items) : []
          };
        } catch (e) {
          console.error('Error parsing items:', e);
          return {
            ...row,
            items: []
          };
        }
      });

      res.json({
        success: true,
        count: sales.length,
        data: sales
      });
    });
  } catch (error) {
    console.error('Sales route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sql = `
      SELECT s.*, c.name as customerName, c.phone as customerPhone, c.address as customerAddress
      FROM sales s
      LEFT JOIN contacts c ON s.customerId = c.id
      WHERE s.id = ?
    `;
    
    db.get(sql, [req.params.id], (err, row) => {
      if (err) {
        console.error('Sale fetch error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      // Parse items JSON
      try {
        row.items = row.items ? JSON.parse(row.items) : [];
      } catch (e) {
        console.error('Error parsing items:', e);
        row.items = [];
      }

      res.json({
        success: true,
        data: row
      });
    });
  } catch (error) {
    console.error('Sale route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/sales
// @desc    Create sale
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { customerId, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, notes } = req.body;
    
    // Generate invoice number
    const invoiceNo = 'INV-' + Date.now();
    
    const sql = `INSERT INTO sales (invoiceNo, customerId, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      invoiceNo,
      customerId,
      JSON.stringify(items || []),
      subtotal || 0,
      tax || 0,
      discount || 0,
      total || 0,
      paymentMethod || 'cash',
      paymentStatus || 'pending',
      notes || ''
    ], function(err) {
      if (err) {
        console.error('Sale creation error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      // Update product stock
      if (items && Array.isArray(items)) {
        items.forEach(item => {
          if (item.productId && item.quantity) {
            db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.productId], (err) => {
              if (err) console.error('Stock update error:', err);
            });
          }
        });
      }

      db.get('SELECT * FROM sales WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Sale fetch after creation error:', err);
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        try {
          res.status(201).json({
            success: true,
            data: {
              ...row,
              items: row.items ? JSON.parse(row.items) : []
            }
          });
        } catch (e) {
          console.error('Error parsing created sale:', e);
          res.status(201).json({
            success: true,
            data: row
          });
        }
      });
    });
  } catch (error) {
    console.error('Sale creation route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM sales WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Sale deletion error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }

      res.json({
        success: true,
        data: {}
      });
    });
  } catch (error) {
    console.error('Sale deletion route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
