const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply verifyToken to ALL admin routes
router.use(verifyToken);

// Users
router.get('/users', adminController.getAllUsers);
router.post('/users', verifyAdmin, adminController.addUser); // ✅ ADDED THIS LINE
router.patch('/users/:id/status', verifyAdmin, adminController.toggleUserStatus);
router.patch('/users/:id/department', verifyAdmin, adminController.updateUserDepartment);

// Departments
router.get('/departments', adminController.getAllDepartments);
router.post('/departments', verifyAdmin, adminController.addDepartment);
router.delete('/departments/:id', verifyAdmin, adminController.deleteDepartment);

// Courses
router.get('/courses', adminController.getAllCourses);
router.post('/courses', verifyAdmin, adminController.addCourse);
router.delete('/courses/:id', verifyAdmin, adminController.deleteCourse);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;