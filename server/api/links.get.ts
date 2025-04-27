import { defineEventHandler } from 'h3';
import { getSession } from '~/server/utils/session';
import Link from '../models/Links';
import { connectToDatabase } from '../utils/db';
import User from '../models/User';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase(); // Ensure MongoDB connection is established


    User
    // Retrieve the logged-in user's session
    const session = getSession(event);
    const userId = typeof session !== 'string' && session.id ? session.id : null;

    if (!userId) {
      throw new Error('Invalid session: user ID not found');
    }

    // Fetch links created by the logged-in user
    const links = await Link.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username avatarUrl');

    return { success: true, links };
  } catch (error: any) {
    console.error('Error fetching links:', error);
    return { success: false, error: error.message };
  }
});