const bcrypt        = require('bcryptjs');
const { v4: uuid }  = require('uuid');
const { readFile, writeFile } = require('../config/filestore');
const generateToken           = require('../utils/enerateToken.js');

// ── REGISTER ──────────────────────────────────────────
// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, studentId, department } = req.body;

    // 1. Load existing users from file
    const users = readFile('users.json');

    // 2. Check if email already taken
    const exists = users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // 3. Hash the password — never store plain text
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Build new user object
    const newUser = {
      id:         uuid(),              // unique ID e.g "a1b2c3d4-..."
      name:       name.trim(),
      email:      email.toLowerCase().trim(),
      password:   hashedPassword,      // hashed, never plain
      studentId:  studentId  || '',
      department: department || '',
      role:       'student',
      uploads:    [],                  // paper IDs they uploaded
      downloads:  [],                  // paper IDs they downloaded
      createdAt:  new Date().toISOString()
    };

    // 5. Add to array and save back to file
    users.push(newUser);
    const saved = writeFile('users.json', users);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save user. Please try again.'
      });
    }

    // 6. Generate JWT token using the new user's ID
    const token = generateToken(newUser.id);

    // 7. Send response — strip password before sending
    const { password: _removed, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: safeUser
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = { registerUser };