const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

const { 
  getUsers, 
  createUser, 
  toggleUserStatus, 
  getAuditLogs,
  getCategories,
  addDepartment,
  addCourse,
  deleteCourse,
  deleteDepartment,
  updateUserDepartment
} = require('../controllers/adminController');

// All routes require Admin authentication
router.use(verifyToken, requireRole('admin'));

// User Management Routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/department', updateUserDepartment); // ✅ NEW FIX

// Audit Logs Route
router.get('/logs', getAuditLogs);

// Category Management Routes
router.get('/categories', getCategories);
router.post('/categories/department', addDepartment);
router.delete('/categories/department/:id', deleteDepartment);
router.post('/categories/course', addCourse);
router.delete('/categories/course/:id', deleteCourse);

module.exports = router;