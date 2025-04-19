import Share from '~/server/models/Share';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { itemId, userIds } = body;

  if (!itemId || !userIds || !Array.isArray(userIds)) {
    return { success: false, error: 'Link ID and User IDs are required' };
  }

  try {
    const shares = userIds.map((userId) => ({
      itemId: itemId,
      userId,
      type: 'Link',
    }));

    await Share.insertMany(shares);
    return { success: true, message: 'Link shared successfully' };
  } catch (error) {
    console.error('Error sharing link:', error);
    return { success: false, error: 'Failed to share link' };
  }
});