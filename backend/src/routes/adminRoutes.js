const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireRole('admin'));

// Departments
router.get('/departments', adminController.getAllDepartments);
router.post('/departments', adminController.addDepartment);

// Courses
router.get('/courses', adminController.getAllCourses);
router.post('/courses', adminController.addCourse);

// Users
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.addUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/users/:id/department', adminController.updateUserDepartment);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;