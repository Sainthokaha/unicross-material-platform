const jwt = require('jsonwebtoken');

// ==========================================
// VERIFY JWT TOKEN
// ==========================================
const verifyToken = (req, res, next) => {
  try {
    // 1. Get token from header (check both lowercase and uppercase)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Debug logging (remove in production if desired)
    console.log('🔍 Auth Middleware - Headers:', Object.keys(req.headers));
    console.log(' Auth Middleware - Auth Header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.error('❌ No authorization header found');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // 2. Extract the token (format: "Bearer <token>")
    if (!authHeader.startsWith('Bearer ')) {
      console.error(' Invalid token format - must start with "Bearer "');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format. Use "Bearer <token>"' 
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token === '') {
      console.error('❌ Token is empty after "Bearer "');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Token is empty.' 
      });
    }

    // 3. Get JWT secret (use process.env directly instead of config)
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET environment variable is not set!');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error. JWT secret not set.' 
      });
    }

    // 4. Verify the token
    const decoded = jwt.verify(token, jwtSecret);

    // 5. Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      department_id: decoded.department_id
    };

    console.log('✅ Token verified successfully for user:', req.user.email);
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err.name, err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

module.exports = { verifyToken };