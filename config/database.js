const mongoose = require('mongoose');
require('dotenv').config();

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    const mongoURI = process.env.MONGODB_URI ;
    
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(' MongoDB connected successfully');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error(' Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Handle process termination
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log(' MongoDB connection closed due to app termination');
        process.exit(0);
      });
    });
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = new Database();