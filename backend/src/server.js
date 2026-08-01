const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://unicross-material-platform.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
// This allows the frontend to access uploaded files via /uploads/filename.ext
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== ROUTES ====================
// Ensure these filenames match EXACTLY (case-sensitive)
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
// Catch-all for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 UNICROSS Material Sharing API is live and running on port ${PORT}`);
});