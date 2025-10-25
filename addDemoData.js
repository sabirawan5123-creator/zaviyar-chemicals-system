const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'accounting.db');
const db = new sqlite3.Database(dbPath);

console.log('🎬 Adding realistic demo data for client video...\n');

async function addDemoData() {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                // 1. Add Products (Chemical Industry)
                console.log('📦 Adding Products...');
                const products = [
                    ['Sulfuric Acid 98%', 'CHEM-001', 'Acids', 15000, 12000, 500, 100, 'Industrial grade sulfuric acid'],
                    ['Hydrochloric Acid 35%', 'CHEM-002', 'Acids', 8500, 6500, 750, 150, 'Commercial grade HCl'],
                    ['Sodium Hydroxide (Caustic Soda)', 'CHEM-003', 'Alkalis', 12000, 9500, 600, 100, 'Flakes form, 99% purity'],
                    ['Calcium Carbonate', 'CHEM-004', 'Salts', 5500, 4200, 1200, 200, 'Powder form, pharmaceutical grade'],
                    ['Ethanol 99.9%', 'CHEM-005', 'Solvents', 18000, 15000, 400, 80, 'Pure ethanol for industrial use'],
                    ['Acetone', 'CHEM-006', 'Solvents', 9500, 7500, 550, 100, 'Laboratory grade'],
                    ['Ammonia Solution 25%', 'CHEM-007', 'Bases', 7200, 5800, 800, 150, 'Aqueous ammonia'],
                    ['Nitric Acid 68%', 'CHEM-008', 'Acids', 16500, 13500, 300, 50, 'Concentrated nitric acid'],
                    ['Phosphoric Acid 85%', 'CHEM-009', 'Acids', 11000, 8800, 450, 80, 'Food and industrial grade'],
                    ['Methanol', 'CHEM-010', 'Solvents', 13500, 11000, 650, 120, 'Pure methanol']
                ];

                for (const product of products) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO products (name, sku, category, price, cost, stock, minStock, description) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, product, (err) => {
                            if (err) console.error('Product error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 10 chemical products\n');

                // 2. Add Contacts (Customers)
                console.log('👥 Adding Customers...');
                const customers = [
                    ['ABC Pharmaceuticals Ltd', 'customer', 'purchase@abcpharma.pk', '021-34567890', 'Plot 45, Korangi Industrial Area, Karachi', 0],
                    ['Textile Mills International', 'customer', 'procurement@textileintl.pk', '042-35678901', 'Faisalabad Industrial Estate, Faisalabad', 0],
                    ['Polymer Industries Pakistan', 'customer', 'info@polymerindustries.pk', '021-36789012', 'Site Area, Karachi', 0],
                    ['United Chemicals Lahore', 'customer', 'sales@unitedchem.pk', '042-37890123', 'Sundar Industrial Estate, Lahore', 0],
                    ['Peshawar Industrial Corporation', 'customer', 'admin@peshind.pk', '091-5234567', 'Hayatabad Industrial Estate, Peshawar', 0]
                ];

                for (const customer of customers) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO contacts (name, type, email, phone, address, balance) 
                                VALUES (?, ?, ?, ?, ?, ?)`, customer, (err) => {
                            if (err) console.error('Customer error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 5 customers\n');

                // 3. Add Contacts (Suppliers)
                console.log('🏭 Adding Suppliers...');
                const suppliers = [
                    ['Chemical Imports Ltd', 'supplier', 'sales@chemimports.pk', '021-32123456', 'Port Qasim, Karachi', 0],
                    ['International Trading Company', 'supplier', 'info@itcpak.com', '042-36234567', 'Lahore', 0],
                    ['Karachi Chemical Suppliers', 'supplier', 'kcs@suppliers.pk', '021-33345678', 'Shershah, Karachi', 0],
                    ['Premium Chemicals Pakistan', 'supplier', 'contact@premiumchem.pk', '042-37456789', 'Industrial Area, Lahore', 0]
                ];

                for (const supplier of suppliers) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO contacts (name, type, email, phone, address, balance) 
                                VALUES (?, ?, ?, ?, ?, ?)`, supplier, (err) => {
                            if (err) console.error('Supplier error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 4 suppliers\n');

                // 4. Add Sales (Recent transactions)
                console.log('💰 Adding Sales...');
                const sales = [
                    ['INV-2024-001', 1, JSON.stringify([{productId:1,name:'Sulfuric Acid 98%',qty:50,price:15000}]), 750000, 22500, 0, 772500, 'Bank Transfer', 'Paid', 'Bulk order - monthly supply', '2024-01-15'],
                    ['INV-2024-002', 2, JSON.stringify([{productId:2,name:'Hydrochloric Acid 35%',qty:100,price:8500},{productId:6,name:'Acetone',qty:30,price:9500}]), 1135000, 34050, 10000, 1159050, 'Cash', 'Paid', 'Regular customer', '2024-01-18'],
                    ['INV-2024-003', 3, JSON.stringify([{productId:3,name:'Sodium Hydroxide',qty:80,price:12000}]), 960000, 28800, 0, 988800, 'Cheque', 'Paid', 'Industrial order', '2024-01-20'],
                    ['INV-2024-004', 4, JSON.stringify([{productId:5,name:'Ethanol 99.9%',qty:40,price:18000}]), 720000, 21600, 0, 741600, 'Bank Transfer', 'Pending', 'Pharmaceutical grade', '2024-01-22'],
                    ['INV-2024-005', 5, JSON.stringify([{productId:7,name:'Ammonia Solution 25%',qty:120,price:7200}]), 864000, 25920, 15000, 874920, 'Cash', 'Paid', 'Textile industry', '2024-01-24'],
                    ['INV-2024-006', 1, JSON.stringify([{productId:9,name:'Phosphoric Acid 85%',qty:60,price:11000}]), 660000, 19800, 0, 679800, 'Bank Transfer', 'Paid', 'Food grade', '2024-01-25']
                ];

                for (const sale of sales) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO sales (invoiceNo, customerId, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, notes, createdAt) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, sale, (err) => {
                            if (err) console.error('Sale error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 6 sales invoices\n');

                // 5. Add Purchases
                console.log('🛒 Adding Purchases...');
                const purchases = [
                    ['PO-2024-001', 6, JSON.stringify([{productId:1,name:'Sulfuric Acid 98%',qty:200,price:12000}]), 2400000, 72000, 50000, 2422000, 'Bank Transfer', 'Paid', 'Bulk import', '2024-01-10'],
                    ['PO-2024-002', 7, JSON.stringify([{productId:2,name:'Hydrochloric Acid 35%',qty:300,price:6500}]), 1950000, 58500, 0, 2008500, 'Cheque', 'Paid', 'Monthly stock', '2024-01-12'],
                    ['PO-2024-003', 8, JSON.stringify([{productId:5,name:'Ethanol 99.9%',qty:150,price:15000}]), 2250000, 67500, 25000, 2292500, 'Bank Transfer', 'Paid', 'Premium quality', '2024-01-14'],
                    ['PO-2024-004', 9, JSON.stringify([{productId:3,name:'Sodium Hydroxide',qty:250,price:9500}]), 2375000, 71250, 0, 2446250, 'Bank Transfer', 'Pending', 'Industrial grade', '2024-01-23']
                ];

                for (const purchase of purchases) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO purchases (purchaseNo, supplierId, items, subtotal, tax, discount, total, paymentMethod, paymentStatus, notes, createdAt) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, purchase, (err) => {
                            if (err) console.error('Purchase error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 4 purchase orders\n');

                // 6. Add Expenses
                console.log('💳 Adding Expenses...');
                const expenses = [
                    ['Rent', 150000, '2024-01-01', 'Bank Transfer', 'Monthly office and warehouse rent'],
                    ['Utilities', 45000, '2024-01-05', 'Cash', 'Electricity and water bills'],
                    ['Salaries', 850000, '2024-01-05', 'Bank Transfer', 'Staff salaries for January'],
                    ['Transportation', 65000, '2024-01-10', 'Cash', 'Delivery and logistics'],
                    ['Marketing', 35000, '2024-01-15', 'Online Transfer', 'Digital marketing and ads'],
                    ['Office Supplies', 18000, '2024-01-18', 'Cash', 'Stationery and supplies'],
                    ['Maintenance', 28000, '2024-01-20', 'Cash', 'Equipment maintenance'],
                    ['Insurance', 55000, '2024-01-22', 'Bank Transfer', 'Business insurance premium']
                ];

                for (const expense of expenses) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO expenses (category, amount, date, paymentMethod, description) 
                                VALUES (?, ?, ?, ?, ?)`, expense, (err) => {
                            if (err) console.error('Expense error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 8 expense records\n');

                // 7. Add Payments
                console.log('💵 Adding Payments...');
                const payments = [
                    ['received', 1, 772500, 'Bank Transfer', 'PAY-REC-001', '2024-01-16', 'Payment for INV-2024-001'],
                    ['received', 2, 1159050, 'Cash', 'PAY-REC-002', '2024-01-19', 'Payment for INV-2024-002'],
                    ['received', 3, 988800, 'Cheque', 'PAY-REC-003', '2024-01-21', 'Payment for INV-2024-003'],
                    ['paid', 6, 2422000, 'Bank Transfer', 'PAY-PAID-001', '2024-01-11', 'Payment for PO-2024-001'],
                    ['paid', 7, 2008500, 'Cheque', 'PAY-PAID-002', '2024-01-13', 'Payment for PO-2024-002'],
                    ['journal', null, 50000, 'Adjustment', 'JV-001', '2024-01-25', 'Bank charges adjustment']
                ];

                for (const payment of payments) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO payments (type, contactId, amount, paymentMethod, referenceNo, date, notes) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)`, payment, (err) => {
                            if (err) console.error('Payment error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 6 payment records\n');

                // 8. Add Bank Accounts
                console.log('🏦 Adding Bank Accounts...');
                const bankAccounts = [
                    ['bank', 'Meezan Bank - Business Account', '0123456789012', 'Meezan Bank Limited', 2500000, 'Main business account'],
                    ['bank', 'HBL Current Account', '9876543210123', 'Habib Bank Limited', 1800000, 'Secondary account for operations'],
                    ['cash', 'Cash in Hand', null, null, 350000, 'Petty cash and daily operations']
                ];

                for (const account of bankAccounts) {
                    await new Promise((res, rej) => {
                        db.run(`INSERT INTO bankAccounts (accountType, accountName, accountNumber, bankName, balance, notes) 
                                VALUES (?, ?, ?, ?, ?, ?)`, account, (err) => {
                            if (err) console.error('Bank account error:', err.message);
                            res();
                        });
                    });
                }
                console.log('✅ Added 3 bank accounts\n');

                // 9. Update Settings
                console.log('⚙️ Updating Business Settings...');
                await new Promise((res, rej) => {
                    db.run(`DELETE FROM settings WHERE id = 1`, (err) => res());
                });
                
                await new Promise((res, rej) => {
                    db.run(`INSERT INTO settings (id, businessName, businessAddress, businessPhone, businessEmail, currency, taxRate, dateFormat, fiscalYearStart) 
                            VALUES (1, 'Zaviyar Chemicals', 'Plot 234, Sector 25, Korangi Industrial Area, Karachi, Pakistan', '+92-21-35123456', 'info@zaviyarchemicals.pk', 'PKR', 3.0, 'DD/MM/YYYY', '01')`, 
                    (err) => {
                        if (err) console.error('Settings error:', err.message);
                        res();
                    });
                });
                console.log('✅ Updated business settings\n');

                console.log('🎉 =====================================');
                console.log('🎉 DEMO DATA ADDED SUCCESSFULLY!');
                console.log('🎉 =====================================\n');
                console.log('📊 Summary:');
                console.log('   ✅ 10 Chemical Products');
                console.log('   ✅ 5 Customers');
                console.log('   ✅ 4 Suppliers');
                console.log('   ✅ 6 Sales Invoices (Rs. 5,316,670 total)');
                console.log('   ✅ 4 Purchase Orders (Rs. 9,169,250 total)');
                console.log('   ✅ 8 Expense Records (Rs. 1,246,000 total)');
                console.log('   ✅ 6 Payment Records');
                console.log('   ✅ 3 Bank Accounts (Rs. 4,650,000 total)');
                console.log('   ✅ Business Settings Updated\n');
                console.log('🎬 YOUR SYSTEM NOW LOOKS LIKE A REAL CLIENT IS USING IT!\n');
                console.log('🚀 Ready for video recording at: http://localhost:5000');
                console.log('🔐 Login: admin@test.com / admin123\n');

                resolve();
            } catch (error) {
                console.error('❌ Error:', error);
                reject(error);
            }
        });
    });
}

addDemoData()
    .then(() => {
        db.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        db.close();
        process.exit(1);
    });

