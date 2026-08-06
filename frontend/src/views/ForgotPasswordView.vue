const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        // Security best practice: Always return success to prevent email enumeration attacks
        if (users.length === 0) {
            return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetTokenHash, resetTokenExpiry, user.id]
        );

        const frontendUrl = process.env.FRONTEND_URL || 'https://unicross-material-platform.vercel.app';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // ✅ USE RESEND API (HTTPS) INSTEAD OF NODEMAILER (SMTP)
        await resend.emails.send({
            from: 'UNICROSS Platform <onboarding@resend.dev>', 
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.full_name},</p>
                    <p>We received a request to reset your password for your UNICROSS Material Platform account. Click the button below to create a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">Reset Password</a>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                </div>
            `
        });

        res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('❌ FORGOT PASSWORD ERROR:', error);
        res.status(500).json({ success: false, message: 'Server error while processing password reset.' });
    }
};