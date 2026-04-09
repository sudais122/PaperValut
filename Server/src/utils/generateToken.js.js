// Server/utils/generateToken.js
const jwt = require('jsonwebtoken');

// Creates a signed JWT token that expires in 7 days.
// The token contains the user's ID — used to identify
// them on protected routes later.
const generateToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

module.exports = generateToken;