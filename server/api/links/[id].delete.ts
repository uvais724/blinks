import { defineEventHandler } from 'h3';
import Link from '~/server/models/Links';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  // Ensure MongoDB connection is established
  await connectToDatabase();

  // Extract the link ID from the request URL
  const { id } = event.context.params || {};

  try {
    // Find and delete the link by ID
    const deletedLink = await Link.findByIdAndDelete(id);

    if (!deletedLink) {
      return {
        success: false,
        error: 'Link not found',
      };
    }

    return {
      success: true,
      message: 'Link deleted successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred while deleting the link',
    };
  }
});