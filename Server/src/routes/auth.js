const express              = require('express');
const router               = express.Router();
const { registerUser }     = require('../controller/authController');
const { validateRegister } = require('../middlewares/validate');

// POST /api/auth/register
router.post('/register', validateRegister, registerUser);

module.exports = router;