const express = require('express')
const { protect, authorize } = require('../middleware/auth')
const {likeCompany, unlikeCompany} = require('../controllers/favoriting')
const router = express.Router({mergeParams:true})

router.route("/").post(protect, authorize("admin","user"), likeCompany)
router.route("/:fid").delete(protect, authorize("admin","user"), unlikeCompany)

module.exports = router