import Share from '~/server/models/Share';
import Link from '~/server/models/Links';
import Collection from '~/server/models/Collection';
import { getSession } from '~/server/utils/session';
import { connect } from 'http2';

export default defineEventHandler(async (event) => {
  try {
    const session = getSession(event);
    const userId = typeof session !== 'string' && session.id ? session.id : null;

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    connectToDatabase(); // Ensure the database connection is established

    const sharedItems = await Share.find({ userId })
      .populate('itemId') // Dynamically populate either Link or Collection
      .populate('userId', 'username'); // Populate the user details

    return { success: true, sharedItems };
  } catch (error) {
    console.error('Error fetching shared items:', error);
    return { success: false, error: 'Failed to fetch shared items' };
  }
});