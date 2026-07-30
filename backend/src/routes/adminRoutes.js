const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(verifyToken);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', verifyAdmin, adminController.toggleUserStatus);
router.patch('/users/:id/department', verifyAdmin, adminController.updateUserDepartment);

// Departments & Courses
router.get('/departments', adminController.getAllDepartments);
router.get('/courses', adminController.getAllCourses);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;