const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ==================== DEPARTMENTS ====================

exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error('❌ Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and code are required' });
    }
    
    const [existing] = await db.query('SELECT id FROM departments WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }
    
    const [result] = await db.query(
      'INSERT INTO departments (name, code) VALUES (?, ?)', 
      [name, code]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Department added successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error adding department:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COURSES ====================

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
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { name, code, department_id } = req.body;
    
    if (!name || !code || !department_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, code, and department are required' 
      });
    }
    
    const [existing] = await db.query('SELECT id FROM courses WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    
    const [result] = await db.query(
      'INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)', 
      [name, code, department_id]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Course added successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error adding course:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== USERS ====================

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.full_name, 
        u.email, 
        u.role, 
        u.matric_number, 
        u.staff_id, 
        u.is_active, 
        u.email_verified, 
        u.created_at,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.created_at DESC
    `);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { 
      full_name, 
      email, 
      password, 
      role, 
      matric_number, 
      staff_id, 
      department_id 
    } = req.body;
    
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name, email, password, and role are required' 
      });
    }
    
    const validRoles = ['student', 'lecturer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be student, lecturer, or admin' 
      });
    }
    
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    const password_hash = await bcrypt.hash(password, 12);
    
    const [result] = await db.query(
      `INSERT INTO users (
        full_name, 
        email, 
        password_hash, 
        role, 
        matric_number, 
        staff_id, 
        department_id, 
        is_active, 
        email_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [
        full_name, 
        email, 
        password_hash, 
        role, 
        matric_number || null, 
        staff_id || null, 
        department_id || null
      ]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error adding user:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== AUDIT LOGS ====================

exports.getAuditLogs = async (req, res) => {
  try {
    const [logs] = await db.query(`
      SELECT 
        al.*, 
        u.full_name, 
        u.email 
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

// ==================== MATERIAL MANAGEMENT (Admin) ====================

exports.getAllMaterials = async (req, res) => {
  try {
    const [materials] = await db.query(`
      SELECT 
        m.*,
        c.name as course_name,
        c.code as course_code,
        u.full_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM materials m
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN users u ON m.uploaded_by = u.id
      ORDER BY m.created_at DESC
    `);
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error('❌ Error fetching materials:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      'UPDATE materials SET status = ? WHERE id = ?',
      ['approved', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.status(200).json({ success: true, message: 'Material approved successfully' });
  } catch (error) {
    console.error('❌ Error approving material:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }
    
    const [result] = await db.query(
      'UPDATE materials SET status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', rejection_reason, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.status(200).json({ success: true, message: 'Material rejected successfully' });
  } catch (error) {
    console.error('❌ Error rejecting material:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query('DELETE FROM materials WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== USER STATUS TOGGLE (BULLETPROOF) ====================
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // ✅ Validate input (handle undefined, null, or missing values)
    if (is_active === undefined || is_active === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status value (is_active) is required' 
      });
    }

    // ✅ Force it to be exactly 1 or 0 for MySQL
    const statusValue = is_active ? 1 : 0;

    const [result] = await db.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [statusValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: `User ${statusValue === 1 ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('❌ Error toggling user status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UPDATE USER DEPARTMENT ====================
exports.updateUserDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    let { department_id } = req.body;

    // Cast to Integer
    if (department_id === "" || department_id === null || department_id === undefined) {
      department_id = null;
    } else {
      department_id = parseInt(department_id, 10);
    }

    // Get current user data
    const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fix Matric Number Format: YEAR/DEPTCODE/NUMBER (e.g., 24/CSC/001)
    let matricNumber = user[0].matric_number;
    
    if (user[0].role === 'student' && department_id) {
      // Get the department code
      const [dept] = await db.query('SELECT code FROM departments WHERE id = ?', [department_id]);
      if (dept.length > 0) {
        const deptCode = dept[0].code;
        
        // Extract the student number from existing matric (last part after /)
        let studentNumber = '001'; // Default
        let year = '24'; // Default to current year (2024)
        
        if (matricNumber) {
          const parts = matricNumber.split('/');
          
          // Find the numeric student number (usually the last part)
          for (let i = parts.length - 1; i >= 0; i--) {
            if (parts[i] && /^\d+$/.test(parts[i])) {
              studentNumber = parts[i].padStart(3, '0');
              break;
            }
          }
          
          // Check if first part is a valid year (2 or 4 digits)
          if (parts[0] && (/^\d{2}$/.test(parts[0]) || /^\d{4}$/.test(parts[0]))) {
            // Use last 2 digits if it's a 4-digit year
            year = parts[0].slice(-2);
          }
          // If first part is not a year, keep default '24'
        }

        // Construct correct format: 24/CSC/001
        matricNumber = `${year}/${deptCode}/${studentNumber}`;
      }
    } else if (user[0].role !== 'student') {
      matricNumber = null;
    }

    // Update the database
    const [result] = await db.query(
      'UPDATE users SET department_id = ?, matric_number = ? WHERE id = ?',
      [department_id, matricNumber, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User department updated successfully',
      newMatric: matricNumber
    });
  } catch (error) {
    console.error('❌ Error updating user department:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};