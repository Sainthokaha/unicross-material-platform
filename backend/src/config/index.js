require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'material_sharing_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 50
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

// Validate critical config
if (!config.jwt.secret || config.jwt.secret === 'fallback_secret_change_in_production') {
  console.warn('⚠️  WARNING: Using default JWT secret. Set JWT_SECRET in .env for production!');
}

module.exports = config;