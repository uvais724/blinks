import { defineEventHandler } from 'h3';
import User from '../models/User'; // Ensure User model is imported correctly
import Link from '../models/Links';
import { connectToDatabase } from '../utils/db'; // Ensure database connection is established
import mongoose from 'mongoose'; // Import mongoose

interface LinkResponse {
  success: boolean;
  links?: any[];
  error?: string;
}

export default defineEventHandler(async (event): Promise<LinkResponse> => {
  try {
    await connectToDatabase(); // Ensure MongoDB connection is established

    // Explicitly reference the User model to ensure it is registered
    User
    // Fetch links, sorted by newest first, and populate the 'createdBy' field
    const links = await Link.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username avatarUrl'); // Populate 'username' and 'avatarUrl' from User

    return { success: true, links };
  } catch (error: any) {
    console.error('Error fetching links:', error);
    return { success: false, error: error.message };
  }
});