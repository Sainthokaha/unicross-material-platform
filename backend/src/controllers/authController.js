const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper function to create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
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

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert user into database
    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, matric_number, staff_id, department_id, verification_token, verification_token_expiry, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [full_name, email, password_hash, role, matric_number || null, staff_id || null, department_id || null, verificationTokenHash, verificationTokenExpiry]
    );

    // TODO: Send verification email here if needed (similar to forgotPassword)

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully. Please verify your email.',
      userId: result.insertId 
    });
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

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove sensitive data from response
    const { password_hash, verification_token, reset_password_token, ...userWithoutSensitive } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutSensitive
    });
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

    // 1. Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Security best practice: Don't reveal if the email exists or not
      return res.status(200).json({ success: true, message: 'If that email exists in our system, a reset link has been sent.' });
    }

    const user = users[0];

    // 2. Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. Save token to database
    await db.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // 4. Construct reset URL (✅ CRITICAL FIX: Uses live frontend URL)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // 5. Send Email via Nodemailer
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"UNICROSS Material Platform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested a password reset for your UNICROSS Material Sharing Platform account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log('✅ Reset email sent successfully!');
    res.status(200).json({ success: true, message: 'If that email exists in our system, a reset link has been sent.' });

  } catch (error) {
    // 🔥 THIS LOGS THE EXACT ERROR TO RENDER SO YOU CAN SEE IT 🔥
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

    // Hash the token from the URL to compare with database
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and check expiry
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > ?',
      [resetTokenHash, new Date()]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = users[0];

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token fields
    await db.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      [password_hash, user.id]
    );

    console.log(`✅ Password reset successfully for user ID: ${user.id}`);
    res.status(200).json({ success: true, message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// ==================== VERIFY EMAIL ====================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; // or req.body depending on how you send it

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [users] = await db.query(
      'SELECT * FROM users WHERE verification_token = ? AND verification_token_expiry > ?',
      [verificationTokenHash, new Date()]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    const user = users[0];

    await db.query(
      'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expiry = NULL WHERE id = ?',
      [user.id]
    );

    res.status(200).json({ success: true, message: 'Email verified successfully' });

  } catch (error) {
    console.error('❌ Verify Email Error:', error);
    res.status(500).json({ success: false, message: 'Server error during email verification' });
  }
};

// ==================== GET CURRENT USER (ME) ====================
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const [users] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.matric_number, u.staff_id, u.profile_image, u.is_active, u.email_verified, d.name as department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.id = ?`, 
      [req.user.id]
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