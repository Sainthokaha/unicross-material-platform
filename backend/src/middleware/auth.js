const jwt = require('jsonwebtoken');
const config = require('../config');

// ==========================================
// VERIFY JWT TOKEN
// ==========================================
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Extract the token (format: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. Invalid token format.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret);

    // ✅ Attach user info to request (including department_id)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      department_id: decoded.department_id // ✅ Added this for department locking
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = { verifyToken };