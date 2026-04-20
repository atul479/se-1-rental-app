const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getAllBookings,
    cancelBooking
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getAllBookings)
    .post(protect, createBooking);

router.get('/mybookings', protect, getUserBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
