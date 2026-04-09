// Server/controllers/authController.js
const bcrypt       = require('bcryptjs');
const { v4: uuid } = require('uuid');
const nodemailer   = require('nodemailer');
const { readFile, writeFile } = require('../config/fileStore');
const generateToken           = require('../utils/generateToken.js.js');


/* ═══════════════════════════════════════════
   EMAIL HELPER
   USE_FAKE_OTP=true  → prints OTP in terminal (dev)
═══════════════════════════════════════════ */
async function sendOtpEmail(toEmail, otp, reason) {
  if (process.env.USE_FAKE_OTP === 'true' || !process.env.EMAIL_USER) {
    console.log('\n─────────────────────────────────');
    console.log(`📧  OTP (dev mode — no real email sent)`);
    console.log(`    To:     ${toEmail}`);
    console.log(`    Reason: ${reason}`);
    console.log(`    Code:   ${otp}`);
    console.log('─────────────────────────────────\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const subject = reason === 'forgot-password'
    ? 'PaperVault — Reset Your Password'
    : 'PaperVault — Verify Your Email';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0B1F3A;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#132D52,#1A3A6B);padding:28px 32px;text-align:center;border-bottom:2px solid #E6A817">
        <h1 style="font-family:Georgia,serif;color:#fff;margin:0;font-size:1.5rem">Paper<span style="color:#E6A817">Vault</span></h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#fff;font-size:1.1rem;margin-bottom:8px">${reason === 'forgot-password' ? '🔐 Reset your password' : '✉️ Verify your email'}</h2>
        <p style="color:#8FA0B4;font-size:.9rem;margin-bottom:24px">Your 6-digit code — expires in <strong style="color:#F5C84A">10 minutes</strong>.</p>
        <div style="background:#132D52;border:1px solid rgba(230,168,23,.3);border-radius:14px;padding:24px;text-align:center;margin-bottom:24px">
          <div style="letter-spacing:16px;font-size:2.4rem;font-weight:700;color:#E6A817;font-family:monospace">${otp}</div>
        </div>
        <p style="color:#5A6A7E;font-size:.78rem">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"PaperVault" <${process.env.EMAIL_USER}>`,
    to:   toEmail, subject, html
  });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isExpired(createdAt) {
  return Date.now() - new Date(createdAt).getTime() > 10 * 60 * 1000;
}


/* ── 1. REGISTER ── POST /api/auth/register ── */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, studentId, department } = req.body;
    const users = readFile('users.json');

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return res.status(409).json({ success: false, message: 'An account with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id:         uuid(),
      name:       name.trim(),
      email:      email.toLowerCase().trim(),
      password:   hashedPassword,
      studentId:  studentId  || '',
      department: department || '',
      role:       'student',
      isVerified: false,
      otp:        null,
      uploads:    [],
      downloads:  [],
      createdAt:  new Date().toISOString()
    };

    users.push(newUser);
    const saved = writeFile('users.json', users);
    if (!saved) return res.status(500).json({ success: false, message: 'Failed to save user' });

    const { password: _pw, ...safeUser } = newUser;
    return res.status(201).json({ success: true, message: 'Account created. Check your email for the OTP.', user: safeUser });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


/* ── 2. SEND OTP ── POST /api/auth/send-otp ── */
const sendOtp = async (req, res) => {
  try {
    const { email, reason = 'register' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const users = readFile('users.json');
    const idx   = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return res.status(404).json({ success: false, message: 'No account found with this email' });

    const otp = generateOtp();
    users[idx].otp = { code: otp, reason, createdAt: new Date().toISOString() };
    writeFile('users.json', users);

    await sendOtpEmail(email, otp, reason);
    return res.json({ success: true, message: `OTP sent to ${email}` });

  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send OTP: ' + err.message });
  }
};


/* ── 3. VERIFY OTP ── POST /api/auth/verify-otp ── */
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required' });

    const users = readFile('users.json');
    const idx   = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return res.status(404).json({ success: false, message: 'No account found' });

    const user = users[idx];

    if (!user.otp) return res.status(400).json({ success: false, message: 'No OTP was requested. Request a new one.' });

    if (isExpired(user.otp.createdAt)) {
      users[idx].otp = null;
      writeFile('users.json', users);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp.code !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });
    }

    // ✅ correct
    const reason          = user.otp.reason;
    users[idx].otp        = null;
    users[idx].isVerified = true;
    writeFile('users.json', users);

    if (reason === 'forgot-password') {
      return res.json({ success: true, message: 'OTP verified. You can now reset your password.', reason });
    }

    const token = generateToken(user.id);
    const { password: _pw, otp: _otp, ...safeUser } = users[idx];
    return res.json({ success: true, message: 'Email verified!', token, user: safeUser, reason });

  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


/* ── 4. LOGIN ── POST /api/auth/login ── */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readFile('users.json');
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)  return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ success: false, needsVerify: true, email: user.email, message: 'Please verify your email before logging in.' });
    }

    const token = generateToken(user.id);
    const { password: _pw, otp: _otp, ...safeUser } = user;
    return res.json({ success: true, message: 'Logged in successfully', token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


/* ── 5. RESET PASSWORD ── POST /api/auth/reset-password ── */
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password are required' });
    if (newPassword.length < 8)  return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const users = readFile('users.json');
    const idx   = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return res.status(404).json({ success: false, message: 'No account found' });
    if (!users[idx].isVerified) return res.status(403).json({ success: false, message: 'Email not verified. Complete OTP verification first.' });

    const salt          = await bcrypt.genSalt(10);
    users[idx].password = await bcrypt.hash(newPassword, salt);
    users[idx].updatedAt = new Date().toISOString();
    writeFile('users.json', users);

    return res.json({ success: true, message: 'Password reset successfully! You can now log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = { registerUser, sendOtp, verifyOtp, loginUser, resetPassword };