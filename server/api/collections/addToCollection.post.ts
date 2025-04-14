import { defineEventHandler, readBody } from 'h3';
import { ref } from 'vue';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const userId = ref<{ _id: string } | null>({
    _id: '67fa64158139571853da6676', // Use a plain string instead of ObjectId
  });

  // const userId = event.context.auth?.userId; // Replace with your authentication logic

  // if (!userId) {
  //   return {
  //     success: false,
  //     error: 'User not authenticated.',
  //   };
  // }

  const { collectionId, linkId } = await readBody(event);

  if (!collectionId || !linkId) {
    return {
      success: false,
      error: 'Collection ID and Link ID are required.',
    };
  }

  console.log('userId', userId.value?._id);
  console.log('collectionId', collectionId);

  try {
    const collection = await Collection.findOne({ _id: collectionId, createdBy: userId.value?._id });
    console.log('collection to be saved', collection);

    if (!collection) {
      return {
        success: false,
        error: 'Collection not found or does not belong to the user.',
      };
    }

    if (collection.links.includes(linkId)) {
      return {
        success: false,
        error: 'Link is already in the collection.',
      };
    }

    collection.links.push(linkId);
    await collection.save();

    return {
      success: true,
      message: 'Link added to collection successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An error occurred while adding the link to the collection.',
    };
  }
});