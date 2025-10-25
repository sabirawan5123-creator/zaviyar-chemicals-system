# 🖼️ HOW TO ADD CLIENT LOGO

## ✨ **SUPER SIMPLE - 3 STEPS!**

---

## **Step 1: Get Logo from Client**

Ask your client to send you:
- Company logo image
- **Best format:** PNG (with transparent background)
- **Size:** 500x500 pixels (or any square size)
- **File size:** Under 500KB

---

## **Step 2: Rename Logo File**

- Rename the image to exactly: **`logo.png`**
- Must be lowercase
- Must be `.png` extension

Example:
- ❌ `Logo.PNG`
- ❌ `company-logo.png`
- ✅ `logo.png`

---

## **Step 3: Place Logo File**

### **For Local Testing:**
1. Copy `logo.png`
2. Paste into: `backend/public/` folder
3. Restart server: `node server.js`
4. Open http://localhost:5000
5. Logo appears automatically!

### **For Hosted Server:**

**Using FileZilla (Easiest):**
1. Connect to your server via FileZilla
2. Navigate to `/root/zaviyar-chemicals/backend/public/`
3. Upload `logo.png` to this folder
4. Logo appears automatically!

**Using SCP (Command Line):**
```bash
scp logo.png root@YOUR_SERVER_IP:/root/zaviyar-chemicals/backend/public/
```

**Using SSH:**
```bash
# Connect to server
ssh root@YOUR_SERVER_IP

# Navigate to public folder
cd /root/zaviyar-chemicals/backend/public/

# Upload using wget (if logo is online)
wget https://example.com/client-logo.png -O logo.png

# Or use nano to paste (for small files)
nano logo.png
# Paste content, save
```

---

## **That's It!** ✅

The system **automatically detects** the logo:
- ✅ Shows logo in header (top-left)
- ✅ Shows logo on login page
- ✅ If logo not found, shows "ZC" as fallback
- ✅ Works on all devices (responsive)

**No code changes needed!**
**No server restart needed!**
**Just upload and it works!**

---

## **Logo Specifications:**

| Requirement | Details |
|-------------|---------|
| **Format** | PNG (preferred), JPG, SVG |
| **Size** | 500x500px or similar square |
| **Background** | Transparent (PNG) is best |
| **File Size** | Under 500KB |
| **File Name** | Exactly `logo.png` |
| **Location** | `backend/public/` folder |

---

## **Troubleshooting:**

### **Logo Not Showing?**

**Check 1: File Name**
- Must be exactly: `logo.png` (lowercase)
- Check there are no spaces or typos

**Check 2: File Location**
- Must be in: `backend/public/` folder
- Not in subfolders

**Check 3: File Format**
- Should be: PNG, JPG, or SVG
- Try converting to PNG if issues

**Check 4: Browser Cache**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Or clear browser cache

**Check 5: File Permissions (On Server)**
```bash
# Make sure file is readable
chmod 644 /root/zaviyar-chemicals/backend/public/logo.png
```

---

## **Multiple Logos (Advanced):**

If client wants different logos for different pages:

**Login Page Logo:** `logo.png`
**Dashboard Logo:** `logo-dashboard.png` (requires code change)

For now, use one logo: `logo.png` - works everywhere!

---

## **Logo Examples:**

### **Good Logo:**
```
✅ Square shape (500x500)
✅ Transparent background
✅ Clear, high resolution
✅ Company name visible
✅ Looks good small and large
```

### **Avoid:**
```
❌ Very wide/tall (not square)
❌ White logo on white background
❌ Too much detail (illegible when small)
❌ Very large file size (slows loading)
❌ Low resolution/pixelated
```

---

## **Quick Test:**

After adding logo:

1. Open website
2. Check header (top-left) → Logo should show
3. Go to login page → Logo should show
4. Try on mobile → Logo should scale properly

**If all good → Done!** ✅

---

## 🎨 **PROFESSIONAL TIP:**

Ask your client for **2 versions** of logo:
1. **Full color** (for light backgrounds) → Use this one
2. **White/transparent** (for dark backgrounds) → Keep as backup

Use the full color version as `logo.png` - works best with the purple header!

---

# ✅ **SUMMARY:**

```
1. Get logo from client
2. Rename to: logo.png
3. Put in: backend/public/
4. Done!
```

**That's it! Super simple!** 🎉

