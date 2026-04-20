const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Joi = require('joi');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(18).required(),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        email: Joi.string().email().required(),
        dob: Joi.date().required(),
        password: Joi.string().min(6).required(),
        drivingLicenseNo: Joi.string().required(),
        mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        return next(new Error(error.details[0].message));
    }

    const { name, age, gender, email, dob, password, drivingLicenseNo, mobileNo } = req.body;

    try {
        const userExists = await User.findOne({
            $or: [
                { email },
                { drivingLicenseNo },
                { mobileNo }
            ]
        });

        if (userExists) {
            res.status(400);
            if (userExists.email === email) {
                return next(new Error('User already exists with this email'));
            }

            if (userExists.drivingLicenseNo === drivingLicenseNo) {
                return next(new Error('Driving license number already registered'));
            }

            if (userExists.mobileNo === mobileNo) {
                return next(new Error('Mobile number already registered'));
            }

            return next(new Error('User already exists'));
        }

        const user = await User.create({
            name,
            age,
            gender,
            email,
            dob,
            password,
            drivingLicenseNo,
            mobileNo,
            role: 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                age: user.age,
                gender: user.gender,
                email: user.email,
                dob: user.dob,
                drivingLicenseNo: user.drivingLicenseNo,
                mobileNo: user.mobileNo,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            next(new Error('Invalid user data'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        return next(new Error(error.details[0].message));
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                age: user.age,
                gender: user.gender,
                email: user.email,
                dob: user.dob,
                drivingLicenseNo: user.drivingLicenseNo,
                mobileNo: user.mobileNo,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            next(new Error('Invalid email or password'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, getUsers };
