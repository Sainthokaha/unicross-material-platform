const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://unicross-material-platform.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FILES (UPLOADS) ====================
// Use process.cwd() for a reliable absolute path to the backend root
const uploadPath = path.join(process.cwd(), 'uploads');

// Ensure the directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('📁 Created uploads directory at:', uploadPath);
} else {
  console.log('📂 Serving uploads from:', uploadPath);
}

// Serve static files
app.use('/uploads', express.static(uploadPath));

// ==================== DIAGNOSTIC ROUTE ====================
// This lets us see exactly what files are currently on the server
app.get('/api/debug/uploads', (req, res) => {
  try {
    const files = fs.readdirSync(uploadPath);
    res.json({ 
      success: true, 
      uploadPath, 
      fileCount: files.length,
      files: files 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== ROUTES ====================
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const materialRoutes = require('./routes/materialRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/materials', materialRoutes);

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'UNICROSS Material Sharing API is live and healthy',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 UNICROSS Material Sharing API is live and running on port ${PORT}`);
});