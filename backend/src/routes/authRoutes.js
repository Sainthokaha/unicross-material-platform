const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { verifyToken } = require('../middleware/auth');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  changePassword,
  updateProfileImage 
} = require('../controllers/authController');

// Multer setup for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', verifyToken, changePassword);

// ✅ Profile Image Upload Route
router.post('/profile-image', verifyToken, upload.single('profile_image'), updateProfileImage);

module.exports = router;