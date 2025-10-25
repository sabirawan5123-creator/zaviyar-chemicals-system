// Script to fix contacts where type doesn't match isCustomer/isSupplier flags
const db = require('./database');

console.log('\n========================================');
console.log('FIXING CONTACT FLAGS IN DATABASE');
console.log('========================================\n');

// Step 1: Show current state
console.log('STEP 1: Current state of all contacts\n');
db.all('SELECT id, name, type, isCustomer, isSupplier FROM contacts', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        process.exit(1);
    }
    
    console.log(`Found ${rows.length} contacts:\n`);
    rows.forEach(r => {
        const status = (r.isCustomer === 1 && r.isSupplier === 1) ? '✅ BOTH' :
                      (r.isCustomer === 1) ? '✅ CUSTOMER' :
                      (r.isSupplier === 1) ? '✅ SUPPLIER' :
                      '❌ NO FLAGS SET';
        console.log(`  ${r.id}. ${r.name}: type="${r.type}", isCustomer=${r.isCustomer}, isSupplier=${r.isSupplier} - ${status}`);
    });
    
    // Step 2: Fix contacts where type doesn't match flags
    console.log('\n\nSTEP 2: Fixing contacts where flags dont match type\n');
    
    const fixPromises = rows.map(contact => {
        return new Promise((resolve) => {
            let shouldBeCustomer = 0;
            let shouldBeSupplier = 0;
            let needsUpdate = false;
            
            // Determine what the flags SHOULD be based on type
            if (contact.type === 'customer') {
                shouldBeCustomer = 1;
                shouldBeSupplier = 0;
            } else if (contact.type === 'supplier') {
                shouldBeCustomer = 0;
                shouldBeSupplier = 1;
            } else if (contact.type === 'both') {
                shouldBeCustomer = 1;
                shouldBeSupplier = 1;
            }
            
            // Check if update is needed
            if (contact.isCustomer !== shouldBeCustomer || contact.isSupplier !== shouldBeSupplier) {
                needsUpdate = true;
                console.log(`  ⚠️  Fixing: ${contact.name}`);
                console.log(`     Old: type="${contact.type}", isCustomer=${contact.isCustomer}, isSupplier=${contact.isSupplier}`);
                console.log(`     New: type="${contact.type}", isCustomer=${shouldBeCustomer}, isSupplier=${shouldBeSupplier}`);
                
                db.run(
                    'UPDATE contacts SET isCustomer = ?, isSupplier = ? WHERE id = ?',
                    [shouldBeCustomer, shouldBeSupplier, contact.id],
                    (err) => {
                        if (err) {
                            console.log(`     ❌ Error: ${err.message}`);
                        } else {
                            console.log(`     ✅ Fixed!`);
                        }
                        resolve();
                    }
                );
            } else {
                console.log(`  ✅ OK: ${contact.name} - flags already correct`);
                resolve();
            }
        });
    });
    
    Promise.all(fixPromises).then(() => {
        // Step 3: Verify the fix
        console.log('\n\nSTEP 3: Verifying all contacts after fix\n');
        
        db.all('SELECT id, name, type, isCustomer, isSupplier FROM contacts', [], (err, rows) => {
            if (err) {
                console.error('Error:', err);
                process.exit(1);
            }
            
            console.log(`Total contacts: ${rows.length}\n`);
            
            let allCorrect = true;
            rows.forEach(r => {
                const status = (r.isCustomer === 1 && r.isSupplier === 1) ? '✅ BOTH' :
                              (r.isCustomer === 1) ? '✅ CUSTOMER' :
                              (r.isSupplier === 1) ? '✅ SUPPLIER' :
                              '❌ NO FLAGS';
                
                // Check if type matches flags
                let correct = false;
                if (r.type === 'customer' && r.isCustomer === 1 && r.isSupplier === 0) correct = true;
                if (r.type === 'supplier' && r.isCustomer === 0 && r.isSupplier === 1) correct = true;
                if (r.type === 'both' && r.isCustomer === 1 && r.isSupplier === 1) correct = true;
                
                if (!correct) allCorrect = false;
                
                const indicator = correct ? '✅' : '❌';
                console.log(`  ${indicator} ${r.id}. ${r.name}: type="${r.type}", isCustomer=${r.isCustomer}, isSupplier=${r.isSupplier} - ${status}`);
            });
            
            console.log('\n========================================');
            if (allCorrect) {
                console.log('✅ ALL CONTACTS FIXED SUCCESSFULLY!');
            } else {
                console.log('❌ SOME CONTACTS STILL HAVE ISSUES');
            }
            console.log('========================================\n');
            
            // Final summary
            const customers = rows.filter(r => r.isCustomer === 1).length;
            const suppliers = rows.filter(r => r.isSupplier === 1).length;
            const both = rows.filter(r => r.isCustomer === 1 && r.isSupplier === 1).length;
            
            console.log('SUMMARY:');
            console.log(`  Total Contacts: ${rows.length}`);
            console.log(`  Customers (isCustomer=1): ${customers}`);
            console.log(`  Suppliers (isSupplier=1): ${suppliers}`);
            console.log(`  Both (both flags=1): ${both}`);
            console.log('\n');
            
            process.exit(0);
        });
    });
});

