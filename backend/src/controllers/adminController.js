const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAction } = require('../utils/auditLogger');

// 🛡️ HELPER: Check if user is the protected System Administrator
const isSystemAdmin = (user) => {
  return user && user.full_name && user.full_name.toLowerCase().trim() === 'system administrator';
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`SELECT u.id, u.full_name, u.email, u.role, u.matric_number, u.staff_id, u.is_active, u.department_id, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id ORDER BY u.created_at DESC`);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addUser = async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, staff_id, department_id } = req.body;
    if (!full_name || !email || !password || !role) return res.status(400).json({ success: false, message: 'Full name, email, password, and role are required' });
    const validRoles = ['student', 'lecturer', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email already exists' });
    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(`INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`, [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null]);
    await logAction(req.user.id, 'USER_CREATE', 'users', result.insertId, `Created new user: ${full_name} (${role})`, req);
    res.status(201).json({ success: true, message: 'User created successfully', id: result.insertId });
  } catch (error) {
    console.error('❌ Error adding user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    // 🛡️ PROTECTION CHECK
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (isSystemAdmin(users[0])) return res.status(403).json({ success: false, message: 'Access Denied: The System Administrator account cannot be deactivated.' });

    const statusValue = is_active ? 1 : 0;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [statusValue, id]);
    const actionType = statusValue === 1 ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    await logAction(req.user.id, actionType, 'users', id, `User status changed`, req);
    res.status(200).json({ success: true, message: `User ${statusValue === 1 ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('❌ Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    let { department_id } = req.body;
    department_id = department_id ? parseInt(department_id, 10) : null;
    
    // 🛡️ PROTECTION CHECK
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (isSystemAdmin(users[0])) return res.status(403).json({ success: false, message: 'Access Denied: The System Administrator department cannot be altered.' });

    const user = users[0];
    let newMatric = user.matric_number;
    if (user.role === 'student' && department_id) {
      const [depts] = await db.query('SELECT code FROM departments WHERE id = ?', [department_id]);
      if (depts.length > 0) {
        const deptCode = depts[0].code;
        let studentNum = '001';
        if (user.matric_number) {
          const parts = user.matric_number.split('/');
          const lastPart = parts[parts.length - 1];
          if (/^\d+$/.test(lastPart)) studentNum = lastPart.padStart(3, '0');
        }
        newMatric = `24/${deptCode}/${studentNum}`;
      }
    } else if (user.role !== 'student') { newMatric = null; }
    await db.query('UPDATE users SET department_id = ?, matric_number = ? WHERE id = ?', [department_id, newMatric, id]);
    await logAction(req.user.id, 'USER_DEPT_UPDATE', 'users', id, `Department updated`, req);
    res.status(200).json({ success: true, message: 'User updated successfully', newMatric });
  } catch (error) {
    console.error(' Error updating user department:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, matric_number, staff_id } = req.body;
    const validRoles = ['student', 'lecturer', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    
    // 🛡️ PROTECTION CHECK
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    if (isSystemAdmin(users[0])) return res.status(403).json({ success: false, message: 'Access Denied: The System Administrator role cannot be altered.' });

    let finalMatric = null; let finalStaffId = null;
    if (role === 'student') { finalStaffId = null; finalMatric = matric_number || null; } 
    else { finalMatric = null; finalStaffId = staff_id || null; }
    await db.query('UPDATE users SET role = ?, matric_number = ?, staff_id = ? WHERE id = ?', [role, finalMatric, finalStaffId, id]);
    await logAction(req.user.id, 'USER_ROLE_UPDATE', 'users', id, `Changed role to ${role}`, req);
    res.status(200).json({ success: true, message: 'User role and identifiers updated successfully' });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ success: true, data: departments });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required' });
    const [existing] = await db.query('SELECT id FROM departments WHERE code = ?', [code]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Department code already exists' });
    const [result] = await db.query('INSERT INTO departments (name, code) VALUES (?, ?)', [name, code]);
    await logAction(req.user.id, 'DEPT_CREATE', 'departments', result.insertId, `Added department: ${name}`, req);
    res.status(201).json({ success: true, message: 'Department added successfully', id: result.insertId });
  } catch (error) { console.error('❌ Error adding department:', error); res.status(500).json({ success: false, message: error.message }); }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM departments WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getAllCourses = async (req, res) => {
  try {
    const [courses] = await db.query(`SELECT c.*, d.name as department_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id ORDER BY c.name ASC`);
    res.status(200).json({ success: true, data: courses });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const addCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) return res.status(400).json({ success: false, message: 'Name, code, and department are required' });
    const [existing] = await db.query('SELECT id FROM courses WHERE code = ?', [code]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Course code already exists' });
    const [result] = await db.query('INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)', [name, code, department_id]);
    await logAction(req.user.id, 'COURSE_CREATE', 'courses', result.insertId, `Added course: ${name}`, req);
    res.status(201).json({ success: true, message: 'Course added successfully', id: result.insertId });
  } catch (error) { console.error('❌ Error adding course:', error); res.status(500).json({ success: false, message: error.message }); }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Course not found' });
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Server error' }); }
};

const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`SELECT al.*, u.full_name, u.email FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 100`);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllUsers, addUser, toggleUserStatus, updateUserDepartment, updateUserRole,
  getAllDepartments, addDepartment, deleteDepartment,
  getAllCourses, addCourse, deleteCourse,
  getAuditLogs
};