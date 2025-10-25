const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'accounting.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Database connection established');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT,
      category TEXT,
      price REAL DEFAULT 0,
      cost REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      minStock INTEGER DEFAULT 0,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contacts table (customers and suppliers)
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      isCustomer INTEGER DEFAULT 0,
      isSupplier INTEGER DEFAULT 0,
      email TEXT,
      phone TEXT,
      address TEXT,
      balance REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sales table
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceNo TEXT UNIQUE NOT NULL,
      customerId INTEGER,
      items TEXT,
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paymentMethod TEXT,
      paymentStatus TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES contacts(id)
    )
  `);

  // Purchases table
  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchaseNo TEXT UNIQUE NOT NULL,
      supplierId INTEGER,
      items TEXT,
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      paymentMethod TEXT,
      paymentStatus TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplierId) REFERENCES contacts(id)
    )
  `);

  // Expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATE NOT NULL,
      paymentMethod TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      contactId INTEGER,
      amount REAL NOT NULL,
      paymentMethod TEXT,
      referenceNo TEXT,
      date DATE NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contactId) REFERENCES contacts(id)
    )
  `);

  // Bank Accounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS bankAccounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountType TEXT NOT NULL DEFAULT 'bank',
      accountName TEXT NOT NULL,
      accountNumber TEXT,
      bankName TEXT,
      balance REAL DEFAULT 0,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      businessName TEXT,
      businessAddress TEXT,
      businessPhone TEXT,
      businessEmail TEXT,
      currency TEXT DEFAULT 'USD',
      taxRate REAL DEFAULT 0,
      dateFormat TEXT DEFAULT 'MM/DD/YYYY',
      fiscalYearStart TEXT DEFAULT '01',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
});

// Export the database instance
module.exports = db;
