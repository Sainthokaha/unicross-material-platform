const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { verifyToken } = require('../middleware/auth');
const { uploadMaterial, getMaterials, approveMaterial, rejectMaterial, downloadMaterial, getCategories } = require('../controllers/materialController');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'material-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|ppt|pptx|xls|xlsx|jpg|jpeg|png|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type.'));
  }
});

// ✅ THIS IS THE EXACT ROUTE THE FRONTEND CALLS
router.post('/', verifyToken, upload.single('file'), uploadMaterial);
router.get('/', verifyToken, getMaterials);
router.get('/categories', verifyToken, getCategories);
router.patch('/:id/approve', verifyToken, approveMaterial);
router.patch('/:id/reject', verifyToken, rejectMaterial);
router.get('/:id/download', verifyToken, downloadMaterial);

module.exports = router;