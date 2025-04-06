// This file handles the connection to the MongoDB database using Mongoose.
// It exports a function `connectToDatabase` that establishes the connection.
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-links';

let isConnected = false; // Track the connection status

export const connectToDatabase = async () => {
  if (isConnected) {
    return; // If already connected, skip reconnection
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};