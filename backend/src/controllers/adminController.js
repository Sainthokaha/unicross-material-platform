const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// ==========================================
// GET USERS
// ==========================================
const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, matric_number, staff_id, is_active, department_id FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ==========================================
// CREATE USER (Updated with Department & IDs)
// ==========================================
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, staff_id, department_id } = req.body;
    
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const is_active = role === 'lecturer' ? 0 : 1;

    // ✅ UPDATED: Include department_id in the insert query
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null, is_active]
    );

    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

// ==========================================
// TOGGLE USER STATUS
// ==========================================
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query('SELECT is_active FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const newStatus = users[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);
    
    res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    console.error('Toggle status error:', err);
    res.status(500).json({ message: 'Failed to toggle user status' });
  }
};

// ==========================================
// GET AUDIT LOGS
// ==========================================
const getAuditLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(`
      SELECT al.*, u.full_name as user_name, u.email 
      FROM audit_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC LIMIT 100
    `);
    res.json(logs);
  } catch (err) {
    console.error('Fetch logs error:', err);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
};

// ==========================================
// GET CATEGORIES
// ==========================================
const getCategories = async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    const [courses] = await pool.query('SELECT * FROM courses ORDER BY name ASC');
    res.json({ departments, courses });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// ==========================================
// ADD DEPARTMENT
// ==========================================
const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const [result] = await pool.query('INSERT INTO departments (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Department added successfully', id: result.insertId });
  } catch (err) {
    console.error('Add department error:', err);
    res.status(500).json({ message: 'Failed to add department' });
  }
};

// ==========================================
// ADD COURSE
// ==========================================
const addCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) {
      return res.status(400).json({ message: 'All course fields are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)', 
      [name, code, department_id]
    );
    res.status(201).json({ message: 'Course added successfully', id: result.insertId });
  } catch (err) {
    console.error('Add course error:', err);
    res.status(500).json({ message: 'Failed to add course' });
  }
};

// ==========================================
// DELETE COURSE
// ==========================================
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
};

// ==========================================
// DELETE DEPARTMENT
// ==========================================
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [courses] = await pool.query('SELECT id FROM courses WHERE department_id = ?', [id]);
    if (courses.length > 0) {
      return res.status(400).json({ message: 'Cannot delete department. Please delete or reassign its courses first.' });
    }

    await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Delete department error:', err);
    res.status(500).json({ message: 'Failed to delete department' });
  }
};

// ==========================================
// UPDATE USER DEPARTMENT
// ==========================================
const updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    let { department_id } = req.body;
    
    if (department_id === '' || department_id === undefined) {
      department_id = null;
    }

    await pool.query('UPDATE users SET department_id = ? WHERE id = ?', [department_id, id]);
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('Update department error:', err);
    res.status(500).json({ message: 'Failed to update department' });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = { 
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
};