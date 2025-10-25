const db = require('./database');

console.log('\n========================================');
console.log('TESTING API LOGIC - CONTACT FILTERING');
console.log('========================================\n');

// Wait for database to be ready
setTimeout(() => {
  // Test 1: Get all contacts
  console.log('TEST 1: Simulate GET /api/contacts (no filter)');
  db.all('SELECT * FROM contacts ORDER BY createdAt DESC', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(`✅ Found ${rows.length} contacts:`);
    rows.forEach(c => {
      console.log(`   - ${c.name}: type="${c.type}", isCustomer=${c.isCustomer}, isSupplier=${c.isSupplier}`);
    });
  }
  
  // Test 2: Get customers
  console.log('\nTEST 2: Simulate GET /api/contacts?type=customer');
  db.all('SELECT * FROM contacts WHERE isCustomer = 1 ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log(`✅ Found ${rows.length} customers:`);
      rows.forEach(c => {
        console.log(`   - ${c.name}: type="${c.type}", isCustomer=${c.isCustomer}, isSupplier=${c.isSupplier}`);
      });
    }
    
    // Test 3: Get suppliers
    console.log('\nTEST 3: Simulate GET /api/contacts?type=supplier');
    db.all('SELECT * FROM contacts WHERE isSupplier = 1 ORDER BY createdAt DESC', [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log(`✅ Found ${rows.length} suppliers:`);
        rows.forEach(c => {
          console.log(`   - ${c.name}: type="${c.type}", isCustomer=${c.isCustomer}, isSupplier=${c.isSupplier}`);
        });
      }
      
      console.log('\n========================================');
      console.log('API SIMULATION COMPLETE');
      console.log('========================================\n');
      
      console.log('EXPECTED IN SALES DROPDOWN:');
      db.all('SELECT * FROM contacts WHERE isCustomer = 1', [], (err, rows) => {
        rows.forEach(c => console.log(`  - ${c.name}`));
        
        console.log('\nEXPECTED IN PURCHASE DROPDOWN:');
        db.all('SELECT * FROM contacts WHERE isSupplier = 1', [], (err, rows) => {
          rows.forEach(c => console.log(`  - ${c.name}`));
          setTimeout(() => process.exit(0), 100);
        });
      });
    });
  });
  });
}, 1000); // Wait 1 second for database initialization

