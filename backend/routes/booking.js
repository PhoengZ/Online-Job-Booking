const express = require('express');
const { createBooking,cancelBooking,getBookings,getBooking,editBooking} = require('../controllers/booking');
const { authorize, protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
    .get(protect,authorize('user','admin'),getBookings)
    .post(protect,authorize('user'),createBooking);

router.route('/:id')
    .get(protect,authorize('admin'),getBooking)
    .put(protect,authorize('user','admin'),editBooking)
    .delete(protect,authorize('user','admin'),cancelBooking)

module.exports = router;