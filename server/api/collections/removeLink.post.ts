import Collection from '~/server/models/Collection';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { collectionId, linkId } = body;

    if (!collectionId || !linkId) {
      return { success: false, error: 'Collection ID and Link ID are required.' };
    }

    connectToDatabase();
    
    // Update the collection's links array by removing the specified link
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { $pull: { links: linkId } },
      { new: true }
    );

    if (!updatedCollection) {
      return { success: false, error: 'Collection not found.' };
    }

    return { success: true, collection: updatedCollection };
  } catch (error) {
    console.error('Error removing link from collection:', error);
    return { success: false, error: 'Failed to remove link from collection.' };
  }
});