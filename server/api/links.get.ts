import { defineEventHandler } from 'h3';
import Link from '../models/Links';


interface LinkResponse {
  success: boolean;
  links?: any[];
  error?: string;
}

export default defineEventHandler(async (event): Promise<LinkResponse> => {
  try {
    connectToDatabase(); // Ensure MongoDB connection is established
    
    // Fetch links, sorted by newest first, and populate the 'createdBy' field
    const links = await Link.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username avatarUrl');
      
    return { success: true, links };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});