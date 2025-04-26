import bcrypt from 'bcrypt';
import { setCookie } from 'h3';
import jwt from 'jsonwebtoken';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Read the request body
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required',
    });
  }

  try {
    // Ensure the database connection is established
    connectToDatabase();

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    // Set the user session
    await setUserSession(event, {
      userId: user._id,
      username: user.username,
      password: user.password,
      email: user.email,
      loggedIn: true,
    })

    // Create a session token (JWT)
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      secret,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Set the session token in a cookie
    setCookie(event, 'session', token, {
      httpOnly: true, // Prevent client-side access to the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Prevent CSRF attacks
      path: '/', // Cookie is accessible across the entire site
      maxAge: 60 * 60 * 24, // Cookie expires in 1 day
    });

    return {
      success: true,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('Error during login:', error);
    throw createError({
      statusCode: 500,
      message: 'An error occurred during login',
    });
  }
});