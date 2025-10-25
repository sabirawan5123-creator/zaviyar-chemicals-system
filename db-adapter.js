// Database Adapter - Works with both SQLite (development) and PostgreSQL (production/Vercel)

const usePostgres = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let db;

if (usePostgres) {
  // Use PostgreSQL for production (Vercel)
  console.log('🐘 Using PostgreSQL database');
  const { pool, initializeDatabase } = require('./database-pg');
  
  // Initialize database on startup
  initializeDatabase().catch(err => {
    console.error('Failed to initialize PostgreSQL:', err);
  });
  
  // Adapter to make PostgreSQL work like SQLite callbacks
  db = {
    // For SELECT queries that return multiple rows
    all: (sql, params = [], callback) => {
      pool.query(sql, params)
        .then(result => callback(null, result.rows))
        .catch(err => callback(err));
    },
    
    // For SELECT queries that return a single row
    get: (sql, params = [], callback) => {
      pool.query(sql, params)
        .then(result => callback(null, result.rows[0]))
        .catch(err => callback(err));
    },
    
    // For INSERT, UPDATE, DELETE queries
    run: (sql, params = [], callback = () => {}) => {
      pool.query(sql, params)
        .then(result => {
          callback(null, {
            lastID: result.rows[0]?.id,
            changes: result.rowCount
          });
        })
        .catch(err => callback(err));
    }
  };
  
} else {
  // Use SQLite for local development
  console.log('💾 Using SQLite database (local development)');
  db = require('./database');
}

module.exports = db;

