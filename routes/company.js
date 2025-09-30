const express = require('express');
const {getCompanies,addCompany,deleteCompany} = require('../controllers/company');
const {protect,authorize} = require('../middleware/auth');
const router = express.Router();

router.route('/')
    .get(protect,authorize('user','admin'),getCompanies)
    .post(protect,authorize('admin'),addCompany);

router.route('/:id')
    .delete(protect,authorize('admin'),deleteCompany);

module.exports = router;