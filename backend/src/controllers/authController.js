const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const config = require('../config');

// ==========================================
// EMAIL TRANSPORTER SETUP (Nodemailer)
// ==========================================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================================
// 1. REGISTER (With Smart Department Alignment)
// ==========================================
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, staff_id } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!['student', 'lecturer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered. Please login or use a different email.' });
    }

    let department_id = null;
    if (matric_number && role === 'student') {
      const parts = matric_number.split(/[\/\-]/); 
      for (let part of parts) {
        const cleanPart = part.trim().toUpperCase();
        if (/^[A-Z]{2,5}$/.test(cleanPart)) {
          const [depts] = await pool.query('SELECT id, name, code FROM departments WHERE UPPER(code) = ?', [cleanPart]);
          if (depts.length > 0) {
            department_id = depts[0].id;
            break; 
          }
        }
      }
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const is_active = role === 'lecturer' ? 0 : 1;
    
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null, is_active]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'USER_REGISTER', 'users', result.insertId, `New ${role} registered: ${email}`]
    );

    res.status(201).json({
      message: role === 'lecturer' 
        ? 'Registration successful. Your account is pending admin approval.' 
        : 'Registration successful. You can now login.',
      userId: result.insertId
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// ==========================================
// 2. LOGIN
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await pool.query(`
      SELECT u.*, d.name as department_name 
      FROM users u 
      LEFT JOIN departments d ON u.department_id = d.id 
      WHERE u.email = ?
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account has been deactivated. Please contact admin.' });
    }

    if (user.role === 'lecturer' && user.is_active === 0) {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait for activation.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        department_id: user.department_id 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [user.id, 'USER_LOGIN', `User logged in`, req.ip]
    );

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        name: user.full_name, 
        email: user.email, 
        role: user.role,
        department_id: user.department_id,
        department_name: user.department_name,
        matric_number: user.matric_number,
        staff_id: user.staff_id,
        profile_image: user.profile_image
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ==========================================
// 3. FORGOT PASSWORD (Sends Real Email)
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);

    // Always return success message to prevent email enumeration attacks
    if (users.length === 0) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const user = users[0];

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before saving to DB for security
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token and expiry (1 hour from now) to database
    await pool.query(
      "UPDATE users SET reset_password_token = ?, reset_password_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
      [hashedToken, user.id]
    );

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: `"UNICROSS Material Sharing" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
          <h2 style="color: #1e3a8a;">Password Reset Request</h2>
          <p>Hello ${user.full_name},</p>
          <p>We received a request to reset your password for your UNICROSS Material Sharing account.</p>
          <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'PASSWORD_RESET_REQUEST', `Password reset email sent to ${email}`]
    );

    res.json({ message: 'If an account exists, a reset link has been sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    // Clear the token in case of email failure so it doesn't stay in DB
    await pool.query("UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE email = ?", [req.body.email]);
    res.status(500).json({ message: 'Failed to process request. Please try again later.' });
  }
};

// ==========================================
// 4. RESET PASSWORD (Verifies Token)
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Hash the token from the URL to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token and non-expired time
    const [users] = await pool.query(
      "SELECT id, full_name FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()",
      [hashedToken]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const user = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear the reset token
    await pool.query(
      "UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?",
      [password_hash, user.id]
    );

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [user.id, 'PASSWORD_RESET_SUCCESS', `Password successfully reset for user ID ${user.id}`]
    );

    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// ==========================================
// 5. CHANGE PASSWORD (Logged in user)
// ==========================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId, 'PASSWORD_CHANGE', 'User successfully changed their password']
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// ==========================================
// 6. UPDATE PROFILE IMAGE
// ==========================================
const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const imagePath = req.file.filename;

    await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [imagePath, userId]);

    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId, 'PROFILE_IMAGE_UPDATE', 'User updated their profile picture']
    );

    res.json({ 
      message: 'Profile image updated successfully', 
      filename: imagePath 
    });
  } catch (err) {
    console.error('Update profile image error:', err);
    res.status(500).json({ message: 'Failed to update profile image' });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  changePassword,
  updateProfileImage 
};