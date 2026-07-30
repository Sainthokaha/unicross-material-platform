const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ==================== USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`SELECT u.id, u.full_name, u.email, u.role, u.matric_number, u.staff_id, u.is_active, u.department_id, d.name as department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id ORDER BY u.created_at DESC`);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const statusValue = is_active ? 1 : 0;
    const [result] = await db.query('UPDATE users SET is_active = ? WHERE id = ?', [statusValue, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: `User ${statusValue === 1 ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('❌ Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    let { department_id } = req.body;
    department_id = department_id ? parseInt(department_id, 10) : null;

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
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
    } else if (user.role !== 'student') {
      newMatric = null;
    }

    await db.query('UPDATE users SET department_id = ?, matric_number = ? WHERE id = ?', [department_id, newMatric, id]);
    res.status(200).json({ success: true, message: 'User updated successfully', newMatric });
  } catch (error) {
    console.error('❌ Error updating user department:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== DEPARTMENTS & COURSES ====================
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const [courses] = await db.query(`SELECT c.*, d.name as department_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id ORDER BY c.name ASC`);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== AUDIT LOGS ====================
exports.getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT al.*, u.full_name, u.email 
      FROM audit_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC 
      LIMIT 100
    `);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('❌ Error fetching audit logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};