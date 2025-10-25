const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/purchases
// @desc    Get all purchases
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const sql = `
      SELECT p.*, c.name as supplierName
      FROM purchases p
      LEFT JOIN contacts c ON p.supplierId = c.id
      ORDER BY p.createdAt DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      const purchases = rows.map(row => ({
        ...row,
        items: JSON.parse(row.items || '[]')
      }));

      res.json({
        success: true,
        count: purchases.length,
        data: purchases
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/purchases/:id
// @desc    Get single purchase by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sql = `
      SELECT p.*, c.name as supplierName, c.phone as supplierPhone, c.address as supplierAddress
      FROM purchases p
      LEFT JOIN contacts c ON p.supplierId = c.id
      WHERE p.id = ?
    `;
    
    db.get(sql, [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      try {
        row.items = row.items ? JSON.parse(row.items) : [];
      } catch (e) {
        row.items = [];
      }

      res.json({
        success: true,
        data: row
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/purchases
// @desc    Create purchase
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { supplierId, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, notes } = req.body;
    
    const purchaseNo = 'PUR-' + Date.now();
    
    const sql = `INSERT INTO purchases (purchaseNo, supplierId, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      purchaseNo,
      supplierId,
      JSON.stringify(items),
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      paymentStatus,
      notes || ''
    ], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      // Update product stock
      const itemsArray = typeof items === 'string' ? JSON.parse(items) : items;
      if (Array.isArray(itemsArray)) {
        itemsArray.forEach(item => {
          db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.qty || item.quantity, item.productId]);
        });
      }

      db.get('SELECT * FROM purchases WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        res.status(201).json({
          success: true,
          data: {
            ...row,
            items: JSON.parse(row.items || '[]')
          }
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

// @route   DELETE /api/purchases/:id
// @desc    Delete purchase
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM purchases WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
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
