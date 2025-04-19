import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const query = getQuery(event).query as string;

  if (!query) {
    return { success: false, error: 'Query parameter is required' };
  }

  try {
    connectToDatabase();
    const users = await User.find({ username: { $regex: query, $options: 'i' } }).select('_id username');
    return { success: true, users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error: 'Failed to search users' };
  }
});