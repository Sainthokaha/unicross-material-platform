const db = require('../config/db');

// 🛡️ BULLETPROOF AUDIT LOGGER
const logAction = async (userId, action, entityType, entityId, details, req) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown') : 'System';
    const userAgent = req ? (req.headers['user-agent'] || 'Unknown') : 'System';

    // We use a direct query here to ensure it doesn't block the main response
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details, ip, userAgent]
    );
    console.log(`✅ Audit Log Saved: ${action} by User ${userId}`);
  } catch (err) {
    // If the table doesn't exist, this will print the error to your Render logs so you know!
    console.error('❌ AUDIT LOG FAILED (Check if audit_logs table exists):', err.message);
  }
};

module.exports = { logAction };