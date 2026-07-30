const db = require('../config/db');

// 🛡️ BULLETPROOF AUDIT LOGGER
// Tracks actions, IP addresses, and device types across all platforms
const logAction = async (userId, action, entityType, entityId, details, req) => {
  try {
    // Extract IP and Device info from the request
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown') : 'System';
    const userAgent = req ? (req.headers['user-agent'] || 'Unknown') : 'System';

    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details, ip, userAgent]
    );
  } catch (err) {
    // Never let a failed audit log crash the main app
    console.error('❌ Audit Log Failed:', err.message);
  }
};

module.exports = { logAction };