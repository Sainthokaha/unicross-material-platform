const pool = require('../config/db');

function auditLogger(action) {
  return async (req, res, next) => {
    // Capture original response methods to log after completion
    const originalJson = res.json.bind(res);
    
    res.json = function(body) {
      // Log only successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const logEntry = {
          user_id: req.user.id,
          action: action,
          details: JSON.stringify({
            path: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            ...(req.file && { fileName: req.file.originalname }),
            ...(req.body && { requestBody: req.body })
          }),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        };

        // Fire-and-forget logging (don't block response)
        pool.query(
          'INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
          [logEntry.user_id, logEntry.action, logEntry.details, logEntry.ip_address, logEntry.user_agent]
        ).catch(err => console.error('Audit log failed:', err));
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

module.exports = auditLogger;