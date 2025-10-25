// Script to clear all demo data from database (proper order to avoid FK errors)
const db = require('./database');

console.log('\n========================================');
console.log('CLEARING ALL DEMO DATA');
console.log('========================================\n');

console.log('⚠️  WARNING: This will delete ALL data except users!\n');

function clearTable(tableName) {
    return new Promise((resolve) => {
        db.run(`DELETE FROM ${tableName}`, [], function(err) {
            if (err) {
                console.log(`❌ Error clearing ${tableName}:`, err.message);
            } else {
                console.log(`✅ Cleared ${tableName} - Deleted ${this.changes} rows`);
            }
            resolve();
        });
    });
}

async function clearAll() {
    console.log('Clearing tables in proper order to avoid foreign key errors...\n');
    
    // Clear in order: child tables first, then parent tables
    await clearTable('sales');          // References contacts, products
    await clearTable('purchases');      // References contacts, products
    await clearTable('payments');       // References contacts
    await clearTable('expenses');       // Standalone
    await clearTable('bankAccounts');   // Standalone
    await clearTable('contacts');       // Parent table
    await clearTable('products');       // Parent table
    
    console.log('\n========================================');
    console.log('✅ ALL DEMO DATA CLEARED!');
    console.log('========================================\n');
    
    // Verify deletion
    const counts = {};
    
    const checkTable = (table) => {
        return new Promise((resolve) => {
            db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
                if (!err && row) {
                    counts[table] = row.count;
                }
                resolve();
            });
        });
    };
    
    await checkTable('sales');
    await checkTable('purchases');
    await checkTable('expenses');
    await checkTable('products');
    await checkTable('contacts');
    await checkTable('payments');
    await checkTable('bankAccounts');
    
    console.log('VERIFICATION:');
    console.log(`  Sales: ${counts.sales || 0}`);
    console.log(`  Purchases: ${counts.purchases || 0}`);
    console.log(`  Expenses: ${counts.expenses || 0}`);
    console.log(`  Products: ${counts.products || 0}`);
    console.log(`  Contacts: ${counts.contacts || 0}`);
    console.log(`  Payments: ${counts.payments || 0}`);
    console.log(`  Bank Accounts: ${counts.bankAccounts || 0}`);
    
    console.log('\n========================================');
    console.log('DATABASE IS NOW CLEAN!');
    console.log('========================================\n');
    
    console.log('TESTING STEPS:');
    console.log('\n1️⃣  ADD A CONTACT WITH TYPE "BOTH":');
    console.log('   → Go to: http://localhost:5000/contacts.html');
    console.log('   → Click "+ Add Contact"');
    console.log('   → Name: Test Company');
    console.log('   → Type: "Both (Customer AND Supplier)"');
    console.log('   → Click "Save"');
    console.log('   → Server console will show:');
    console.log('      📥 RAW data received...');
    console.log('      🆕 Creating contact with converted values...');
    console.log('      isCustomer=1, isSupplier=1\n');
    
    console.log('2️⃣  ADD A PRODUCT:');
    console.log('   → Go to: http://localhost:5000/products.html');
    console.log('   → Click "+ Add Product"');
    console.log('   → Fill in product details');
    console.log('   → Click "Save"\n');
    
    console.log('3️⃣  TEST SALES PAGE:');
    console.log('   → Go to: http://localhost:5000/sales.html');
    console.log('   → Click customer dropdown');
    console.log('   → ✅ "Test Company" should appear!\n');
    
    console.log('4️⃣  TEST PURCHASE PAGE:');
    console.log('   → Go to: http://localhost:5000/purchases.html');
    console.log('   → Click supplier dropdown');
    console.log('   → ✅ "Test Company" should appear!\n');
    
    console.log('5️⃣  CHECK SERVER CONSOLE:');
    console.log('   → Look for logs showing contact is fetched');
    console.log('   → 🔍 Fetching CUSTOMERS (isCustomer = 1)');
    console.log('   → ✅ Found X contacts');
    console.log('   → 🔍 Fetching SUPPLIERS (isSupplier = 1)');
    console.log('   → ✅ Found X contacts\n');
    
    process.exit(0);
}

clearAll();

