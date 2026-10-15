const db = require('../config/db');
const path = require('path');
const { logAction } = require('../utils/auditLogger');

// 1. UPLOAD MATERIAL (Always sets status to 'pending')
const uploadMaterial = async (req, res) => {
  try {
    const { title, description, course_id, semester } = req.body;
    const uploader_id = req.user.id;

    if (!title || !course_id || !semester || !req.file) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields and file' });
    }

    const file = req.file;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX allowed' });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ success: false, message: 'File size must not exceed 50MB' });
    }

    const [courseResults] = await db.query('SELECT department_id FROM courses WHERE id = ?', [course_id]);
    if (courseResults.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const department_id = courseResults[0].department_id;
    const file_path = `/uploads/${file.filename}`;
    const original_name = file.originalname;

    // INSERT WITH STATUS 'PENDING'
    const [result] = await db.query(
      `INSERT INTO materials (title, description, file_path, original_name, uploader_id, department_id, course_id, semester, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [title, description || null, file_path, original_name, uploader_id, department_id, course_id, semester]
    );

    await logAction(uploader_id, 'MATERIAL_UPLOAD', 'materials', result.insertId, `Material uploaded: ${title}`, req);

    res.status(201).json({ 
      success: true, 
      message: 'Material uploaded successfully and is pending admin approval', 
      materialId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Upload Material Error:', error);
    res.status(500).json({ success: false, message: 'Server error during material upload' });
  }
};

// 2. GET MATERIALS (STRICT ROLE-BASED VISIBILITY)
const getMaterials = async (req, res) => {
  try {
    const { status, course_id, semester, search } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let query = `
      SELECT m.*, u.full_name as uploader_name, c.name as course_name, c.code as course_code, d.name as department_name
      FROM materials m
      LEFT JOIN users u ON m.uploader_id = u.id
      LEFT JOIN courses c ON m.course_id = c.id
      LEFT JOIN departments d ON m.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    // 🛡️ STRICT ROLE LOGIC (NO EXCEPTIONS)
    if (userRole === 'student') {
      // 1. Students ONLY see approved materials
      query += " AND m.status = 'approved'";
      
      // 2. Students ONLY see their own department (Fetched securely from DB)
      const [userDept] = await db.query('SELECT department_id FROM users WHERE id = ?', [userId]);
      if (userDept.length > 0 && userDept[0].department_id) {
        query += ' AND m.department_id = ?';
        params.push(userDept[0].department_id);
      } else {
        // If student has no department assigned, show nothing
        query += ' AND 1=0'; 
      }
    } 
    else if (userRole === 'lecturer') {
      // Lecturers ONLY see their own uploads (All statuses)
      query += ' AND m.uploader_id = ?';
      params.push(userId);
    }
    // Admin sees everything (no extra filter added)

    // Apply explicit status filter (Mainly for Admin)
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    if (course_id) {
      query += ' AND m.course_id = ?';
      params.push(course_id);
    }
    if (semester) {
      query += ' AND m.semester = ?';
      params.push(semester);
    }
    if (search) {
      query += ' AND (m.title LIKE ? OR m.description LIKE ? OR c.code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY m.created_at DESC';
    const [materials] = await db.query(query, params);
    res.status(200).json({ success: true, materials });
  } catch (error) {
    console.error('❌ Get Materials Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching materials' });
  }
};

// 3. APPROVE MATERIAL (Admin Only)
const approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      'UPDATE materials SET status = ?, rejection_reason = NULL WHERE id = ?',
      ['approved', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await logAction(req.user.id, 'MATERIAL_APPROVED', 'materials', id, `Material approved: ID ${id}`, req);
    res.status(200).json({ success: true, message: 'Material approved successfully' });
  } catch (error) {
    console.error('❌ Approve Material Error:', error);
    res.status(500).json({ success: false, message: 'Server error approving material' });
  }
};

// 4. REJECT MATERIAL (Admin Only)
const rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    const [result] = await db.query(
      'UPDATE materials SET status = ?, rejection_reason = ? WHERE id = ?',
      ['rejected', rejection_reason || 'No reason provided', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await logAction(req.user.id, 'MATERIAL_REJECTED', 'materials', id, `Material rejected: ID ${id}`, req);
    res.status(200).json({ success: true, message: 'Material rejected successfully' });
  } catch (error) {
    console.error('❌ Reject Material Error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting material' });
  }
};

// 5. DOWNLOAD MATERIAL
const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const [materials] = await db.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (materials.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const material = materials[0];

    // Security Check: Who can download?
    if (userRole === 'student') {
      if (material.status !== 'approved') {
        return res.status(403).json({ success: false, message: 'Material not approved for download' });
      }
      // Optional: Strict department check for students
      // const [u] = await db.query('SELECT department_id FROM users WHERE id = ?', [userId]);
      // if(u[0].department_id !== material.department_id) return res.status(403)...
    } else if (userRole === 'lecturer') {
      if (material.uploader_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only download your own uploads' });
      }
    }
    // Admin can download anything

    if (!material.file_path) {
      return res.status(500).json({ success: false, message: 'File path missing' });
    }

    const fileName = material.file_path.split('/').pop();
    const filePath = path.join(__dirname, '../../uploads', fileName);

    // Increment count
    await db.query('UPDATE materials SET download_count = download_count + 1 WHERE id = ?', [id]);
    await logAction(userId, 'MATERIAL_DOWNLOAD', 'materials', id, `Downloaded: ${material.original_name}`, req);

    res.download(filePath, material.original_name, (err) => {
      if (err) {
        console.error(`❌ File download error:`, err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Download failed' });
        }
      }
    });

  } catch (error) {
    console.error('❌ Download Material CRASH:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error during download' });
    }
  }
};

module.exports = { 
  uploadMaterial, 
  getMaterials, 
  approveMaterial, 
  rejectMaterial, 
  downloadMaterial 
};