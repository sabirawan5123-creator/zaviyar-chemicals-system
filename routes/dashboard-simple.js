const express = require('express');
const router = express.Router();
const db = require('../database');
const { protect } = require('../middleware/auth-simple');

// @route   GET /api/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // Get all data with promises
    const [salesData, purchaseData, expenseData, bankData, lowStockProducts] = await Promise.all([
      // Total Sales
      new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COALESCE(SUM(total), 0) as totalSales,
            COALESCE(SUM(CASE WHEN date(createdAt) >= ? THEN total ELSE 0 END), 0) as todaySales,
            COALESCE(SUM(CASE WHEN date(createdAt) >= ? THEN total ELSE 0 END), 0) as monthSales
          FROM sales
        `, [todayStr, startOfMonthStr], (err, row) => {
          if (err) reject(err);
          else resolve(row || { totalSales: 0, todaySales: 0, monthSales: 0 });
        });
      }),

      // Total Purchases
      new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COALESCE(SUM(total), 0) as totalPurchases,
            COALESCE(SUM(CASE WHEN date(createdAt) >= ? THEN total ELSE 0 END), 0) as todayPurchases,
            COALESCE(SUM(CASE WHEN date(createdAt) >= ? THEN total ELSE 0 END), 0) as monthPurchases
          FROM purchases
        `, [todayStr, startOfMonthStr], (err, row) => {
          if (err) reject(err);
          else resolve(row || { totalPurchases: 0, todayPurchases: 0, monthPurchases: 0 });
        });
      }),

      // Total Expenses
      new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COALESCE(SUM(amount), 0) as totalExpenses,
            COALESCE(SUM(CASE WHEN date(createdAt) >= ? THEN amount ELSE 0 END), 0) as todayExpenses,
            COALESCE(SUM(CASE WHEN date(createdAt) >= ? THEN amount ELSE 0 END), 0) as monthExpenses
          FROM expenses
        `, [todayStr, startOfMonthStr], (err, row) => {
          if (err) reject(err);
          else resolve(row || { totalExpenses: 0, todayExpenses: 0, monthExpenses: 0 });
        });
      }),

      // Bank Balances
      new Promise((resolve, reject) => {
        db.get(`
          SELECT COALESCE(SUM(balance), 0) as totalBankBalance
          FROM bankAccounts
          WHERE accountType = 'bank'
        `, [], (err, row) => {
          if (err) reject(err);
          else resolve(row || { totalBankBalance: 0 });
        });
      }),

      // Low Stock Products
      new Promise((resolve, reject) => {
        db.all(`
          SELECT id, name, sku, stock
          FROM products
          WHERE stock < 10
          ORDER BY stock ASC
          LIMIT 10
        `, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      })
    ]);

    // Calculate cash in hand
    const cashBalance = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COALESCE(SUM(balance), 0) as cashInHand
        FROM bankAccounts
        WHERE accountType = 'cash'
      `, [], (err, row) => {
        if (err) reject(err);
        else resolve((row && row.cashInHand) || 0);
      });
    });

    const sales = {
      totalSales: salesData.totalSales || 0,
      todaySales: salesData.todaySales || 0,
      monthSales: salesData.monthSales || 0,
      receivable: 0
    };

    const purchases = {
      totalPurchases: purchaseData.totalPurchases || 0,
      todayPurchases: purchaseData.todayPurchases || 0,
      monthPurchases: purchaseData.monthPurchases || 0,
      payable: 0
    };

    const expenses = {
      totalExpenses: expenseData.totalExpenses || 0,
      todayExpenses: expenseData.todayExpenses || 0,
      monthExpenses: expenseData.monthExpenses || 0
    };

    // Calculate Profit
    const profit = {
      total: sales.totalSales - purchases.totalPurchases - expenses.totalExpenses,
      month: sales.monthSales - purchases.monthPurchases - expenses.monthExpenses,
      today: sales.todaySales - purchases.todayPurchases - expenses.todayExpenses
    };

    res.json({
      success: true,
      data: {
        sales: {
          today: sales.todaySales,
          month: sales.monthSales,
          allTime: sales.totalSales,
          receivable: sales.receivable
        },
        purchases: {
          today: purchases.todayPurchases,
          month: purchases.monthPurchases,
          allTime: purchases.totalPurchases,
          payable: purchases.payable
        },
        expenses: {
          today: expenses.todayExpenses,
          month: expenses.monthExpenses,
          allTime: expenses.totalExpenses
        },
        profit: {
          today: profit.today,
          month: profit.month,
          allTime: profit.total
        },
        cash: {
          inHand: cashBalance,
          inBank: bankData.totalBankBalance || 0,
          total: cashBalance + (bankData.totalBankBalance || 0)
        },
        lowStockProducts: lowStockProducts || []
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
