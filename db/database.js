const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database connection
const dbPath = path.resolve(__dirname, 'rental_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTable();
    }
});

// Create tables
function createTable() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            dob DATE NOT NULL,
            fathers_name TEXT NOT NULL,
            user_type TEXT DEFAULT 'customer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Items Table (Cars/Bikes)
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            price_per_day REAL NOT NULL,
            image_url TEXT,
            status TEXT DEFAULT 'available'
        )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_id INTEGER,
            booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(item_id) REFERENCES items(id)
        )`);

        // Seed initial items if empty
        db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
            if (row.count === 0) {
                const stmt = db.prepare("INSERT INTO items (name, type, price_per_day, image_url) VALUES (?, ?, ?, ?)");
                stmt.run("Mountain Bike", "Bike", 15.0, "🚲");
                stmt.run("Tesla Model 3", "Car", 80.0, "🚗");
                stmt.run("Road Bicycle", "Bike", 10.0, "🚴");
                stmt.run("Toyota Camry", "Car", 45.0, "🚙");
                stmt.run("Honda Civic", "Car", 40.0, "🏎️");
                stmt.run("Electric Scooter", "Bike", 20.0, "🛴");
                stmt.finalize();
                console.log('Seeded initial rental items.');
            }
        });
    });
}

module.exports = db;
