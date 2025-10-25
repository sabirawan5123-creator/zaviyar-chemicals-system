# 🔍 Debug Steps - Find Why Contacts Not Showing

## ✅ What I Added:

I added **detailed console logging** to both Sales and Purchase pages. This will tell us EXACTLY what's happening.

---

## 🧪 **TEST NOW - STEP BY STEP:**

### **Step 1: Open Sales Page with Console**

1. Open your browser
2. Go to: **http://localhost:5000/sales.html**
3. Press **F12** (this opens Developer Tools)
4. Click on the **"Console"** tab
5. Press **Ctrl + Shift + R** (hard refresh)

### **Step 2: Look at Console Output**

You should see something like this:

**✅ If it's WORKING:**
```
🔵 Loading customers...
📡 Customer API Response Status: 200
📦 Customer API Result: {success: true, count: 2, data: Array(2)}
✅ Found 2 customers: ['sabir anwar', 'awan']
✅ Customer dropdown updated with 2 customers
```

**❌ If there's a PROBLEM:**
```
🔵 Loading customers...
📡 Customer API Response Status: 401
❌ Failed to load customers: Unauthorized
```

OR

```
🔵 Loading customers...
📦 Customer API Result: {success: true, count: 0, data: []}
✅ Found 0 customers: []
✅ Customer dropdown updated with 0 customers
```

---

### **Step 3: Test Purchase Page**

1. Go to: **http://localhost:5000/purchases.html**
2. Keep **F12** console open
3. Press **Ctrl + Shift + R** (hard refresh)

**✅ If it's WORKING:**
```
🔵 Loading suppliers...
📡 Supplier API Response Status: 200
📦 Supplier API Result: {success: true, count: 2, data: Array(2)}
✅ Found 2 suppliers: ['amen anear', 'awan']
✅ Supplier dropdown updated with 2 suppliers
```

---

## 📸 **WHAT TO DO:**

### **If you see "Found 0 customers" or "Found 0 suppliers":**

1. Take a screenshot of the console
2. Look at the "📦 Customer API Result" or "📦 Supplier API Result"
3. Check if `data` is empty: `data: []`
4. This means the backend is NOT returning contacts

**ACTION:** Check the server console (PowerShell window) to see if it shows:
```
🔍 Fetching CUSTOMERS (isCustomer = 1)
✅ Found 2 contacts
```

### **If you see "401 Unauthorized" or "403 Forbidden":**

1. Your login token expired
2. **ACTION:** Logout and login again
3. Then refresh the pages

### **If you see "Failed to fetch" or network error:**

1. Server is not running
2. **ACTION:** Check if server is running on http://localhost:5000

### **If you see "Found 2 customers" but dropdown is still empty:**

1. There's a JavaScript error after loading
2. Scroll down in the console to find the error
3. **ACTION:** Share the error message

---

## 🎯 **QUICK TEST (30 seconds):**

1. **Sales Page:** http://localhost:5000/sales.html (Press F12 → Ctrl+Shift+R)
   - Look for: `✅ Found 2 customers: ['sabir anwar', 'awan']`
   
2. **Purchase Page:** http://localhost:5000/purchases.html (Press F12 → Ctrl+Shift+R)
   - Look for: `✅ Found 2 suppliers: ['amen anear', 'awan']`

3. **Screenshot the console** and share with me

---

## 📋 **Copy-Paste This to Test API Directly:**

Open any page (like Dashboard), press F12, and paste this in Console:

```javascript
// Test 1: Check token
console.log('Token exists:', !!localStorage.getItem('token'));

// Test 2: Fetch customers
fetch('/api/contacts?type=customer', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => {
  console.log('CUSTOMERS API Response:', d);
  console.log('Customer count:', d.count);
  console.log('Customer names:', d.data.map(c => c.name));
});

// Test 3: Fetch suppliers
fetch('/api/contacts?type=supplier', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => {
  console.log('SUPPLIERS API Response:', d);
  console.log('Supplier count:', d.count);
  console.log('Supplier names:', d.data.map(c => c.name));
});
```

**Expected output:**
```
Token exists: true
CUSTOMERS API Response: {success: true, count: 2, data: Array(2)}
Customer count: 2
Customer names: ['sabir anwar', 'awan']
SUPPLIERS API Response: {success: true, count: 2, data: Array(2)}
Supplier count: 2
Supplier names: ['amen anear', 'awan']
```

---

## 🚀 **Server Status:**

Server is running on: **http://localhost:5000**

Database has:
- ✅ sabir anwar (Customer) - isCustomer=1
- ✅ amen anear (Supplier) - isSupplier=1
- ✅ awan (Both) - isCustomer=1, isSupplier=1

Backend is ready and working!

---

## 📞 **Report Back:**

Please tell me:

1. What do you see in the console? (Screenshot is best)
2. Does it say "Found X customers/suppliers"?
3. What is the number X?
4. Are there any red errors in the console?

This will help me find the exact problem!

---

**Next step: Open Sales page with F12 and check console** 🔍

