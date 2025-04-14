import { defineEventHandler } from 'h3';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const userId = event.context.auth?.userId; // Replace with your authentication logic
  if (!userId) {
    return {
      success: false,
      error: 'User not authenticated.',
    };
  }

  try {
    const collections = await Collection.find({ user: userId }).select('_id name');
    return {
      success: true,
      collections,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred while fetching collections.',
    };
  }
});