import { defineEventHandler, readBody } from 'h3';
import Collection from '~/server/models/Collection';
import { connectToDatabase } from '~/server/utils/db';
import { ref } from 'vue';

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
      createdBy: userId.value?._id, // Use the userId from authentication
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