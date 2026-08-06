const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ==========================================
// GMAIL TRANSPORTER SETUP
// ==========================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ==========================================
// 1. REGISTER
// ==========================================
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, matric_number, staff_id, department_id } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null]
    );
    res.status(201).json({ success: true, message: 'User registered successfully.', userId: result.insertId });
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ==========================================
// 2. LOGIN
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
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
    const { password_hash, ...userWithoutSensitive } = user;
    res.status(200).json({ success: true, message: 'Login successful', token, user: userWithoutSensitive });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ==========================================
// 3. FORGOT PASSWORD (GMAIL)
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // Security best practice: Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }
    
    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'https://unicross-material-platform.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // ✅ SEND EMAIL VIA GMAIL
    await transporter.sendMail({
      from: `"UNICROSS Platform" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.full_name},</p>
          <p>We received a request to reset your password for your UNICROSS Material Sharing account.</p>
          <p>Please click the button below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
          <p style="color: #999; font-size: 12px;">Or copy and paste this link into your browser:<br/>${resetUrl}</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent to your email.' });
  } catch (error) {
    console.error('❌ FORGOT PASSWORD ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to process request. Please try again later.' });
  }
};

// ==========================================
// 4. RESET PASSWORD
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [resetTokenHash, new Date()]
    );
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    const user = users[0];
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [password_hash, user.id]
    );
    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

// ==========================================
// 5. CHANGE PASSWORD
// ==========================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
};

// ==========================================
// 6. UPDATE PROFILE IMAGE
// ==========================================
const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const profileImage = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [profileImage, userId]);
    res.status(200).json({ success: true, message: 'Profile image updated successfully', profileImage });
  } catch (error) {
    console.error('❌ Update Profile Image Error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile image update' });
  }
};

// ==========================================
// 7. VERIFY EMAIL
// ==========================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }
    const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [users] = await pool.query(
      'SELECT * FROM users WHERE verification_token = ? AND verification_token_expiry > ?',
      [verificationTokenHash, new Date()]
    );
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    const user = users[0];
    await pool.query(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expiry = NULL WHERE id = ?',
      [user.id]
    );
    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('❌ Verify Email Error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

// ==========================================
// 8. GET CURRENT USER (ME)
// ==========================================
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.matric_number, u.staff_id, u.profile_image, u.is_active, u.email_verified, u.department_id, d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: users[0] });
  } catch (error) {
    console.error('❌ Get Me Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// 9. UPDATE PROFILE (NAME ONLY)
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;
    const userId = req.user.id;
    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name.trim(), userId]);
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfileImage,
  verifyEmail,
  getMe,
  updateProfile
};