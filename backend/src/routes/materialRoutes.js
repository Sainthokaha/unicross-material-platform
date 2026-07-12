const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { 
  uploadMaterial, 
  getMaterials, 
  approveMaterial, 
  rejectMaterial, 
  downloadMaterial,
  getCategories 
} = require('../controllers/materialController');

// ✅ Multer setup with 50MB file size limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // ✅ 50MB limit as per document
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, and images are allowed.'));
    }
  }
});

// Error handling middleware for file size
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 50MB limit. Please upload a smaller file.' });
    }
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Routes
router.post('/upload', verifyToken, upload.single('file'), handleMulterError, uploadMaterial);
router.get('/', verifyToken, getMaterials);
router.get('/categories', verifyToken, getCategories);
router.patch('/:id/approve', verifyToken, approveMaterial);
router.patch('/:id/reject', verifyToken, rejectMaterial);
router.get('/:id/download', verifyToken, downloadMaterial);

module.exports = router;