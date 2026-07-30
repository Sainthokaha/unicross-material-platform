const jwt = require('jsonwebtoken');

// 1. Verify that the user has a valid JWT token
const verifyToken = (req, res, next) => {
  // Check both 'authorization' and 'Authorization' headers
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (id, role, email) to the request
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// 2. Verify that the authenticated user is an Admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
};

module.exports = { verifyToken, verifyAdmin };