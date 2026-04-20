const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Joi = require('joi');

// @desc    Simulate payment process
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res, next) => {
    const schema = Joi.object({
        bookingId: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        return next(new Error(error.details[0].message));
    }

    const { bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            res.status(404);
            return next(new Error('Booking not found'));
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            return next(new Error('Not authorized to pay for this booking'));
        }

        if (booking.status === 'cancelled') {
            res.status(400);
            return next(new Error('Cancelled booking cannot be paid'));
        }

        const existingPayment = await Payment.findOne({ booking: bookingId, status: 'success' });
        if (existingPayment) {
            res.status(400);
            return next(new Error('Payment already completed for this booking'));
        }

        // Mock payment logic
        const payment = await Payment.create({
            booking: bookingId,
            amount: booking.totalPrice,
            status: 'success',
            transactionId: 'TXN_' + Math.random().toString(36).slice(2, 11).toUpperCase()
        });

        if (payment.status === 'success') {
            booking.status = 'confirmed';
            await booking.save();
        }

        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.find({}).populate({
            path: 'booking',
            populate: { path: 'user vehicle', select: 'name email' }
        });
        res.json(payments);
    } catch (error) {
        next(error);
    }
};

module.exports = { processPayment, getAllPayments };
