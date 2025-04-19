import Share from '~/server/models/Share';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { itemId, userIds } = body;

  if (!itemId || !userIds || !Array.isArray(userIds)) {
    return { success: false, error: 'Collection ID and User IDs are required' };
  }

  try {
    connectToDatabase();

    const shares = userIds.map((userId) => ({
      itemId: itemId,
      userId,
      type: 'Collection',
    }));

    await Share.insertMany(shares);
    return { success: true, message: 'Collection shared successfully' };
  } catch (error) {
    console.error('Error sharing collection:', error);
    return { success: false, error: 'Failed to share collection' };
  }
});