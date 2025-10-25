# Zaviyar Chemicals - Inventory Management System

## 🚀 Vercel Deployment Guide

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)

### Step 1: Create PostgreSQL Database on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Name it: `zaviyar-chemicals-db`
6. Select region (closest to you)
7. Click **"Create"**

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose: `zaviyar-chemicals-system`
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave empty or type `./`)
   - **Build Command:** `npm install`
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

6. Click **"Deploy"**

### Step 3: Connect Database to Project

1. Go to your project settings on Vercel
2. Click **"Storage"** tab
3. Click **"Connect Store"**
4. Select your `zaviyar-chemicals-db`
5. Vercel will automatically add environment variables:
   - `DATABASE_URL`
   - `POSTGRES_URL`

### Step 4: Redeploy

After connecting the database:
1. Go to **"Deployments"** tab
2. Click the **three dots** on the latest deployment
3. Click **"Redeploy"**
4. Your app is now live! 🎉

---

## 🌐 Your Demo URL

```
https://zaviyar-chemicals-system.vercel.app
```

### Default Login Credentials

```
Email: admin@zaviyar.com
Password: admin123
```

---

## 💻 Local Development

### Using SQLite (No setup needed!)

```bash
npm install
npm start
```

The app will automatically use SQLite for local development.

### Using PostgreSQL (Optional)

1. Install PostgreSQL locally
2. Create a database
3. Create `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/zaviyar_db
```
4. Run: `npm start`

---

## 📦 Features

- ✅ Inventory Management
- ✅ Sales Tracking
- ✅ Purchase Management
- ✅ Customer & Supplier Management
- ✅ Professional Ledger Reports
- ✅ Dashboard Analytics
- ✅ Invoice Generation
- ✅ Expense Tracking
- ✅ Payment Management

---

## 🛠️ Tech Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **Frontend:** HTML + CSS + JavaScript
- **Deployment:** Vercel
- **Authentication:** JWT

---

## 📞 Support

For issues or questions, contact the development team.

---

## 📝 License

Copyright © 2024 Zaviyar Chemicals. All rights reserved.
