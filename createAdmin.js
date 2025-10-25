const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'accounting.db');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
  try {
    // Check if admin user exists
    db.get('SELECT * FROM users WHERE email = ?', ['admin@test.com'], async (err, user) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }

      if (user) {
        console.log('✅ Admin user already exists!');
        console.log('Email: admin@test.com');
        console.log('Password: admin123');
        db.close();
        return;
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@test.com', hashedPassword, 'admin'],
        function(err) {
          if (err) {
            console.error('Error creating admin:', err);
          } else {
            console.log('✅ Admin user created successfully!');
            console.log('');
            console.log('📧 Email: admin@test.com');
            console.log('🔑 Password: admin123');
            console.log('');
            console.log('You can now login at http://localhost:5000');
          }
          db.close();
        }
      );
    });
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

createAdmin();

