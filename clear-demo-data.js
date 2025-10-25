// Script to clear all demo data from database
const db = require('./database');

console.log('\n========================================');
console.log('CLEARING ALL DEMO DATA');
console.log('========================================\n');

let tablesCleared = 0;

// Clear all tables
const tables = [
    'sales',
    'purchases',
    'expenses',
    'products',
    'contacts',
    'payments',
    'bankAccounts',
    'transactions'
];

console.log('⚠️  WARNING: This will delete ALL data except users!\n');
console.log('Tables to clear:');
tables.forEach(t => console.log(`  - ${t}`));
console.log('\n');

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
    console.log('Starting to clear tables...\n');
    
    for (const table of tables) {
        await clearTable(table);
    }
    
    console.log('\n========================================');
    console.log('✅ ALL DEMO DATA CLEARED!');
    console.log('========================================\n');
    
    console.log('Database is now empty (except users).');
    console.log('You can now test the app with fresh data.\n');
    
    console.log('NEXT STEPS:');
    console.log('1. Go to Contacts page');
    console.log('2. Add a new contact with type "Both"');
    console.log('3. Go to Products page');
    console.log('4. Add a new product');
    console.log('5. Go to Sales page');
    console.log('6. Verify contact appears in customer dropdown');
    console.log('7. Go to Purchase page');
    console.log('8. Verify contact appears in supplier dropdown\n');
    
    process.exit(0);
}

clearAll();

