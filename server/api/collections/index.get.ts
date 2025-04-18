import { defineEventHandler } from 'h3';
import { ref } from 'vue';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const session = getSession(event);
  const userId = typeof session !== 'string' && session.id ? session.id : null;

  if (!userId) {
    throw new Error('Invalid session: user ID not found');
  }

  try {
    const collections = await Collection.find({ createdBy: userId }).select('_id title description coverImage links').populate('links').sort({ createdAt: -1 });
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