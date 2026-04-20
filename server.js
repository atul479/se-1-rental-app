require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const seedVehicles = require('./seed');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize App
const app = express();

// Connect Database
connectDB().then(() => {
    seedVehicles();
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('Vehicle Rental API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
