import bcrypt from 'bcrypt';
import User from '~/server/models/User';

export default defineEventHandler(async (event) => {
    const body = await readBody(event); // Read the request body
    const { email, password } = body;

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            message: 'Username and password are required',
        });
    }


    try {
        // Find the user in the database
        connectToDatabase(); // Ensure the database connection is established
        const user = await User.findOne({ email });
        if (!user) {
          throw createError({
            statusCode: 401,
            message: 'Invalid username or password',
          });
        }
    
        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw createError({
            statusCode: 401,
            message: 'Invalid username or password',
          });
        }

        await setUserSession(event, {
            id: user._id,
            username: user.username,
            email: user.email,
            loggedIn: true,
        })

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
})