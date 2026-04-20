const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Car', 'Bike', 'Scooter', 'Truck']
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
