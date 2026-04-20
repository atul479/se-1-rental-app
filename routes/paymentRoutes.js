const express = require('express');
const router = express.Router();
const { processPayment, getAllPayments } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getAllPayments)
    .post(protect, processPayment);

module.exports = router;
