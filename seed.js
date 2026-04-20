const Vehicle = require('./models/Vehicle');

const seedVehicles = async () => {
    const count = await Vehicle.countDocuments();
    if (count === 0) {
        const vehicles = [
            { name: 'Tesla', model: 'Model S', type: 'Car', pricePerDay: 150, description: 'Premium Electric' },
            { name: 'BMW', model: 'M4', type: 'Car', pricePerDay: 200, description: 'High Performance' },
            { name: 'Ducati', model: 'Panigale V4', type: 'Bike', pricePerDay: 120, description: 'Superbike' },
            { name: 'TVS', model: 'Ntorq 125', type: 'Scooter', pricePerDay: 45, description: 'City Scooty' },
            { name: 'Tata', model: '407 Gold SFC', type: 'Truck', pricePerDay: 220, description: 'Light Commercial Truck' },
            { name: 'Range Rover', model: 'Velar', type: 'Car', pricePerDay: 180, description: 'Luxury SUV' },
            { name: 'Honda', model: 'Civic', type: 'Car', pricePerDay: 50, description: 'Reliable Sedan' }
        ];
        await Vehicle.insertMany(vehicles);
        console.log('Database Seeded with initial vehicles!');
    }
};

module.exports = seedVehicles;
