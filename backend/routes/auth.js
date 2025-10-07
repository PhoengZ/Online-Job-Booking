const express = require('express');
const {register,login,logout,getMe, sendEmailToVerify, verifyEmail} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/me',protect,getMe);
router.get('/logout',logout);
router.post('/login',login);
router.post('/register',register);
router.post('/sendingOTP', sendEmailToVerify)
router.put('/verify_otp', verifyEmail)

module.exports = router;