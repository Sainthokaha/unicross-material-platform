const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const auditLogger = require('../utils/auditLogger');
const { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');

router.get('/', verifyToken, getCategories);
router.post('/', verifyToken, requireRole('admin'), auditLogger('CREATE_CATEGORY'), createCategory);
router.put('/:id', verifyToken, requireRole('admin'), auditLogger('UPDATE_CATEGORY'), updateCategory);
router.delete('/:id', verifyToken, requireRole('admin'), auditLogger('DELETE_CATEGORY'), deleteCategory);

module.exports = router;