const db = require('../config/db');
const bcrypt = require('bcryptjs');

// --- DEPARTMENTS ---
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required' });
    
    const [result] = await db.query('INSERT INTO departments (name, code) VALUES (?, ?)', [name, code]);
    res.status(201).json({ success: true, message: 'Department added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding department:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- COURSES ---
exports.getAllCourses = async (req, res) => {
  try {
    const [courses] = await db.query(`
      SELECT c.*, d.name as department_name 
      FROM courses c 
      LEFT JOIN departments d ON c.department_id = d.id 
      ORDER BY c.name ASC
    `);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    if (!name || !code || !department_id) {
      return res.status(400).json({ success: false, message: 'Name, code, and department are required' });
    }
    
    const [result] = await db.query('INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)', [name, code, department_id]);
    res.status(201).json({ success: true, message: 'Course added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- USERS ---
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, full_name, email, role, matric_number, staff_id, is_active, email_verified, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, staff_id, department_id } = req.body;
    
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if email exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null]
    );
    
    res.status(201).json({ success: true, message: 'User created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};