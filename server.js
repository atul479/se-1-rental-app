require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db/database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'se1_rental_secret';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Register Route
app.post('/api/auth/register', (req, res) => {
    const { full_name, email, phone, password, dob, fathers_name, user_type } = req.body;

    // Validate input
    if (!full_name || !email || !password || !phone || !dob || !fathers_name) {
        return res.status(400).json({ error: 'Please provide all required fields (Name, Email, Phone, Password, DOB, Fathers Name).' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const sql = `INSERT INTO users (full_name, email, password, phone, dob, fathers_name, user_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [full_name, email, hashedPassword, phone, dob, fathers_name, user_type || 'customer'];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email already exists.' });
            }
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        res.status(201).json({ message: 'User registered successfully!', id: this.lastID });
    });
});

// Login Route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    const params = [email];

    db.get(sql, params, (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Compare password
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, user_type: user.user_type },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { id: user.id, full_name: user.full_name, email: user.email, user_type: user.user_type }
        });
    });
});

// Fetch all rental items
app.get('/api/rentals', (req, res) => {
    db.all("SELECT * FROM items", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create a booking
app.post('/api/bookings', (req, res) => {
    const { user_id, item_id } = req.body;
    if (!user_id || !item_id) return res.status(400).json({ error: "Missing information." });

    db.run("INSERT INTO bookings (user_id, item_id) VALUES (?, ?)", [user_id, item_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Booking successful!", id: this.lastID });
    });
});

// Fetch user bookings
app.get('/api/bookings/:user_id', (req, res) => {
    const sql = `
        SELECT b.id, i.name, i.type, i.image_url, b.booking_date 
        FROM bookings b 
        JOIN items i ON b.item_id = i.id 
        WHERE b.user_id = ?
    `;
    db.all(sql, [req.params.user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Root route redirects to login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
