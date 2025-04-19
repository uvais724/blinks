import Share from '~/server/models/Share';
import Link from '~/server/models/Links';
import Collection from '~/server/models/Collection';
import { getSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
  try {
    const session = getSession(event);
    const userId = typeof session !== 'string' && session.id ? session.id : null;

    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    connectToDatabase();

    const sharedItems = await Share.find({ userId });

    const links = await Link.find({ _id: { $in: sharedItems.filter((item) => item.type === 'link').map((item) => item.itemId) } });
    const collections = await Collection.find({ _id: { $in: sharedItems.filter((item) => item.type === 'collection').map((item) => item.itemId) } });

    return { success: true, sharedItems: [...links, ...collections] };
  } catch (error) {
    console.error('Error fetching shared items:', error);
    return { success: false, error: 'Failed to fetch shared items' };
  }
});