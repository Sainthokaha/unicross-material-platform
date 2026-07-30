const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// ==========================================
// 1. UPLOAD MATERIAL
// ==========================================
const uploadMaterial = async (req, res) => {
  try {
    const { title, description, course_id, semester } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!title || !course_id || !semester) {
      return res.status(400).json({ success: false, message: 'Title, course, and semester are required' });
    }

    const uploaded_by = req.user.id;
    const file_path = req.file.filename;
    const original_name = req.file.originalname;

    const [result] = await pool.query(
      `INSERT INTO materials (title, description, course_id, semester, file_path, original_name, uploaded_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [title, description || '', course_id, semester, file_path, original_name, uploaded_by]
    );

    // Optional: Audit log (wrapped in try/catch so it doesn't fail the upload if the log table is missing)
    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [uploaded_by, 'MATERIAL_UPLOAD', 'materials', result.insertId, `Uploaded: ${title}`]
      );
    } catch (logErr) {
      console.error('Audit log error:', logErr); 
    }

    res.status(201).json({ 
      success: true, 
      message: 'Material uploaded successfully and pending approval', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload material: ' + err.message });
  }
};

// ==========================================
// 2. GET MATERIALS
// ==========================================
const getMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Increased default limit for admin view
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.*, c.name as course_name, c.department_id, d.name as department_name, u.full_name as uploader_name
      FROM materials m
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN departments d ON c.department_id = d.id
      JOIN users u ON m.uploaded_by = u.id
    `;
    
    const params = [];
    const conditions = [];

    // Role-based filtering
    if (req.user.role === 'lecturer') {
      conditions.push('m.uploaded_by = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'student') {
      conditions.push("m.status = 'approved'");
      if (req.user.department_id) {
        conditions.push('c.department_id = ?');
        params.push(req.user.department_id);
      } else {
        conditions.push('c.department_id = -1'); 
      }
    }

    // Search and filter params
    const { search, course_id, semester, date_from, date_to } = req.query;

    if (search) {
      conditions.push('(m.title LIKE ? OR m.description LIKE ? OR c.name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (course_id) { conditions.push('m.course_id = ?'); params.push(course_id); }
    if (semester) { conditions.push('m.semester = ?'); params.push(semester); }
    if (date_from) { conditions.push('DATE(m.created_at) >= ?'); params.push(date_from); }
    if (date_to) { conditions.push('DATE(m.created_at) <= ?'); params.push(date_to); }

    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = ' WHERE ' + conditions.join(' AND ');
    }

    const countQuery = `SELECT COUNT(*) as total FROM materials m 
                        JOIN courses c ON m.course_id = c.id 
                        LEFT JOIN departments d ON c.department_id = d.id
                        JOIN users u ON m.uploaded_by = u.id ${whereClause}`;
    const [countResult] = await pool.query(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    const dataQuery = `${query} ${whereClause} ORDER BY m.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [materials] = await pool.query(dataQuery, params);

    // Format file URL for frontend
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formatted = materials.map(m => ({ 
      ...m, 
      file_url: `${baseUrl}/uploads/${m.file_path}` 
    }));
    
    res.json({
      success: true,
      materials: formatted,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        limit: limit
      }
    });

  } catch (err) {
    console.error('Fetch materials error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch materials: ' + err.message });
  }
};

// ==========================================
// 3. APPROVE MATERIAL
// ==========================================
const approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("UPDATE materials SET status = 'approved' WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'MATERIAL_APPROVE', 'materials', id, 'Material approved by admin']
      );
    } catch (logErr) {
      console.error('Audit log error:', logErr);
    }

    res.json({ success: true, message: 'Material approved successfully' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve material' });
  }
};

// ==========================================
// 4. REJECT MATERIAL
// ==========================================
const rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const [result] = await pool.query(
      "UPDATE materials SET status = 'rejected', rejection_reason = ? WHERE id = ?", 
      [reason, id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'MATERIAL_REJECT', 'materials', id, `Rejected: ${reason}`]
      );
    } catch (logErr) {
      console.error('Audit log error:', logErr);
    }

    res.json({ success: true, message: 'Material rejected successfully' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ success: false, message: 'Failed to reject material' });
  }
};

// ==========================================
// 5. DOWNLOAD MATERIAL
// ==========================================
const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    
    if (materials.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });

    const material = materials[0];
    const filePath = path.join(__dirname, '../../uploads', material.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    await pool.query('UPDATE materials SET download_count = download_count + 1 WHERE id = ?', [id]);

    try {
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'MATERIAL_DOWNLOAD', 'materials', id, `Downloaded: ${material.title}`]
      );
    } catch (logErr) {
      console.error('Audit log error:', logErr);
    }

    res.download(filePath, material.original_name);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Failed to download material' });
  }
};

// ==========================================
// 6. GET CATEGORIES
// ==========================================
const getCategories = async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    const [courses] = await pool.query('SELECT * FROM courses ORDER BY name ASC');
    res.json({ success: true, departments, courses });
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

module.exports = { 
  uploadMaterial, 
  getMaterials, 
  approveMaterial, 
  rejectMaterial, 
  downloadMaterial,
  getCategories 
};