# Backend API Server

Express.js backend server with MongoDB and PostgreSQL support.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📡 API Endpoints

### Health & Status
- `GET /` - Server health check
- `GET /api` - API information and available endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### Test
- `GET /api/test` - Test endpoint

## 🗄️ Database Configuration

### Using MongoDB

1. Uncomment in `server.js`:
   ```javascript
   const { connectMongoDB } = require('./config/mongodb');
   connectMongoDB();
   ```

2. Configure `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/mydatabase
   ```

3. The User model is in `models/User.mongodb.js`

### Using PostgreSQL

1. Uncomment in `server.js`:
   ```javascript
   const { connectPostgreSQL } = require('./config/postgresql');
   connectPostgreSQL();
   ```

2. Configure `.env`:
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DATABASE=mydatabase
   ```

3. Run the SQL schema:
   ```bash
   psql -U postgres -d mydatabase -f models/User.postgresql.sql
   ```

## 📁 Project Structure

```
backend/
├── config/              # Database configurations
│   ├── mongodb.js      # MongoDB connection
│   └── postgresql.js   # PostgreSQL connection
├── models/             # Database models
│   ├── User.mongodb.js # Mongoose User model
│   └── User.postgresql.sql # PostgreSQL schema
├── routes/             # API routes
│   └── api.js         # Main API routes
├── server.js          # Express server
├── .env               # Environment variables
└── package.json       # Dependencies
```

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (choose one)
MONGODB_URI=mongodb://localhost:27017/mydatabase

# PostgreSQL (choose one)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=mydatabase

# Security
JWT_SECRET=your_secret_key

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📦 Dependencies

### Production
- **express** - Web framework
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **mongoose** - MongoDB ODM
- **pg** - PostgreSQL client

### Development
- **nodemon** - Auto-restart on changes
- **typescript** - TypeScript support
- **@types/** - Type definitions

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:5000

# Get users
curl http://localhost:5000/api/users

# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'
```

## 🛡️ Security Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting
- Add input validation
- Use helmet.js for security headers

## 📝 Adding New Endpoints

1. Create route handler in `routes/`
2. Import and use in `server.js`
3. Add database queries as needed
4. Update API documentation

Example:
```javascript
// routes/products.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ products: [] });
});

module.exports = router;
```

## 🔄 Database Migration

When switching databases:
1. Comment out the current database connection
2. Uncomment the new database connection
3. Update environment variables
4. Restart the server

