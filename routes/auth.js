const express = require('express');
const {register,login,logout,getMe} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/getMe',protect,getMe);
router.post('/login',login);
router.post('/register',register);
router.post('/logout',logout);

module.exports = router;