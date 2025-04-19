import Link from '~/server/models/Links';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { linkIds } = body;

    if (!linkIds || !Array.isArray(linkIds)) {
      return { success: false, error: 'Invalid or missing link IDs' };
    }

    connectToDatabase();
    
    // Fetch links by their IDs
    const links = await Link.find({ _id: { $in: linkIds } });

    return { success: true, links };
  } catch (error) {
    console.error('Error fetching links by IDs:', error);
    return { success: false, error: 'Failed to fetch links' };
  }
});