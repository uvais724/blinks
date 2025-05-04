import bcrypt from 'bcrypt';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Read the request body
  const { username, email, password } = body;

  // Validate input
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'All fields are required',
    });
  }

  if (username.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Username cannot be empty or whitespace-only',
    });
  }

  try {
    connectToDatabase();
    // Check if the email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'Email or username already exists',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return {
      success: true,
      message: 'User registered successfully',
    };
  } catch (error) {
    console.error('Error during registration:', error);
    throw createError({
      statusCode: 500,
      message: 'An error occurred during registration',
    });
  }
});