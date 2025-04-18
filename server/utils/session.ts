import { getCookie } from 'h3';
import jwt from 'jsonwebtoken';

export const getSession = (event: any) => {
  try {
    // Retrieve the session token from cookies
    const token = getCookie(event, 'session');
    if (!token) {
      throw new Error('Unauthorized: No session token found');
    }

    // Decode the token to get the user details
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decodedToken = jwt.verify(token, secret);

    return decodedToken; // Contains user details (id, username, email)
  } catch (error) {
    console.error('Error retrieving session:', error);
    throw new Error('Unauthorized: Invalid session token');
  }
};