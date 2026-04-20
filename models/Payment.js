const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Booking'
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed'],
        required: true
    },
    transactionId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
