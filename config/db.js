const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;

        // Use In-Memory DB if standard one is not available or for demo
        if (process.env.NODE_ENV === 'development' || !mongoUri) {
            console.log('Starting In-Memory MongoDB for demo...');
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
