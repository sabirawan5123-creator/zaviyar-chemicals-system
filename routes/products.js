const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    db.all('SELECT * FROM products ORDER BY createdAt DESC', [], (err, rows) => {
      if (err) {
        console.error('Products fetch error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      res.json({
        success: true,
        count: (rows || []).length,
        data: rows || []
      });
    });
  } catch (error) {
    console.error('Products route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Product fetch error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: row
      });
    });
  } catch (error) {
    console.error('Product route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { name, sku, category, price, cost, stock, minStock, description } = req.body;
    
    const sql = `INSERT INTO products (name, sku, category, price, cost, stock, minStock, description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      name || '',
      sku || '',
      category || '',
      price || 0,
      cost || 0,
      stock || 0,
      minStock || 0,
      description || ''
    ], function(err) {
      if (err) {
        console.error('Product creation error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Product fetch after creation error:', err);
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
    console.error('Product creation route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (admin, accountant)
router.put('/:id', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { name, sku, category, price, cost, stock, minStock, description } = req.body;
    
    const sql = `UPDATE products 
                 SET name = ?, sku = ?, category = ?, price = ?, cost = ?, 
                     stock = ?, minStock = ?, description = ?
                 WHERE id = ?`;
    
    db.run(sql, [
      name || '',
      sku || '',
      category || '',
      price || 0,
      cost || 0,
      stock || 0,
      minStock || 0,
      description || '',
      req.params.id
    ], function(err) {
      if (err) {
        console.error('Product update error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          console.error('Product fetch after update error:', err);
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
    console.error('Product update route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Product deletion error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: {}
      });
    });
  } catch (error) {
    console.error('Product deletion route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
