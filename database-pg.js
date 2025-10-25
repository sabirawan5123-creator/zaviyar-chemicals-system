const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing PostgreSQL database...');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        category VARCHAR(100),
        price DECIMAL(10, 2) DEFAULT 0,
        cost DECIMAL(10, 2) DEFAULT 0,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contacts table (customers and suppliers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_customer INTEGER DEFAULT 0,
        is_supplier INTEGER DEFAULT 0,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        balance DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        invoice_no VARCHAR(100) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES contacts(id),
        items TEXT,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        tax DECIMAL(10, 2) DEFAULT 0,
        discount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Purchases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        purchase_no VARCHAR(100) UNIQUE NOT NULL,
        supplier_id INTEGER REFERENCES contacts(id),
        items TEXT,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        tax DECIMAL(10, 2) DEFAULT 0,
        discount DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Expenses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        payment_method VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        contact_id INTEGER REFERENCES contacts(id),
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        reference_no VARCHAR(100),
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bank Accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id SERIAL PRIMARY KEY,
        account_type VARCHAR(50) NOT NULL DEFAULT 'bank',
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(100),
        bank_name VARCHAR(255),
        balance DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255),
        business_address TEXT,
        business_phone VARCHAR(50),
        business_email VARCHAR(255),
        currency VARCHAR(10) DEFAULT 'USD',
        tax_rate DECIMAL(5, 2) DEFAULT 0,
        date_format VARCHAR(50) DEFAULT 'MM/DD/YYYY',
        fiscal_year_start VARCHAR(2) DEFAULT '01',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ PostgreSQL database initialized successfully');
    
    // Create default admin user if not exists
    await createDefaultAdmin(client);
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Create default admin user
async function createDefaultAdmin(client) {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if admin exists
    const result = await client.query('SELECT * FROM users WHERE email = $1', ['admin@zaviyar.com']);
    
    if (result.rows.length === 0) {
      // Create admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin', 'admin@zaviyar.com', hashedPassword, 'admin']
      );
      console.log('✅ Default admin user created');
      console.log('   Email: admin@zaviyar.com');
      console.log('   Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Helper function to convert SQLite-style queries to PostgreSQL
function convertQuery(sqliteQuery) {
  // Replace SQLite AUTOINCREMENT with PostgreSQL SERIAL
  let pgQuery = sqliteQuery.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
  
  // Replace DATETIME with TIMESTAMP
  pgQuery = pgQuery.replace(/DATETIME/g, 'TIMESTAMP');
  
  // Replace REAL with DECIMAL
  pgQuery = pgQuery.replace(/REAL/g, 'DECIMAL(10, 2)');
  
  return pgQuery;
}

// Export pool for queries and initialization function
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initializeDatabase
};

