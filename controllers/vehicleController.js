const Vehicle = require('../models/Vehicle');
const Joi = require('joi');

// @desc    Get all vehicles with search/pagination
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res, next) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {};

        const type = req.query.type ? { type: req.query.type } : {};
        const availability = req.query.availability === 'true'
            ? { availability: true }
            : req.query.availability === 'false'
                ? { availability: false }
                : {};
        const pricePerDay = req.query.maxPrice ? { pricePerDay: { $lte: Number(req.query.maxPrice) } } : {};
        const sort = req.query.sort === 'priceLow'
            ? { pricePerDay: 1 }
            : req.query.sort === 'priceHigh'
                ? { pricePerDay: -1 }
                : { createdAt: -1 };

        const count = await Vehicle.countDocuments({ ...keyword, ...type, ...availability, ...pricePerDay });
        const vehicles = await Vehicle.find({ ...keyword, ...type, ...availability, ...pricePerDay })
            .sort(sort)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ vehicles, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404);
            next(new Error('Vehicle not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const createVehicle = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        model: Joi.string().required(),
        type: Joi.string().valid('Car', 'Bike', 'Scooter', 'Truck').required(),
        pricePerDay: Joi.number().required(),
        description: Joi.string(),
        image: Joi.string()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        return next(new Error(error.details[0].message));
    }

    try {
        const vehicle = new Vehicle(req.body);
        const createdVehicle = await vehicle.save();
        res.status(201).json(createdVehicle);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            vehicle.name = req.body.name || vehicle.name;
            vehicle.model = req.body.model || vehicle.model;
            vehicle.type = req.body.type || vehicle.type;
            vehicle.pricePerDay = req.body.pricePerDay || vehicle.pricePerDay;
            vehicle.availability = req.body.availability !== undefined ? req.body.availability : vehicle.availability;
            vehicle.description = req.body.description || vehicle.description;
            vehicle.image = req.body.image || vehicle.image;

            const updatedVehicle = await vehicle.save();
            res.json(updatedVehicle);
        } else {
            res.status(404);
            next(new Error('Vehicle not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (vehicle) {
            await Vehicle.deleteOne({ _id: vehicle._id });
            res.json({ message: 'Vehicle removed' });
        } else {
            res.status(404);
            next(new Error('Vehicle not found'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
