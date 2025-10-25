const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect, authorize } = require('../middleware/auth-simple');

// @route   GET /api/contacts
// @desc    Get all contacts
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM contacts';
    let params = [];
    
    if (type) {
      // Filter by isCustomer or isSupplier flags
      if (type === 'customer') {
        sql += ' WHERE isCustomer = 1';
        console.log('🔍 Fetching CUSTOMERS (isCustomer = 1)');
      } else if (type === 'supplier') {
        sql += ' WHERE isSupplier = 1';
        console.log('🔍 Fetching SUPPLIERS (isSupplier = 1)');
      } else if (type === 'both') {
        sql += ' WHERE isCustomer = 1 AND isSupplier = 1';
        console.log('🔍 Fetching BOTH (isCustomer = 1 AND isSupplier = 1)');
      } else {
        // Fallback to old type field for compatibility
        sql += ' WHERE type = ?';
        params.push(type);
        console.log('🔍 Fetching by old type field:', type);
      }
    } else {
      console.log('🔍 Fetching ALL contacts');
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    db.all(sql, params, (err, rows) => {
      console.log(`✅ Found ${(rows || []).length} contacts`);
      if (rows && rows.length > 0) {
        console.log('Sample contact:', { 
          id: rows[0].id, 
          name: rows[0].name, 
          type: rows[0].type,
          isCustomer: rows[0].isCustomer, 
          isSupplier: rows[0].isSupplier 
        });
      }
      if (err) {
        console.error('Contacts fetch error:', err);
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
    console.error('Contacts route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/contacts/:id/ledger
// @desc    Get contact ledger (transaction history)
// @access  Private
router.get('/:id/ledger', protect, async (req, res) => {
  try {
    const contactId = req.params.id;
    
    // Get contact details
    db.get('SELECT * FROM contacts WHERE id = ?', [contactId], (err, contact) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
      
      if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }
      
      // Get all transactions
      const transactions = [];
      let completed = 0;
      const totalQueries = 3;
      
      const checkComplete = () => {
        completed++;
        if (completed === totalQueries) {
          // Sort by date
          transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          res.json({
            success: true,
            data: {
              contact,
              transactions
            }
          });
        }
      };
      
      // Get sales (if customer)
      db.all(`SELECT id, invoiceNo as refNo, total as amount, paymentStatus as status, invoiceDate as date, 'Sale' as type 
              FROM sales WHERE customerId = ? ORDER BY invoiceDate DESC`, 
        [contactId], 
        (err, sales) => {
          if (!err && sales) {
            transactions.push(...sales.map(s => ({
              ...s,
              type: 'Sale',
              amount: s.amount,
              date: s.date || s.invoiceDate
            })));
          }
          checkComplete();
        }
      );
      
      // Get purchases (if supplier)
      db.all(`SELECT id, purchaseNo as refNo, total as amount, paymentStatus as status, purchaseDate as date, 'Purchase' as type 
              FROM purchases WHERE supplierId = ? ORDER BY purchaseDate DESC`, 
        [contactId], 
        (err, purchases) => {
          if (!err && purchases) {
            transactions.push(...purchases.map(p => ({
              ...p,
              type: 'Purchase',
              amount: p.amount,
              date: p.date || p.purchaseDate
            })));
          }
          checkComplete();
        }
      );
      
      // Get payments
      db.all(`SELECT id, referenceNo as refNo, amount, type, date 
              FROM payments WHERE contactId = ? ORDER BY date DESC`, 
        [contactId], 
        (err, payments) => {
          if (!err && payments) {
            transactions.push(...payments.map(p => ({
              ...p,
              refNo: p.refNo || `PMT-${p.id}`,
              status: 'completed'
            })));
          }
          checkComplete();
        }
      );
    });
  } catch (error) {
    console.error('Ledger fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    console.log('📋 Fetching contact by ID:', req.params.id);
    
    db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('❌ Contact fetch error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        console.error('❌ Contact not found:', req.params.id);
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      console.log('✅ Contact found:', { id: row.id, name: row.name, type: row.type });
      
      res.json({
        success: true,
        data: row
      });
    });
  } catch (error) {
    console.error('❌ Contact fetch route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/contacts
// @desc    Create contact
// @access  Private (admin, accountant)
router.post('/', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { name, type, isCustomer, isSupplier, email, phone, address, balance } = req.body;
    
    console.log('📥 RAW data received from frontend:', { 
      name, 
      type, 
      isCustomer: `${isCustomer} (${typeof isCustomer})`, 
      isSupplier: `${isSupplier} (${typeof isSupplier})` 
    });
    
    // Convert to boolean first (handle string "true"/"false" and undefined)
    const isCustomerBool = isCustomer === true || isCustomer === 'true' || isCustomer === 1;
    const isSupplierBool = isSupplier === true || isSupplier === 'true' || isSupplier === 1;
    
    // Determine type based on flags
    let finalType = type;
    if (isCustomerBool && isSupplierBool) {
      finalType = 'both';
    } else if (isCustomerBool) {
      finalType = 'customer';
    } else if (isSupplierBool) {
      finalType = 'supplier';
    }
    
    console.log('🆕 Creating contact with converted values:', {
      name,
      type: finalType,
      isCustomer: isCustomerBool ? 1 : 0,
      isSupplier: isSupplierBool ? 1 : 0
    });
    
    const sql = `INSERT INTO contacts (name, type, isCustomer, isSupplier, email, phone, address, balance) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [
      name || '',
      finalType || 'customer',
      isCustomerBool ? 1 : 0,
      isSupplierBool ? 1 : 0,
      email || '',
      phone || '',
      address || '',
      balance || 0
    ], function(err) {
      if (err) {
        console.error('Contact creation error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          console.error('Contact fetch after creation error:', err);
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
    console.error('Contact creation route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact
// @access  Private (admin, accountant)
router.put('/:id', protect, authorize('admin', 'accountant'), async (req, res) => {
  try {
    const { name, type, isCustomer, isSupplier, email, phone, address, balance } = req.body;
    
    console.log('📥 RAW data received for UPDATE:', { 
      id: req.params.id,
      name, 
      type, 
      isCustomer: `${isCustomer} (${typeof isCustomer})`, 
      isSupplier: `${isSupplier} (${typeof isSupplier})` 
    });
    
    // Convert to boolean first (handle string "true"/"false" and undefined)
    const isCustomerBool = isCustomer === true || isCustomer === 'true' || isCustomer === 1;
    const isSupplierBool = isSupplier === true || isSupplier === 'true' || isSupplier === 1;
    
    // Determine type based on flags
    let finalType = type;
    if (isCustomerBool && isSupplierBool) {
      finalType = 'both';
    } else if (isCustomerBool) {
      finalType = 'customer';
    } else if (isSupplierBool) {
      finalType = 'supplier';
    }
    
    console.log('✏️ Updating contact with converted values:', req.params.id, {
      name,
      type: finalType,
      isCustomer: isCustomerBool ? 1 : 0,
      isSupplier: isSupplierBool ? 1 : 0
    });
    
    const sql = `UPDATE contacts 
                 SET name = ?, type = ?, isCustomer = ?, isSupplier = ?, email = ?, phone = ?, address = ?, balance = ?
                 WHERE id = ?`;
    
    db.run(sql, [
      name || '',
      finalType || 'customer',
      isCustomerBool ? 1 : 0,
      isSupplierBool ? 1 : 0,
      email || '',
      phone || '',
      address || '',
      balance || 0,
      req.params.id
    ], function(err) {
      if (err) {
        console.error('Contact update error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
          console.error('Contact fetch after update error:', err);
          return res.status(500).json({
            success: false,
            message: err.message
          });
        }

        console.log('✅ Contact updated successfully:', {
          id: row.id,
          name: row.name,
          type: row.type,
          isCustomer: row.isCustomer,
          isSupplier: row.isSupplier
        });

        res.json({
          success: true,
          data: row
        });
      });
    });
  } catch (error) {
    console.error('Contact update route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact
// @access  Private (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    db.run('DELETE FROM contacts WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Contact deletion error:', err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      res.json({
        success: true,
        data: {}
      });
    });
  } catch (error) {
    console.error('Contact deletion route error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
