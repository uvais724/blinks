import { defineEventHandler } from 'h3';
import Link from '~/server/models/Links';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const { id } = event.context.params || {};

  try {
    // Delete the link from the database
    const deletedLink = await Link.findByIdAndDelete(id);

    if (!deletedLink) {
      return { success: false, error: 'Link not found.' };
    }

    // Remove the link from any associated collections
    await Collection.updateMany(
      { links: id },
      { $pull: { links: id } }
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting link:', error);
    return { success: false, error: 'Failed to delete link.' };
  }
});