const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { logAction } = require('../utils/auditLogger');

const uploadMaterial = async (req, res) => {
  try {
    const { title, description, course_id, semester } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    if (!title || !course_id || !semester) return res.status(400).json({ success: false, message: 'Title, course, and semester are required' });
    const uploaded_by = req.user.id;
    const file_path = req.file.filename;
    const original_name = req.file.originalname;
    const [result] = await pool.query(
      `INSERT INTO materials (title, description, course_id, semester, file_path, original_name, uploaded_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [title, description || '', course_id, semester, file_path, original_name, uploaded_by]
    );
    await logAction(uploaded_by, 'MATERIAL_UPLOAD', 'materials', result.insertId, `Uploaded: ${title}`, req);
    res.status(201).json({ success: true, message: 'Material uploaded successfully', id: result.insertId });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload material: ' + err.message });
  }
};

const getMaterials = async (req, res) => {
  try {
    let query = `SELECT m.*, c.name as course_name, c.department_id, d.name as department_name, u.full_name as uploader_name FROM materials m JOIN courses c ON m.course_id = c.id LEFT JOIN departments d ON c.department_id = d.id JOIN users u ON m.uploaded_by = u.id`;
    const params = [];
    const conditions = [];

    if (req.user.role === 'lecturer') { 
      conditions.push('m.uploaded_by = ?'); 
      params.push(req.user.id); 
    } 
    else if (req.user.role === 'student') { 
      conditions.push("m.status = 'approved'"); 
      
      // ✅ CRITICAL FIX: Fetch fresh department_id from DB to bypass stale JWT token
      const [studentData] = await pool.query('SELECT department_id FROM users WHERE id = ?', [req.user.id]);
      const studentDeptId = studentData[0]?.department_id;

      if (studentDeptId) {
        conditions.push('c.department_id = ?');
        params.push(studentDeptId);
      } else {
        // If student has no department assigned, safely return empty array
        conditions.push('1 = 0'); 
      }
    }

    let whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    const dataQuery = `${query} ${whereClause} ORDER BY m.created_at DESC`;
    const [materials] = await pool.query(dataQuery, params);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const formatted = materials.map(m => ({ ...m, file_url: `${baseUrl}/uploads/${m.file_path}` }));
    res.json({ success: true, materials: formatted });
  } catch (err) {
    console.error('Fetch materials error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
};

const approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("UPDATE materials SET status = 'approved' WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Material not found' });
    await logAction(req.user.id, 'MATERIAL_APPROVE', 'materials', id, 'Material approved', req);
    res.json({ success: true, message: 'Material approved successfully' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve material' });
  }
};

const rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    const [result] = await pool.query("UPDATE materials SET status = 'rejected', rejection_reason = ? WHERE id = ?", [reason, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Material not found' });
    await logAction(req.user.id, 'MATERIAL_REJECT', 'materials', id, `Rejected: ${reason}`, req);
    res.json({ success: true, message: 'Material rejected successfully' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ success: false, message: 'Failed to reject material' });
  }
};

const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const [materials] = await pool.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (materials.length === 0) return res.status(404).json({ success: false, message: 'Material not found' });
    const material = materials[0];
    const filePath = path.join(__dirname, '../../uploads', material.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });
    await pool.query('UPDATE materials SET download_count = download_count + 1 WHERE id = ?', [id]);
    await logAction(req.user.id, 'MATERIAL_DOWNLOAD', 'materials', id, `Downloaded: ${material.title}`, req);
    res.download(filePath, material.original_name);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, message: 'Failed to download material' });
  }
};

module.exports = { uploadMaterial, getMaterials, approveMaterial, rejectMaterial, downloadMaterial };