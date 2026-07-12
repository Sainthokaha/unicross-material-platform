const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/index');

// Validate file types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Save to backend/uploads/ (one level up from src/)
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PDF, DOC, PPT, TXT, JPG, PNG`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024 
  }
});

module.exports = upload;