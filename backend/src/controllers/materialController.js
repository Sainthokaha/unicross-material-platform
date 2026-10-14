const db = require('../config/db');
const path = require('path');
const { logAction } = require('../utils/auditLogger');
// UPLOAD MATERIAL
const uploadMaterial = async (req, res) => {
  try {
    console.log('📥 Upload Request Body:', req.body);
    console.log('📥 Upload Request File:', req.file);
    console.log('📥 Upload Request User:', req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user token found' });
    }

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
      return res.status(400).json({ success: false, message: `Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX, PPT, PPTX allowed` });
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

    const [result] = await db.query(
      `INSERT INTO materials (title, description, file_path, original_name, uploader_id, department_id, course_id, semester, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [title, description || null, file_path, original_name, uploader_id, department_id, course_id, semester]
    );

    await logAction(uploader_id, 'MATERIAL_UPLOAD', 'materials', result.insertId, `Material uploaded: ${title}`, req);

    res.status(201).json({ 
      success: true, 
      message: 'Material uploaded successfully and pending approval', 
      materialId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Upload Material CRASH:', error.message);
    console.error('Full Error Details:', error);
    res.status(500).json({ success: false, message: 'Server error during material upload' });
  }
};

// GET MATERIALS (Matches your materialRoutes.js import)
const getMaterials = async (req, res) => {
  try {
    const { course_id, department_id, semester, search } = req.query;
    
    let query = `
      SELECT m.*, u.full_name as uploader_name, c.name as course_name, c.code as course_code, d.name as department_name
      FROM materials m
      JOIN users u ON m.uploader_id = u.id
      JOIN courses c ON m.course_id = c.id
      JOIN departments d ON m.department_id = d.id
      WHERE m.status = 'approved'
    `;

    const params = [];

    if (course_id) {
      query += ' AND m.course_id = ?';
      params.push(course_id);
    }

    if (department_id) {
      query += ' AND m.department_id = ?';
      params.push(department_id);
    }

    if (semester) {
      query += ' AND m.semester = ?';
      params.push(semester);
    }

    if (search) {
      query += ' AND (m.title LIKE ? OR m.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY m.created_at DESC';

    const [materials] = await db.query(query, params);

    res.status(200).json({ success: true, materials });
  } catch (error) {
    console.error('❌ Get Materials Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching materials' });
  }
};

// APPROVE MATERIAL (Admin)
const approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [result] = await db.query(
      'UPDATE materials SET status = ?, rejection_reason = ? WHERE id = ?',
      [status, rejection_reason || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await logAction(req.user.id, 'MATERIAL_APPROVAL', 'materials', id, `Material ${status}: ID ${id}`, req);

    res.status(200).json({ success: true, message: `Material ${status} successfully` });
  } catch (error) {
    console.error('❌ Approve Material Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating material status' });
  }
};

// REJECT MATERIAL (Admin)
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

    await logAction(req.user.id, 'MATERIAL_REJECTION', 'materials', id, `Material rejected: ID ${id}`, req);

    res.status(200).json({ success: true, message: 'Material rejected successfully' });
  } catch (error) {
    console.error('❌ Reject Material Error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting material' });
  }
};

// DOWNLOAD MATERIAL (New Function with Safety Checks)
const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user token found' });
    }
    const userId = req.user.id;

    // 2. Find material and verify it is approved
    const [materials] = await db.query(
      'SELECT * FROM materials WHERE id = ? AND status = ?', 
      [id, 'approved']
    );

    if (materials.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found or not approved for download' });
    }

    const material = materials[0];
    
    // 3. Safely resolve file path
    if (!material.file_path) {
      console.error(`❌ CRITICAL: Material ${id} has no file_path in database`);
      return res.status(500).json({ success: false, message: 'File path is missing in database' });
    }

    const fileName = material.file_path.split('/').pop(); 
    const filePath = path.join(__dirname, '../../uploads', fileName);

    // 4. Increment download count automatically
    await db.query(
      'UPDATE materials SET download_count = download_count + 1 WHERE id = ?', 
      [id]
    );

    // 5. Log the download action in audit_logs
    await logAction(userId, 'MATERIAL_DOWNLOAD', 'materials', id, `Downloaded: ${material.original_name}`, req);

    // 6. Send the file to the client
    res.download(filePath, material.original_name, (err) => {
      if (err) {
        console.error(`❌ File download error for path ${filePath}:`, err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'File not found on server or download failed' });
        }
      }
    });

  } catch (error) {
    console.error('❌ Download Material CRASH (ID:', req.params.id, '):', error.message);
    console.error('Full Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error during download' });
    }
  }
};

// EXPORT ALL FUNCTIONS
module.exports = { 
  uploadMaterial, 
  getMaterials, 
  approveMaterial, 
  rejectMaterial, 
  downloadMaterial 
};