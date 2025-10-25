# 🔍 Ledger Error - Complete Debugging Guide

## ❌ Error Reported
```
Error loading ledger: Failed to load contact details
```

---

## ✅ Fixes Applied

### 1. **Enhanced Backend Logging**
Added detailed console logs to `GET /api/contacts/:id` route:
- When request received
- When contact found
- When contact not found
- All error scenarios

### 2. **Enhanced Frontend Error Handling**
Updated `ledger-report.html` to show:
- Actual HTTP status code
- Detailed error message from server
- Token presence check
- Full response data

### 3. **Verified Route Order**
Confirmed Express route matching order is correct:
```javascript
Line 75:  GET /api/contacts/:id/ledger  (specific - matches first)
Line 172: GET /api/contacts/:id         (general - matches after)
```

---

## 🧪 Testing Steps

### **Step 1: Open Ledger Page**
```
http://localhost:5000/ledger.html
```

### **Step 2: Open Browser Console (F12)**
- Press `F12` in your browser
- Go to **Console** tab
- Keep it open

### **Step 3: Open Server Console**
- Look at your PowerShell/CMD window where server is running
- Keep it visible

### **Step 4: Click on Any Contact**
Click on any contact card in the ledger page

### **Step 5: Check Browser Console (F12)**
You should see logs like this:

**If Working:**
```
📊 Loading ledger for contact ID: 5
🔑 Token: Present
📡 Contact API Response Status: 200
📦 Contact Data: {success: true, data: {...}}
✅ Contact: {id: 5, name: "ABC Company", ...}
📦 Sales: 3
🛒 Purchases: 2
📦 Products: 10
```

**If Error - Auth Issue (401):**
```
📊 Loading ledger for contact ID: 5
🔑 Token: Missing  <-- PROBLEM HERE
📡 Contact API Response Status: 401
❌ Contact API Error: {message: "Not authorized"}
```

**If Error - Contact Not Found (404):**
```
📊 Loading ledger for contact ID: 5
🔑 Token: Present
📡 Contact API Response Status: 404
❌ Contact API Error: {message: "Contact not found"}
```

**If Error - Server Error (500):**
```
📊 Loading ledger for contact ID: 5
🔑 Token: Present
📡 Contact API Response Status: 500
❌ Contact API Error: {message: "Database error..."}
```

### **Step 6: Check Server Console**
You should see logs like this:

**If Working:**
```
📋 Fetching contact by ID: 5
✅ Contact found: { id: 5, name: 'ABC Company', type: 'customer' }
```

**If Contact Not Found:**
```
📋 Fetching contact by ID: 5
❌ Contact not found: 5
```

**If Database Error:**
```
📋 Fetching contact by ID: 5
❌ Contact fetch error: [error message]
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: Token Missing (401 Unauthorized)**

**Symptoms:**
- Browser console shows: `🔑 Token: Missing`
- Status: 401

**Solution:**
1. Go back to login page: `http://localhost:5000/login.html`
2. Log in again
3. Try opening ledger again

---

### **Issue 2: Contact Not Found (404)**

**Symptoms:**
- Server console shows: `❌ Contact not found: X`
- Status: 404

**Possible Causes:**
a) Contact was deleted
b) Contact ID in URL is incorrect
c) Database is empty

**Solution:**
1. Go to Contacts page
2. Verify contact exists
3. Click "Ledger" button again

---

### **Issue 3: Wrong Route Matching**

**Symptoms:**
- Request goes to `/api/contacts/:id/ledger` instead of `/api/contacts/:id`
- Returns transaction data instead of contact data

**How to Check:**
Look at server console - it should show:
```
📋 Fetching contact by ID: 5
```

If you see:
```
Ledger fetch...
```
Then it's hitting the wrong route.

**Solution:**
Server restart should fix it (routes reload in correct order)

---

### **Issue 4: Database Error (500)**

**Symptoms:**
- Status: 500
- Server shows database error

**Solution:**
1. Check if database file exists: `backend/data/database.sqlite`
2. Run: `node test-contacts-query.js` to verify database
3. Restart server

---

## 📝 What to Share for Debugging

If ledger is still not working, please share:

### **From Browser Console (F12):**
```
1. All messages starting with 📊, 🔑, 📡, 📦, ✅, or ❌
2. Any error messages in red
3. Network tab - Status of /api/contacts/X request
```

### **From Server Console:**
```
1. All messages starting with 📋, ✅, or ❌
2. Any error stack traces
3. The exact URL being requested
```

### **Screenshot:**
- The error message shown on screen
- Browser console
- Server console

---

## 🧪 Quick Test Commands

### **Test 1: Check if API endpoint works directly**

Open a new tab and go to:
```
http://localhost:5000/api/contacts/1
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "...",
    "type": "...",
    ...
  }
}
```

**If you see "Not authorized":**
- The endpoint requires authentication
- This is normal
- The issue is likely with token in ledger page

**If you see "Contact not found":**
- Contact with ID 1 doesn't exist
- Try with a different ID that exists

---

### **Test 2: Check database directly**

```bash
cd backend
node test-contacts-query.js
```

This will show:
- All contacts in database
- Their IDs, names, and types
- How many contacts exist

---

### **Test 3: Check token in browser**

Open browser console (F12) on any page and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

**Expected:**
- Token: Long string (JWT token)
- User: JSON object with name, email, role

**If null:**
- You're not logged in
- Go to login page

---

## ✅ Verification Checklist

After server restart, verify:

- [ ] Server started without errors
- [ ] Can login successfully
- [ ] Contacts page loads
- [ ] Ledger page loads (shows contact cards)
- [ ] Click on contact → New tab opens
- [ ] Ledger report page loads
- [ ] Shows contact name at top
- [ ] Shows transactions table (even if empty)
- [ ] No errors in browser console
- [ ] No errors in server console

---

## 🎯 Expected Flow

1. **User clicks on contact in ledger page**
2. **JavaScript calls:** `viewLedger(contactId)`
3. **Opens new tab:** `/ledger-report.html?id=5`
4. **Page loads, JavaScript runs:**
   - Gets `id=5` from URL
   - Gets `token` from localStorage
   - Calls: `GET /api/contacts/5` with auth header
5. **Server receives request:**
   - Logs: `📋 Fetching contact by ID: 5`
   - Queries database
   - Finds contact
   - Logs: `✅ Contact found: {...}`
   - Returns JSON response
6. **Browser receives response:**
   - Logs: `📡 Contact API Response Status: 200`
   - Logs: `📦 Contact Data: {...}`
   - Logs: `✅ Contact: {...}`
   - Displays contact name
   - Fetches sales/purchases
   - Builds ledger table
   - Shows report

---

## 🆘 Still Not Working?

If after all this the ledger still shows error, run these commands and share the output:

```bash
# Check database
cd backend
node test-contacts-query.js

# Check if contact with ID 1 exists in database
# You'll see the output
```

Then try:
1. Login again
2. Go to Contacts page
3. Click "Ledger" on a contact that shows in the list
4. Share both browser console (F12) and server console output

---

**Last Updated:** January 2025  
**File:** `LEDGER_DEBUG_GUIDE.md`  
**System:** Zaviyar Chemicals Accounting System

