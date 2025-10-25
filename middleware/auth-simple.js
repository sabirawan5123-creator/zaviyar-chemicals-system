const jwt = require('jsonwebtoken');
const db = require('../database');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      
      // Get user from token (using async db.get)
      db.get('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: 'Database error'
          });
        }
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User no longer exists'
          });
        }

        req.user = {
          id: user.id,
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };

        next();
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

