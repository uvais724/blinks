import { defineEventHandler } from 'h3';
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

  try {
    const collections = await Collection.find({ createdBy: userId.value?._id }).select('_id title description coverImage links');
    console.log('collections', collections);
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