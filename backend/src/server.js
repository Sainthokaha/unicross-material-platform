const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connection (this triggers the "✅ MySQL connected successfully" log)
const db = require('./config/db'); 

// Import routes
const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ DEPLOYMENT READY CORS
// Allows your local Vue app AND your future Vercel app to talk to this backend
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  process.env.FRONTEND_URL // We will add your Vercel URL here in the .env file later
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // If FRONTEND_URL is not set (local dev), allow all localhost
    if (!process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list or contains 'vercel.app'
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Temporarily allow all to prevent CORS errors during initial deploy testing
    return callback(null, true); 
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure uploads directory exists and log it
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
console.log('📁 Uploads directory:', uploadsDir);

try {
  const files = fs.readdirSync(uploadsDir);
  console.log('📂 Files in uploads folder:', files.join(', '));
} catch (err) {
  console.log('⚠️ Could not read uploads folder');
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route (Good for testing if backend is alive)
app.get('/', (req, res) => {
  res.send('🚀 UNICROSS Material Sharing API is live and running!');
});

// ✅ DEPLOYMENT READY PORT
// Cloud providers (like Render) automatically assign a PORT via environment variables.
// If running locally, it defaults to 5000.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});