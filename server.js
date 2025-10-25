const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database adapter (SQLite for dev, PostgreSQL for production)
const db = require('./db-adapter');

// Import routes
const authRoutes = require('./routes/auth-simple');
const dashboardRoutes = require('./routes/dashboard-simple');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchases');
const expenseRoutes = require('./routes/expenses');
const paymentRoutes = require('./routes/payments');
const contactRoutes = require('./routes/contacts');
const bankAccountRoutes = require('./routes/bankAccounts');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Performance middleware
const { responseTime, cacheMiddleware, clearCache } = require('./middleware/performance');
const compressionMiddleware = require('./middleware/compression');

// Middleware
app.use(compressionMiddleware); // Compress responses for faster transfer
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(responseTime);
app.use(cacheMiddleware);
app.use(clearCache);

// Database is ready (SQLite file-based, no server needed!)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);

// Serve static files from public folder
app.use(express.static('public'));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server (only for local development, not Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`📦 All endpoints available!`);
  });
}

// Export for Vercel serverless
module.exports = app;

