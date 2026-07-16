const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Helper function to create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, staff_id, department_id } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, verification_token, verification_token_expiry, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null, verificationTokenHash, verificationTokenExpiry]
    );

    res.status(201).json({ success: true, message: 'User registered successfully.', userId: result.insertId });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password_hash, verification_token, reset_password_token, ...userWithoutSensitive } = user;
    res.status(200).json({ success: true, message: 'Login successful', token, user: userWithoutSensitive });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ==================== FORGOT PASSWORD ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`📩 Password reset requested for: ${email}`);

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(200).json({ success: true, message: 'If that email exists in our system, a reset link has been sent.' });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // ✅ CRITICAL FIX: Uses live frontend URL from environment variables
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"UNICROSS Material Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
      `,
    });

    console.log('✅ Reset email sent successfully!');
    res.status(200).json({ success: true, message: 'If that email exists in our system, a reset link has been sent.' });
  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR DETAILS:', error); 
    res.status(500).json({ success: false, message: 'Server error while processing password reset.' });
  }
};

// ==================== RESET PASSWORD ====================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [resetTokenHash, new Date()]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = users[0];
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [password_hash, user.id]
    );

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// ==================== CHANGE PASSWORD (Added to fix your routes) ====================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
};

// ==================== UPDATE PROFILE IMAGE (Added to fix your routes) ====================
exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Normalize path for URL (converts Windows \ to /)
    const profileImage = req.file.path.replace(/\\/g, '/');
    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [profileImage, userId]);

    res.status(200).json({ success: true, message: 'Profile image updated successfully', profileImage });
  } catch (error) {
    console.error('❌ Update Profile Image Error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile image update' });
  }
};

// ==================== GET CURRENT USER ====================
exports.getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.matric_number, u.staff_id, u.profile_image, u.is_active, u.email_verified, d.name as department_name 
       FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?`, 
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    console.error('❌ Get Me Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};