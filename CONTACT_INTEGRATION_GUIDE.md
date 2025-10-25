# 🔗 Contact Integration with Sales & Purchases - Complete Guide

## 📋 Overview

This guide explains how contacts are integrated with Sales and Purchase modules, and how the `isCustomer` and `isSupplier` flags work.

---

## 🔧 How It Works

### **Contact Types:**

1. **Customer** - `isCustomer = 1`, `isSupplier = 0`
2. **Supplier** - `isCustomer = 0`, `isSupplier = 1`
3. **Both** - `isCustomer = 1`, `isSupplier = 1`

### **Database Fields:**
- `type` - String: 'customer', 'supplier', or 'both' (for backward compatibility)
- `isCustomer` - Integer: 1 or 0
- `isSupplier` - Integer: 1 or 0

---

## 🔍 API Endpoints

### **GET /api/contacts**
Fetches contacts with optional filtering:

```javascript
// Get all contacts
GET /api/contacts

// Get only customers (isCustomer = 1)
GET /api/contacts?type=customer

// Get only suppliers (isSupplier = 1)
GET /api/contacts?type=supplier

// Get both (isCustomer = 1 AND isSupplier = 1)
GET /api/contacts?type=both
```

### **POST /api/contacts**
Creates a new contact:

```javascript
{
  "name": "ABC Company",
  "type": "both",           // 'customer', 'supplier', or 'both'
  "isCustomer": true,       // boolean
  "isSupplier": true,       // boolean
  "email": "abc@example.com",
  "phone": "+92-XXX-XXXXXXX",
  "address": "123 Street, City"
}
```

**Backend Processing:**
- Converts `isCustomer` boolean → 1 or 0
- Converts `isSupplier` boolean → 1 or 0
- Sets `type` based on flags:
  - If both true → 'both'
  - If only `isCustomer` → 'customer'
  - If only `isSupplier` → 'supplier'

### **PUT /api/contacts/:id**
Updates existing contact with same structure as POST.

---

## 📍 Where Contacts Are Used

### **1. Sales Page (`/sales.html`)**
- **Loads customers** via: `GET /api/contacts?type=customer`
- **Includes:** All contacts where `isCustomer = 1`
- **Dropdown shows:** Customer name
- **When selected:** `customerId` is saved in sales record

### **2. Purchase Page (`/purchases.html`)**
- **Loads suppliers** via: `GET /api/contacts?type=supplier`
- **Includes:** All contacts where `isSupplier = 1`
- **Dropdown shows:** Supplier name
- **When selected:** `supplierId` is saved in purchase record

### **3. Contacts Page (`/contacts.html`)**
- **All tab:** Shows all contacts
- **Customer tab:** Filters where `isCustomer = 1`
- **Supplier tab:** Filters where `isSupplier = 1`

### **4. Ledger Page (`/ledger.html`)**
- Shows all contacts with their balances
- Filter by: All, Customer, Supplier, Both
- Calculates receivables and payables based on type

---

## 🧪 Testing Steps

### **Test 1: Create New Contact as "Both"**
1. Go to **Contacts** page
2. Click **"+ Add Contact"**
3. Enter name: "Test Company"
4. Select type: **"Both (Customer AND Supplier)"**
5. Click **Save**

**Expected Result:**
- ✅ Contact appears in Contacts page (both tabs)
- ✅ Go to **Sales** page → Contact appears in customer dropdown
- ✅ Go to **Purchase** page → Contact appears in supplier dropdown

### **Test 2: Edit Existing Contact from Customer to Both**
1. Go to **Contacts** page
2. Find a contact that is **Customer only**
3. Click **"Edit"** button
4. Change type to: **"Both (Customer AND Supplier)"**
5. Click **Save**

**Expected Result:**
- ✅ Alert shows: "Contact updated successfully! Changes will reflect in Sales/Purchase pages."
- ✅ Contact now has badges: **Customer | Supplier**
- ✅ **Refresh Sales page** → Contact appears in customer dropdown
- ✅ **Refresh Purchase page** → Contact appears in supplier dropdown

### **Test 3: Edit Contact from Both to Supplier Only**
1. Go to **Contacts** page
2. Find a contact that is **Both**
3. Click **"Edit"** button
4. Change type to: **"Supplier (Sells to us)"**
5. Click **Save**

**Expected Result:**
- ✅ Contact now has only **Supplier** badge
- ✅ Contact appears in **Supplier** tab only
- ✅ **Sales page** → Contact REMOVED from customer dropdown
- ✅ **Purchase page** → Contact STILL appears in supplier dropdown

---

## 🐛 Debugging

### **Check Server Console**

When creating a contact, you'll see:
```
🆕 Creating contact: {
  name: 'ABC Company',
  type: 'both',
  isCustomer: 1,
  isSupplier: 1
}
```

When updating a contact:
```
✏️ Updating contact: 5 {
  name: 'ABC Company',
  type: 'both',
  isCustomer: 1,
  isSupplier: 1
}
✅ Contact updated successfully: {
  id: 5,
  name: 'ABC Company',
  type: 'both',
  isCustomer: 1,
  isSupplier: 1
}
```

When fetching contacts:
```
🔍 Fetching CUSTOMERS (isCustomer = 1)
✅ Found 5 contacts
Sample contact: { id: 1, name: 'ABC Company', type: 'both', isCustomer: 1, isSupplier: 1 }
```

### **Check Browser Console (F12)**

When saving a contact:
```
💾 Saving contact with data: {...}
📋 Type: both | isCustomer: true | isSupplier: true
Server response: {...}
```

### **Run Database Test Script**

```bash
cd backend
node test-contacts-query.js
```

This will show:
- All contacts in database
- Contacts where `isCustomer = 1` (should appear in Sales)
- Contacts where `isSupplier = 1` (should appear in Purchases)
- Contacts where both = 1 (should appear in both)

---

## ⚠️ Common Issues

### **Issue 1: Contact not showing in Sales/Purchase after edit**

**Cause:** Frontend page cached the old dropdown list

**Solution:** 
- Refresh the Sales/Purchase page (F5)
- The dropdown will reload with updated contacts

### **Issue 2: Contact shows in wrong category**

**Cause:** `isCustomer` or `isSupplier` flags not updated correctly

**Solution:**
1. Check server console for update logs
2. Run `node test-contacts-query.js` to see actual database values
3. Verify the contact shows correct badges on Contacts page

### **Issue 3: "Both" contacts only show as Customer**

**Cause:** Backend query filtering incorrectly

**Solution:**
- Fixed! Backend now uses `WHERE isCustomer = 1` for customers
- And `WHERE isSupplier = 1` for suppliers
- Contacts with both flags will appear in both queries

---

## 📊 Database Schema

```sql
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,              -- 'customer', 'supplier', 'both'
  isCustomer INTEGER DEFAULT 0,    -- 1 or 0
  isSupplier INTEGER DEFAULT 0,    -- 1 or 0
  email TEXT,
  phone TEXT,
  address TEXT,
  balance REAL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## ✅ Verification Checklist

After making any changes to contact integration:

- [ ] Create new contact as "Customer" → Shows in Sales dropdown
- [ ] Create new contact as "Supplier" → Shows in Purchase dropdown
- [ ] Create new contact as "Both" → Shows in BOTH dropdowns
- [ ] Edit contact from "Customer" to "Both" → Now shows in Purchases too
- [ ] Edit contact from "Both" to "Supplier" → Removed from Sales, stays in Purchases
- [ ] Ledger shows correct balances for all contact types
- [ ] Contact badges display correctly (Customer/Supplier/Both)
- [ ] Server console logs show correct flag values
- [ ] Database test script confirms correct storage

---

## 🎯 Key Points

1. **`isCustomer` and `isSupplier` are the SOURCE OF TRUTH**
   - NOT the `type` field
   - `type` is just for backward compatibility

2. **Backend converts booleans to integers**
   - Frontend sends: `true` or `false`
   - Backend stores: `1` or `0`

3. **Queries use flags, not type**
   - Customer query: `WHERE isCustomer = 1`
   - Supplier query: `WHERE isSupplier = 1`

4. **"Both" means BOTH flags are 1**
   - Will appear in customer list
   - Will appear in supplier list
   - Will appear in both tabs on Contacts page

---

## 📞 Support

If contacts are still not showing correctly:

1. Open browser console (F12)
2. Check server console
3. Run: `node test-contacts-query.js`
4. Verify the output matches expectations
5. Share the logs for debugging

---

**Last Updated:** January 2025  
**Version:** 1.0  
**System:** Zaviyar Chemicals Accounting System

