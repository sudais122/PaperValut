const express = require('express');
const router = express.Router();

const {
  registerUser,
  sendOtp,
  verifyOtp,
  loginUser,
  resetPassword
} = require('../controller/authController');

// Routes
router.post('/register', registerUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

// ✅ Test route (IMPORTANT)
router.get('/', (req, res) => {
  res.send('Auth route working');
});

module.exports = router;