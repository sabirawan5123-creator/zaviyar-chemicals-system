const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect } = require('../middleware/auth-simple');

// @route   GET /api/reports
// @desc    Get comprehensive reports
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get sales total
    db.get('SELECT COALESCE(SUM(total), 0) as totalSales FROM sales', [], (err, salesRow) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      // Get purchases total
      db.get('SELECT COALESCE(SUM(total), 0) as totalPurchases FROM purchases', [], (err, purchasesRow) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        // Get expenses total
        db.get('SELECT COALESCE(SUM(amount), 0) as totalExpenses FROM expenses', [], (err, expensesRow) => {
          if (err) {
            return res.status(500).json({ success: false, message: err.message });
          }

          const totalSales = salesRow.totalSales || 0;
          const totalPurchases = purchasesRow.totalPurchases || 0;
          const totalExpenses = expensesRow.totalExpenses || 0;
          const grossProfit = totalSales - totalPurchases;
          const netProfit = grossProfit - totalExpenses;

          // Get expense categories
          db.all('SELECT category as name, SUM(amount) as value FROM expenses GROUP BY category', [], (err, categoryRows) => {
            if (err) {
              return res.status(500).json({ success: false, message: err.message });
            }

            res.json({
              success: true,
              data: {
                sales: [],
                purchases: [],
                expenses: [],
                profitLoss: {
                  totalSales,
                  totalPurchases,
                  totalExpenses,
                  grossProfit,
                  netProfit
                },
                topProducts: [],
                cashFlow: [],
                categoryExpenses: categoryRows || []
              }
            });
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

module.exports = router;
