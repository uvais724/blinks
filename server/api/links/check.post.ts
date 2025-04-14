import { defineEventHandler, readBody } from 'h3';
import Link from '~/server/models/Links';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  await connectToDatabase();

  const { title } = await readBody(event);

  if (!title) {
    return { success: false, error: 'Title is required.' };
  }

  const existingLink = await Link.findOne({ title });

  return {
    success: true,
    exists: !!existingLink, // Return true if the link exists, false otherwise
  };
});