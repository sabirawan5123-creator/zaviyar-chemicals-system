// Migration script to add isCustomer and isSupplier columns to existing contacts

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'accounting.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Starting migration...');

db.serialize(() => {
  // Check if columns already exist
  db.all("PRAGMA table_info(contacts)", [], (err, columns) => {
    if (err) {
      console.error('❌ Error checking table:', err);
      return;
    }

    const hasIsCustomer = columns.some(col => col.name === 'isCustomer');
    const hasIsSupplier = columns.some(col => col.name === 'isSupplier');

    if (!hasIsCustomer) {
      console.log('➕ Adding isCustomer column...');
      db.run('ALTER TABLE contacts ADD COLUMN isCustomer INTEGER DEFAULT 0', (err) => {
        if (err) {
          console.error('❌ Error adding isCustomer:', err);
        } else {
          console.log('✅ Added isCustomer column');
          
          // Update existing records based on type
          db.run(`UPDATE contacts SET isCustomer = 1 WHERE type = 'customer' OR type = 'both'`, (err) => {
            if (err) {
              console.error('❌ Error updating isCustomer:', err);
            } else {
              console.log('✅ Updated existing customer records');
            }
          });
        }
      });
    } else {
      console.log('✅ isCustomer column already exists');
    }

    if (!hasIsSupplier) {
      console.log('➕ Adding isSupplier column...');
      db.run('ALTER TABLE contacts ADD COLUMN isSupplier INTEGER DEFAULT 0', (err) => {
        if (err) {
          console.error('❌ Error adding isSupplier:', err);
        } else {
          console.log('✅ Added isSupplier column');
          
          // Update existing records based on type
          db.run(`UPDATE contacts SET isSupplier = 1 WHERE type = 'supplier' OR type = 'both'`, (err) => {
            if (err) {
              console.error('❌ Error updating isSupplier:', err);
            } else {
              console.log('✅ Updated existing supplier records');
            }
          });
        }
      });
    } else {
      console.log('✅ isSupplier column already exists');
    }

    // Wait a bit for all operations to complete
    setTimeout(() => {
      console.log('\n✅ Migration complete!');
      console.log('🚀 Restart your server now\n');
      db.close();
      process.exit(0);
    }, 1000);
  });
});

