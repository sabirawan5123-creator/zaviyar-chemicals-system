// Test script to verify contact queries work correctly
const db = require('./database');

console.log('\n========================================');
console.log('TESTING CONTACT QUERIES');
console.log('========================================\n');

// Test 1: Get all contacts
console.log('TEST 1: Get ALL contacts');
db.all('SELECT id, name, type, isCustomer, isSupplier FROM contacts', [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log(`✅ Found ${rows.length} contacts:`);
        rows.forEach(r => {
            console.log(`   - ${r.name}: type="${r.type}", isCustomer=${r.isCustomer}, isSupplier=${r.isSupplier}`);
        });
    }
    
    // Test 2: Get customers only
    console.log('\nTEST 2: Get CUSTOMERS (isCustomer = 1)');
    db.all('SELECT id, name, type, isCustomer, isSupplier FROM contacts WHERE isCustomer = 1', [], (err, rows) => {
        if (err) {
            console.error('❌ Error:', err.message);
        } else {
            console.log(`✅ Found ${rows.length} customers:`);
            rows.forEach(r => {
                console.log(`   - ${r.name}: type="${r.type}", isCustomer=${r.isCustomer}, isSupplier=${r.isSupplier}`);
            });
        }
        
        // Test 3: Get suppliers only
        console.log('\nTEST 3: Get SUPPLIERS (isSupplier = 1)');
        db.all('SELECT id, name, type, isCustomer, isSupplier FROM contacts WHERE isSupplier = 1', [], (err, rows) => {
            if (err) {
                console.error('❌ Error:', err.message);
            } else {
                console.log(`✅ Found ${rows.length} suppliers:`);
                rows.forEach(r => {
                    console.log(`   - ${r.name}: type="${r.type}", isCustomer=${r.isCustomer}, isSupplier=${r.isSupplier}`);
                });
            }
            
            // Test 4: Get both
            console.log('\nTEST 4: Get BOTH (isCustomer = 1 AND isSupplier = 1)');
            db.all('SELECT id, name, type, isCustomer, isSupplier FROM contacts WHERE isCustomer = 1 AND isSupplier = 1', [], (err, rows) => {
                if (err) {
                    console.error('❌ Error:', err.message);
                } else {
                    console.log(`✅ Found ${rows.length} contacts that are BOTH:`);
                    rows.forEach(r => {
                        console.log(`   - ${r.name}: type="${r.type}", isCustomer=${r.isCustomer}, isSupplier=${r.isSupplier}`);
                    });
                }
                
                console.log('\n========================================');
                console.log('TESTS COMPLETE');
                console.log('========================================\n');
                process.exit(0);
            });
        });
    });
});

