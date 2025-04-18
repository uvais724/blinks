import { defineEventHandler, readBody } from 'h3';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';
import { ref } from 'vue';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const session = getSession(event);
  const userId = typeof session !== 'string' && session.id ? session.id : null;

  if (!userId) {
    throw new Error('Invalid session: user ID not found');
  }

  const { name, description, linkId } = await readBody(event);

  if (!name) {
    return {
      success: false,
      error: 'Collection name is required.',
    };
  }

  try {
    const newCollection = new Collection({
      title: name,
      description: description,
      createdBy: userId,
      links: linkId ? [linkId] : [],
    });

    await newCollection.save();

    return {
      success: true,
      message: 'Collection created successfully.',
      collection: newCollection,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred while creating the collection.',
    };
  }
});