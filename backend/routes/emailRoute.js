const express = require('express')
const { sendEmail } = require('../controllers/auth')

const router = express.Router()

router.route('/sendEmail').post(sendEmail)

module.exports = router