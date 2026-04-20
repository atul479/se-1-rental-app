const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const Joi = require('joi');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
    const schema = Joi.object({
        vehicleId: Joi.string().required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        return next(new Error(error.details[0].message));
    }

    const { vehicleId, startDate, endDate } = req.body;

    try {
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle || !vehicle.availability) {
            res.status(400);
            return next(new Error('Vehicle not available'));
        }

        // Check for overlapping bookings
        const overlapping = await Booking.findOne({
            vehicle: vehicleId,
            status: { $ne: 'cancelled' },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlapping) {
            res.status(400);
            return next(new Error('Vehicle already booked for these dates'));
        }

        // Calculate price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = diffDays * vehicle.pricePerDay;

        const booking = await Booking.create({
            user: req.user._id,
            vehicle: vehicleId,
            startDate,
            endDate,
            totalPrice
        });

        res.status(201).json(booking);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).populate('vehicle', 'name type');
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({}).populate('user', 'name email').populate('vehicle', 'name type');
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                res.status(401);
                return next(new Error('Not authorized to cancel this booking'));
            }

            booking.status = 'cancelled';
            const updatedBooking = await booking.save();
            res.json(updatedBooking);
        } else {
            res.status(404);
            next(new Error('Booking not found'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getAllBookings,
    cancelBooking
};
