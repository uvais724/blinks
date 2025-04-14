import { defineEventHandler } from 'h3';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const { id } = event.context.params || {};

  try {
    const deletedCollection = await Collection.findByIdAndDelete(id);

    if (!deletedCollection) {
      return { success: false, error: 'Collection not found.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting collection:', error);
    return { success: false, error: 'Failed to delete collection.' };
  }
});