import { defineEventHandler, readBody } from 'h3';
import Link from '~/server/models/Links';
import { connectToDatabase } from '~/server/utils/db';


interface CreateLinkResponse {
  success: boolean;
  link?: any;
  error?: string;
}

export default defineEventHandler(async (event): Promise<CreateLinkResponse> => {
   // Ensure MongoDB connection is established
   await connectToDatabase();


  const { url, title, description, thumbnail, domain, createdBy } = await readBody(event);

  try {
    const link = new Link({
      url,
      title,
      description,
      thumbnail,
      domain,
      createdBy,
    });
    await link.save();
    return { success: true, link };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});